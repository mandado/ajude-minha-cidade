"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { MapPoint, MapFilters } from "@/types/map";
import type { PointType, PriorityLevel } from "@/types/database";
import type { Need } from "@/types/database";

const ALL_TYPES: PointType[] = ["shelter", "collection", "distribution"];
const ALL_PRIORITIES: PriorityLevel[] = ["high", "medium", "low"];

async function fetchPoints(): Promise<MapPoint[]> {
  const supabase = createClient();

  const { data: points, error: pointsError } = await supabase
    .from("points")
    .select("*")
    .eq("status", "active");

  if (pointsError) throw pointsError;
  if (!points) return [];

  const pointIds = points.map((p) => p.id);

  const { data: needs, error: needsError } = await supabase
    .from("needs")
    .select("*")
    .in("point_id", pointIds);

  if (needsError) throw needsError;

  const needsByPoint = (needs ?? []).reduce<Record<string, Need[]>>(
    (acc, need) => {
      if (!acc[need.point_id]) acc[need.point_id] = [];
      acc[need.point_id].push(need);
      return acc;
    },
    {},
  );

  return points.map((point) => ({
    ...point,
    needs: needsByPoint[point.id] ?? [],
  }));
}

export function useMapPoints() {
  const [filters, setFilters] = useState<MapFilters>({
    types: ALL_TYPES,
    priorities: ALL_PRIORITIES,
  });

  const [cityFilter, setCityFilter] = useState<string[]>([]);

  const { data: points = [], isLoading } = useQuery({
    queryKey: ["map-points"],
    queryFn: fetchPoints,
  });

  const filteredPoints = useMemo(() => {
    return points.filter((point) => {
      const matchesType = filters.types.includes(point.type);
      const matchesPriority = filters.priorities.includes(point.priority);
      const matchesCity = cityFilter.length === 0 || (point.city && cityFilter.includes(point.city));
      return matchesType && matchesPriority && matchesCity;
    });
  }, [points, filters, cityFilter]);

  const toggleType = (type: PointType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const togglePriority = (priority: PriorityLevel) => {
    setFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  const toggleCity = (city: string) => {
    setCityFilter((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  };

  const resetFilters = () => {
    setFilters({ types: ALL_TYPES, priorities: ALL_PRIORITIES });
    setCityFilter([]);
  };

  return {
    points: filteredPoints,
    allPoints: points,
    filters,
    toggleType,
    togglePriority,
    resetFilters,
    totalPoints: points.length,
    isLoading,
    cityFilter,
    setCityFilter,
    toggleCity,
  };
}
