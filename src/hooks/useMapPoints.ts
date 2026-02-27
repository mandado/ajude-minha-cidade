"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { MapPoint, MapFilters } from "@/types/map";
import type { PointType } from "@/types/database";
import type { Need } from "@/types/database";

const ALL_TYPES: PointType[] = ["shelter", "collection", "distribution", "landslide", "burial"];

// Phase 1: fetch only the points table — appears on screen immediately
async function fetchBasicPoints() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("points")
    .select("*")
    .eq("status", "active");
  if (error) throw error;
  return data ?? [];
}

interface Enrichment {
  needsByPoint: Record<string, Need[]>;
  confirmCounts: Record<string, number>;
  reportCounts: Record<string, number>;
}

// Phase 2: fetch needs + counts in parallel — enriches markers in background
async function fetchEnrichment(pointIds: string[]): Promise<Enrichment> {
  if (pointIds.length === 0) return { needsByPoint: {}, confirmCounts: {}, reportCounts: {} };

  const supabase = createClient();
  const [{ data: needs }, { data: confirmations }, { data: reports }] =
    await Promise.all([
      supabase.from("needs").select("*").in("point_id", pointIds),
      supabase.from("point_confirmations").select("point_id").in("point_id", pointIds),
      supabase.from("point_reports").select("point_id").in("point_id", pointIds),
    ]);

  const needsByPoint = (needs ?? []).reduce<Record<string, Need[]>>((acc, need) => {
    if (!acc[need.point_id]) acc[need.point_id] = [];
    acc[need.point_id].push(need);
    return acc;
  }, {});

  const confirmCounts: Record<string, number> = {};
  for (const c of confirmations ?? []) {
    confirmCounts[c.point_id] = (confirmCounts[c.point_id] ?? 0) + 1;
  }

  const reportCounts: Record<string, number> = {};
  for (const r of reports ?? []) {
    reportCounts[r.point_id] = (reportCounts[r.point_id] ?? 0) + 1;
  }

  return { needsByPoint, confirmCounts, reportCounts };
}

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function useMapPoints() {
  const [filters, setFilters] = useState<MapFilters>({
    types: ALL_TYPES,
  });

  const [cityFilter, setCityFilter] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState("");

  // Query 1: basic points — renders markers as fast as possible
  const { data: rawPoints = [], isLoading } = useQuery({
    queryKey: ["map-points"],
    queryFn: fetchBasicPoints,
    staleTime: 30_000,
  });

  const pointIds = useMemo(() => rawPoints.map((p) => p.id), [rawPoints]);

  // Query 2: enrichment data — runs right after points arrive, in background
  const { data: enrichment } = useQuery({
    queryKey: ["map-points-enrichment", pointIds.length],
    queryFn: () => fetchEnrichment(pointIds),
    enabled: pointIds.length > 0,
    staleTime: 30_000,
  });

  const sevenDaysAgo = useMemo(
    () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    [],
  );

  // Merge basic + enrichment; while enrichment is loading, keep all points visible
  const points = useMemo<MapPoint[]>(() => {
    return rawPoints
      .map((point) => ({
        ...point,
        needs: enrichment?.needsByPoint[point.id] ?? [],
        confirmations_count: enrichment?.confirmCounts[point.id] ?? 0,
        reports_count: enrichment?.reportCounts[point.id] ?? 0,
      }))
      .filter((point) => {
        if (!point.created_by) return true;
        if (point.confirmations_count > 0) return true;
        if (point.created_at > sevenDaysAgo) return true;
        // While enrichment is still loading, keep old points visible temporarily
        if (!enrichment) return true;
        return false;
      });
  }, [rawPoints, enrichment, sevenDaysAgo]);

  const filteredPoints = useMemo(() => {
    const normalizedName = normalize(nameFilter.trim());
    return points.filter((point) => {
      const matchesType = filters.types.includes(point.type);
      const matchesCity = cityFilter.length === 0 || (point.city && cityFilter.includes(point.city));
      const matchesName = !normalizedName || normalize(point.name).includes(normalizedName);
      return matchesType && matchesCity && matchesName;
    });
  }, [points, filters, cityFilter, nameFilter]);

  const toggleType = (type: PointType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const toggleCity = (city: string) => {
    setCityFilter((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  };

  const resetFilters = () => {
    setFilters({ types: ALL_TYPES });
    setCityFilter([]);
    setNameFilter("");
  };

  return {
    points: filteredPoints,
    allPoints: points,
    filters,
    toggleType,
    resetFilters,
    totalPoints: points.length,
    isLoading,
    cityFilter,
    setCityFilter,
    toggleCity,
    nameFilter,
    setNameFilter,
  };
}
