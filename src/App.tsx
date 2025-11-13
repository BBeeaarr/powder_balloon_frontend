// App.tsx
import { useState, useMemo } from "react";
import { Typography, Button, Box, Paper, CircularProgress, Slider } from "@mui/material";
import FullScreenMap from "./FullScreenMap";
import type { LatLng, MarkerDef } from "./types.ts";
// import { MarkerItem } from "./MarkersLayer";
// import PillLabel from "./PillLabel";

function formatCoordinate(value: number, type: "lat" | "lon") {
  const abs = Math.abs(value).toFixed(5);
  return type === "lat" ? `${abs}° ${value >= 0 ? "N" : "S"}`
                        : `${abs}° ${value >= 0 ? "E" : "W"}`;
}

type ApiResult = {
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

// --- Config: buoy center for station 51101
const BUOY_CENTER: LatLng = [24.359, -162.081];

export default function App() {
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoursAgo, setHoursAgo] = useState(0);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const [balloonOpenTrigger, setBalloonOpenTrigger] = useState(0);

  const fetchClosestToBuoy = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/closest_to_buoy?station=51101&hours_ago=${hoursAgo}`);
      const data = (await res.json()) as ApiResult;
      setResult(data);
      setBalloonOpenTrigger((n) => n + 1);
    } catch (err) {
      console.error("Error fetching closest balloon:", err);
    } finally {
      setLoading(false);
    }
  };

  // Build markers for buoy and (when available) closest balloon
  const markers = useMemo<MarkerDef[]>(() => {
    const list: MarkerDef[] = [
      { id: "buoy", position: BUOY_CENTER, popup: "NOAA Buoy 51101" },
    ];
    if (result) {
      list.push({
        id: "balloon",
        position: [
          result.closest_balloon_triplet.latitude_deg,
          result.closest_balloon_triplet.longitude_deg,
        ],
        popup: `Balloon`,
      });
    }
    console.log("Markers:", list);
    return list;
  }, [result]);

  return (
    <>
      {/* Fullscreen map */}
      <FullScreenMap
        markers={markers}
        fallbackCenter={BUOY_CENTER}
        fallbackZoom={6}
        fitToMarkersEnabled={!!result}
      >
      </FullScreenMap>

      {/* Controls overlay */}
      <Box sx={{ position: "fixed", top: 16, left: 16, maxWidth: 420, zIndex: 1000 }}>
        <Paper elevation={6} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Closest Balloon to NOAA Buoy 51101
          </Typography>

          <Typography gutterBottom>Hours Ago (0–23): {hoursAgo}</Typography>
          <Slider
            value={hoursAgo}
            onChange={(_, v) => setHoursAgo(v as number)}
            step={1}
            min={0}
            max={23}
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />

          <Button variant="contained" onClick={fetchClosestToBuoy} fullWidth disabled={loading}>
            {loading ? "Loading…" : "Find Closest Balloon"}
          </Button>

          {loading && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {result && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Buoy</Typography>
              <Typography>
                {formatCoordinate(result.buoy_latitude, "lat")},{" "}
                {formatCoordinate(result.buoy_longitude, "lon")}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Closest Balloon
              </Typography>
              <Typography>
                {formatCoordinate(result.closest_balloon_triplet.latitude_deg, "lat")},{" "}
                {formatCoordinate(result.closest_balloon_triplet.longitude_deg, "lon")}
              </Typography>
              <Typography>Altitude: {result.closest_balloon_triplet.altitude_km} km</Typography>
              <Typography sx={{ mt: 1 }}>
                Distance: {result.distance_km.toFixed(2)} km
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
}
