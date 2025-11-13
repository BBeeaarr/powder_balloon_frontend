// App.tsx
import { useState, useMemo } from "react";
// Moved controls UI into ControlsOverlay component
import FullScreenMap from "./FullScreenMap";
import type { LatLng, MarkerDef, ApiResult } from "./types.ts";
import ControlsOverlay from "./ControlsOverlay";
import NavBar from "./NavBar";
import { NAVBAR_HEIGHT } from "./theme";
// import { MarkerItem } from "./MarkersLayer";
// import PillLabel from "./PillLabel";

// formatting moved into ControlsOverlay

// ApiResult moved to types.ts

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
    const list: MarkerDef[] = [{ id: "buoy", position: BUOY_CENTER, popup: "NOAA Buoy 51101" }];
    if (result) {
      list.push({
        id: "balloon",
        position: [
          result.closest_balloon_triplet.latitude_deg,
          result.closest_balloon_triplet.longitude_deg,
        ],
        popup: "Balloon",
      });
    }
    return list;
  }, [result]);

  return (
    <>
      <NavBar />
      {/* Fullscreen map */}
      <FullScreenMap
        markers={markers}
        fallbackCenter={BUOY_CENTER}
        fallbackZoom={6}
        fitToMarkersEnabled={!!result}
        topOffset={NAVBAR_HEIGHT}
      >
      </FullScreenMap>

      {/* Controls overlay */}
      <ControlsOverlay
        hoursAgo={hoursAgo}
        onHoursAgoChange={setHoursAgo}
        loading={loading}
        onFindClick={fetchClosestToBuoy}
        result={result}
        offsetTop={NAVBAR_HEIGHT + 16}
      />
    </>
  );
}
