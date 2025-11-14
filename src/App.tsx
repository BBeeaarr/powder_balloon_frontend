// App.tsx
import { useState, useMemo, useEffect } from "react";
import { useRef } from "react"; // Added useRef import
// Moved controls UI into ControlsOverlay component
import FullScreenMap from "./FullScreenMap";
import type { LatLng, MarkerDef, ApiResult } from "./types.ts";
import ControlsOverlay from "./ControlsOverlay";
import NavBar from "./NavBar";
import FirstVisitDialog from "./FirstVisitDialog";
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
  const [hoursAgo, setHoursAgo] = useState(23);
  const [fitOnFind, setFitOnFind] = useState(true);
  const [gibsTime, setGibsTime] = useState<string>(() => "");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeedMs, setAnimationSpeedMs] = useState(1200);
  const animTimerRef = useRef<number | null>(null); // Ref to hold timer ID
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const [balloonOpenTrigger, setBalloonOpenTrigger] = useState(0);

  // Compute precipitation timestamp: current UTC hour rounded down minus hoursAgo
  // IMERG tiles can lag; apply a safety lag so tiles exist when requested
  const IMERG_LAG_HOURS = 8; // initial and subsequent loads use an 8-hour safety lag
  function computePrecipitationTime(hrsAgo: number): string {
    const d = new Date();
    d.setUTCMinutes(0, 0, 0); // round down to start of the hour (UTC)
    d.setUTCHours(d.getUTCHours() - (hrsAgo + IMERG_LAG_HOURS));
    return d.toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  // Keep precipitation layer time in sync with the slider (and initialize on mount)
  useEffect(() => {
    // Debounce updates slightly to avoid overwhelming tile loads while scrubbing/animating
    const t = setTimeout(() => setGibsTime(computePrecipitationTime(hoursAgo)), 50);
    return () => clearTimeout(t);
  }, [hoursAgo]);

  // Animate the slider to create a precipitation time-lapse
  useEffect(() => {
    // Clear any existing timer before potentially creating a new one
    if (animTimerRef.current) {
      clearInterval(animTimerRef.current);
      animTimerRef.current = null;
    }
    if (!isAnimating) return;
    const id = window.setInterval(() => {
      setHoursAgo((h) => ((h - 1) + 24) % 24); // step down towards 0, wrap to 23
    }, Math.max(150, animationSpeedMs));
    animTimerRef.current = id;
    return () => {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
      }
    };
  }, [isAnimating, animationSpeedMs]);

  const fetchClosestToBuoy = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/closest_to_buoy?station=51101&hours_ago=${hoursAgo}`);
      const data = (await res.json()) as ApiResult;
      setResult(data);
      // Update precipitation layer time based on selected hoursAgo
      setGibsTime(computePrecipitationTime(hoursAgo));
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
      <FirstVisitDialog />
      {/* Fullscreen map */}
      <FullScreenMap
        markers={markers}
        fallbackCenter={BUOY_CENTER}
        fallbackZoom={6}
        fitToMarkersEnabled={fitOnFind && !!result}
        topOffset={NAVBAR_HEIGHT}
        gibs={{ time: gibsTime }}
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
        fitOnFind={fitOnFind}
        onFitOnFindChange={setFitOnFind}
        isAnimating={isAnimating}
        onToggleAnimating={() => setIsAnimating((v) => !v)}
      />
    </>
  );
}
