// Shared types for the map and overlays
import type React from "react";

export type GibsOptions = {
  enabled?: boolean;
  layer?: string;
  time?: string; // ISO time e.g. 2025-11-13T00:00:00Z
  tileSize?: number; // 256 by default
  opacity?: number; // 0..1
};

export type LatLng = [number, number];

export type MarkerDef = {
  id: string;
  position: LatLng;
  popup?: React.ReactNode;
};

// API response for closest balloon to a buoy
export type ApiResult = {
  station: string;
  buoy_latitude: number;
  buoy_longitude: number;
  closest_balloon_triplet: {
    latitude_deg: number;
    longitude_deg: number;
    altitude_km: number;
  };
  distance_km: number;
};
