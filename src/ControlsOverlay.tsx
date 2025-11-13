import { Box, Paper, Typography, Slider, Button, CircularProgress, Tooltip, Divider, Chip, IconButton, Stack } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useRef, useState } from "react";
import { frost } from "./theme";
import type { ApiResult } from "./types";

function formatCoordinate(value: number, type: "lat" | "lon") {
  const abs = Math.abs(value).toFixed(5);
  return type === "lat" ? `${abs}° ${value >= 0 ? "N" : "S"}` : `${abs}° ${value >= 0 ? "E" : "W"}`;
}

function truncateToTwoDecimals(value: number): number {
  return Math.trunc(value * 100) / 100;
}



export type ControlsOverlayProps = {
  hoursAgo: number;
  onHoursAgoChange: (value: number) => void;
  loading: boolean;
  onFindClick: () => void;
  result: ApiResult | null;
  offsetTop?: number; // pixels to push overlay below navbar
};

export default function ControlsOverlay({ hoursAgo, onHoursAgoChange, loading, onFindClick, result, offsetTop = 16 }: ControlsOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState(() => ({ top: offsetTop, left: 16 }));
  const dragStartRef = useRef<{ x: number; y: number; top: number; left: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 600 : false));

  // Keep top in sync with offsetTop until user drags
  useEffect(() => {
    if (!hasDraggedRef.current) setPos(p => ({ ...p, top: offsetTop }));
  }, [offsetTop]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return;
      e.preventDefault();
      const { x, y, top, left } = dragStartRef.current;
      const dx = e.clientX - x;
      const dy = e.clientY - y;
      const node = overlayRef.current;
      const w = node?.offsetWidth ?? 0;
      const h = node?.offsetHeight ?? 0;
      const maxLeft = Math.max(0, window.innerWidth - w);
      const maxTop = Math.max(0, window.innerHeight - h);
      const nextLeft = Math.min(maxLeft, Math.max(0, left + dx));
      const nextTop = Math.min(maxTop, Math.max(0, top + dy));
      setPos({ left: nextLeft, top: nextTop });
    };
    const onUp = () => {
      dragStartRef.current = null;
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    if (dragging) {
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging]);

  const startDrag = (e: React.PointerEvent) => {
    hasDraggedRef.current = true;
    setDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, top: pos.top, left: pos.left };
  };

  return (
    <Box ref={overlayRef} sx={{ position: "fixed", top: pos.top, left: pos.left, maxWidth: 420, zIndex: 1000 }}>
      <Paper elevation={6} sx={{ p: 2, pt: 1, ...frost.paper }}>
        <Box
          onPointerDown={startDrag}
          sx={{
            cursor: "move",
            userSelect: dragging ? "none" : "auto",
            mb: 1,
            px: 1,
            py: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            minWidth: 0,
          }}
        >
          <Tooltip title="Drag to move" placement="top" enterDelay={300}>
            <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
              <OpenWithIcon fontSize="small" />
            </Box>
          </Tooltip>
          <Typography
            variant="h5"
            sx={{
              flex: 1,
              textAlign: 'center',
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Control Panel
          </Typography>
          <Tooltip title={collapsed ? "Expand" : "Minimize"}>
            <IconButton
              size="small"
              color="inherit"
              onClick={(e) => { e.stopPropagation(); setCollapsed(v => !v); }}
              onPointerDown={(e) => e.stopPropagation()}
              sx={{ color: 'text.secondary' }}
              aria-label={collapsed ? 'expand controls' : 'minimize controls'}
            >
              {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        {!collapsed && (
          <>
            <Divider sx={{ mb: 1 }} />

            <Typography gutterBottom>Hours Ago (0–23): {hoursAgo}</Typography>
            <Slider
              value={hoursAgo}
              onChange={(_, v) => onHoursAgoChange(v as number)}
              step={1}
              min={0}
              max={23}
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />

            <Button
              variant="outlined"
              color="inherit"
              onClick={onFindClick}
              fullWidth
              disabled={loading}
              sx={{
                fontWeight: 700,
                color: frost.colors.textPrimary,
                borderColor: frost.colors.textPrimary,
                '&:hover': {
                  borderColor: frost.colors.textPrimary,
                  backgroundColor: 'rgba(13,110,168,0.08)',
                },
              }}
            >
              {loading ? "Loading…" : "Find Closest Balloon"}
            </Button>

            {loading && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {result && (
              <Box sx={{ mt: 2 }}>
            {/* Buoy section */}
            <Box sx={{ border: `1px solid ${frost.colors.border}`, borderRadius: 1, p: 1.25, mb: 1.25, background: 'rgba(255,255,255,0.35)' }}>
              <Typography variant="h6" sx={{ mb: 0.75 }}>Buoy Coords</Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip size="small" label={`Lat ${formatCoordinate(result.buoy_latitude, "lat")}`} />
                  <Chip size="small" label={`Lon ${formatCoordinate(result.buoy_longitude, "lon")}`} />
                </Stack>
                <Box>
                  <Tooltip title="Copy coordinates">
                    <IconButton
                      size="small"
                      onClick={() => navigator.clipboard?.writeText(`${result.buoy_latitude}, ${result.buoy_longitude}`)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
            </Box>

            {/* Closest Balloon section */}
            <Box sx={{ border: `1px solid ${frost.colors.border}`, borderRadius: 1, p: 1.25, mb: 1.25, background: 'rgba(255,255,255,0.35)' }}>
              <Typography variant="h6" sx={{ mb: 0.75 }}>Closest Balloon Coords</Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip size="small" label={`Lat ${formatCoordinate(result.closest_balloon_triplet.latitude_deg, "lat")}`} />
                  <Chip size="small" label={`Lon ${formatCoordinate(result.closest_balloon_triplet.longitude_deg, "lon")}`} />
                </Stack>
                <Box>
                  <Tooltip title="Copy coordinates">
                    <IconButton
                      size="small"
                      onClick={() => navigator.clipboard?.writeText(`${result.closest_balloon_triplet.latitude_deg}, ${result.closest_balloon_triplet.longitude_deg}`)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              <Typography sx={{ mt: 0.75 }}>Altitude: {truncateToTwoDecimals(result.closest_balloon_triplet.altitude_km).toFixed(2)} km</Typography>
            </Box>

            {/* Distance section */}
            <Box sx={{ border: `1px solid ${frost.colors.border}`, borderRadius: 1, p: 1.25, background: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Distance</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{result.distance_km.toFixed(2)} km</Typography>
            </Box>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
