"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface GeocodeResult {
  id: string;
  display_name: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  neighborhood: string;
}

export interface GeoSearchResult {
  displayName: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  neighborhood: string;
}

interface GeoSearchProps {
  placeholder?: string;
  onSelect: (result: GeoSearchResult) => void;
  className?: string;
}

export function GeoSearch({
  placeholder = "Buscar endereço...",
  onSelect,
  className,
}: GeoSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["geocode", "address", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/geocode?q=${encodeURIComponent(debouncedQuery)}&type=address`,
      );
      return res.json() as Promise<GeocodeResult[]>;
    },
    enabled: debouncedQuery.length >= 3,
  });

  // Open dropdown when results arrive
  useEffect(() => {
    if (results.length > 0 && debouncedQuery.length >= 3) {
      setOpen(true);
    }
  }, [results, debouncedQuery]);

  const handleSelect = (result: GeocodeResult) => {
    setQuery(result.display_name);
    setOpen(false);

    onSelect({
      displayName: result.display_name,
      latitude: result.lat,
      longitude: result.lng,
      city: result.city,
      state: result.state,
      neighborhood: result.neighborhood,
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-8 pr-8"
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => handleSelect(result)}
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
