import maplibregl from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import type { GibsOptions, LatLng, MarkerDef } from "./types.ts";

export function squareBoundsKm([lat, lng]: LatLng, halfSizeKm = 100) {
  const kmPerDegLat = 111.32;
  const dLat = halfSizeKm / kmPerDegLat;
  const dLng = halfSizeKm / (kmPerDegLat * Math.cos((lat * Math.PI) / 180));
  return [
    [lat - dLat, lng - dLng],
    [lat + dLat, lng + dLng],
  ] as [[number, number], [number, number]];
}


// Default timestamp for WMS IMERG 30-min tiles (use start of current UTC day)
function defaultImergTimestamp(): string {
  const now = new Date();
  // Use previous UTC day at 00:00Z to avoid freshest-day latency gaps
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().replace(/\.\d{3}Z$/, "Z");
}

// Build WMS (EPSG:3857) request using bbox placeholder understood by MapLibre
function buildWmsUrl({
  layer,
  time,
  tileSize = 256,
  format = "image/png",
  transparent = true,
}: {
  layer: string;
  time: string;
  tileSize?: number;
  format?: "image/png" | "image/jpeg";
  transparent?: boolean;
}) {
  const base = "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi";
  const params = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.1.1",
    FORMAT: format,
    TRANSPARENT: transparent ? "TRUE" : "FALSE",
    LAYERS: layer,
    STYLES: "",
    SRS: "EPSG:3857",
    WIDTH: String(tileSize),
    HEIGHT: String(tileSize),
    TIME: time,
  });
  const bboxToken = "&BBOX={bbox-epsg-3857}";
  return `${base}?${params.toString()}${bboxToken}`;
}

export default function FullScreenMap({
  markers = [],
  fallbackCenter = [39.5, -98.35] as LatLng,
  fallbackZoom = 4,
  fitToMarkersEnabled = true,
  gibs = {},
  children,
  topOffset = 0,
}: {
  markers?: MarkerDef[];
  fallbackCenter?: LatLng;
  fallbackZoom?: number;
  fitToMarkersEnabled?: boolean;
  gibs?: GibsOptions;
  children?: React.ReactNode;
  topOffset?: number; // pixels to offset from top (e.g., AppBar height)
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerObjsRef = useRef<maplibregl.Marker[]>([]);
  const gibsSourceId = "gibs-imerg";
  const gibsLayerId = "gibs-imerg";

  const gibsOptions = useMemo<GibsOptions>(() => ({
    enabled: true,
    layer: "IMERG_Precipitation_Rate_30min",
    time: defaultImergTimestamp(),
    tileSize: 256,
    opacity: 0.8,
    ...gibs,
  }), [gibs]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [fallbackCenter[1], fallbackCenter[0]],
      zoom: fallbackZoom,
      renderWorldCopies: false,
    });
    mapRef.current = map;

    let initialized = false;
    const initLayers = () => {
      if (initialized) return;
      initialized = true;
      // markers are managed by a separate effect reacting to props

      // GIBS precipitation via WMS (bbox token)
      if (gibsOptions.enabled) {
        const layerId = gibsOptions.layer || "IMERG_Precipitation_Rate_30min";
        const time = gibsOptions.time || defaultImergTimestamp();
        const tiles = [buildWmsUrl({ layer: layerId, time, tileSize: gibsOptions.tileSize || 256 })];
        // eslint-disable-next-line no-console
        console.log("GIBS WMS url:", tiles[0]);
        if (!map.getSource(gibsSourceId)) {
          map.addSource(gibsSourceId, {
            type: "raster",
            tiles,
            tileSize: gibsOptions.tileSize || 256,
            minzoom: 0,
          } as any);
        }
        if (!map.getLayer(gibsLayerId)) {
          map.addLayer({ id: gibsLayerId, type: "raster", source: gibsSourceId, paint: { "raster-opacity": gibsOptions.opacity ?? 0.8 } });
          // Reduce fade duration for faster visual updates
          map.setPaintProperty(gibsLayerId, "raster-fade-duration", 0);
        }
      }
    };

    if (map.isStyleLoaded()) {
      initLayers();
    } else {
      map.once("load", initLayers);
    }

    return () => {
      if (map.getLayer(gibsLayerId)) map.removeLayer(gibsLayerId);
      if (map.getSource(gibsSourceId)) map.removeSource(gibsSourceId);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when the prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // remove existing markers
    markerObjsRef.current.forEach(m => m.remove());
    markerObjsRef.current = [];

    // add new markers (styling via CSS class)
    markers.forEach(m => {
      const el = document.createElement("div");
      el.className = "map-marker";
      const marker = new maplibregl.Marker(el).setLngLat([m.position[1], m.position[0]]).addTo(map);
      markerObjsRef.current.push(marker);
    });
  }, [markers]);

  // respond to GIBS option changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (typeof gibsOptions.opacity === "number" && map.getLayer(gibsLayerId)) {
      map.setPaintProperty(gibsLayerId, "raster-opacity", Math.min(1, Math.max(0, gibsOptions.opacity)));
    }

    if (map.getSource(gibsSourceId)) {
      const layerId = gibsOptions.layer || "IMERG_Precipitation_Rate_30min";
      const time = gibsOptions.time || defaultImergTimestamp();
      const tiles = [buildWmsUrl({ layer: layerId, time, tileSize: gibsOptions.tileSize || 256 })];
      const src: any = map.getSource(gibsSourceId);
      if (src && typeof src.setTiles === "function") {
        src.setTiles(tiles);
      } else {
        if (map.getLayer(gibsLayerId)) map.removeLayer(gibsLayerId);
        if (map.getSource(gibsSourceId)) map.removeSource(gibsSourceId);
        map.addSource(gibsSourceId, { type: "raster", tiles, tileSize: gibsOptions.tileSize || 256, minzoom: 0 } as any);
        map.addLayer({ id: gibsLayerId, type: "raster", source: gibsSourceId, paint: { "raster-opacity": gibsOptions.opacity ?? 0.8 } });
        map.setPaintProperty(gibsLayerId, "raster-fade-duration", 0);
      }
    }
  }, [gibsOptions.layer, gibsOptions.time, gibsOptions.tileSize, gibsOptions.opacity]);

  // fit to markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitToMarkersEnabled || markers.length < 2) return;
    const lats = markers.map(m => m.position[0]);
    const lngs = markers.map(m => m.position[1]);
    const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
    const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
    map.fitBounds([sw, ne], { padding: 96, maxZoom: 6 });
  }, [markers, fitToMarkersEnabled]);

  return (
    <div style={{ position: "fixed", top: topOffset, left: 0, right: 0, bottom: 0 }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {children}
    </div>
);
}
