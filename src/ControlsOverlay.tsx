import { useMemo, useEffect, useRef, useState } from "react";
import { Box, Paper, Typography, Slider, Button, CircularProgress, Checkbox, FormControlLabel, IconButton, Divider, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { frost } from "./theme";
import type { ApiResult } from "./types";

export type ControlsOverlayProps = {
	hoursAgo: number;
	onHoursAgoChange: (value: number) => void;
	loading: boolean;
	onFindClick: () => void;
	result: ApiResult | null;
	offsetTop?: number;
	fitOnFind: boolean;
	onFitOnFindChange: (value: boolean) => void;
	isAnimating: boolean;
	onToggleAnimating: () => void;
	followClosest?: boolean;
	onFollowClosestChange?: (value: boolean) => void;
	onClearMarkers?: () => void;
};

function formatCoordinate(value: number, type: "lat" | "lon") {
	const abs = Math.abs(value).toFixed(5);
	return type === "lat" ? `${abs}° ${value >= 0 ? "N" : "S"}` : `${abs}° ${value >= 0 ? "E" : "W"}`;
}

export default function ControlsOverlay({
	hoursAgo,
	onHoursAgoChange,
	loading,
	onFindClick,
	result,
	offsetTop = 16,
	fitOnFind,
	onFitOnFindChange,
	isAnimating,
	onToggleAnimating,
	followClosest = false,
	onFollowClosestChange,
	onClearMarkers,
}: ControlsOverlayProps) {
	// Drag state and mobile behavior
		const overlayRef = useRef<HTMLDivElement | null>(null);
	const [pos, setPos] = useState(() => ({ top: offsetTop, left: 16 }));
	const dragStartRef = useRef<{ x: number; y: number; top: number; left: number } | null>(null);
	const [dragging, setDragging] = useState(false);
	const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 600px)').matches : false));
		const hasDraggedRef = useRef(false);
	const [collapsed, setCollapsed] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 600px)').matches : false));

	useEffect(() => {
		const mq = window.matchMedia('(max-width: 600px)');
		const handler = (e: MediaQueryListEvent | MediaQueryList) => {
			const matches = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
			setIsMobile(matches);
		};
		handler(mq);
		mq.addEventListener('change', handler as any);
		return () => mq.removeEventListener('change', handler as any);
	}, []);

		// Do not force-reset position after user has moved it; only initial position uses offsetTop

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
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
		};
		if (dragging) {
			window.addEventListener('pointermove', onMove, { passive: false });
			window.addEventListener('pointerup', onUp);
			window.addEventListener('pointercancel', onUp);
		}
		return () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
		};
	}, [dragging]);

		const startDrag = (e: React.PointerEvent) => {
		if (isMobile) return; // no dragging on mobile
		setDragging(true);
			hasDraggedRef.current = true;
		dragStartRef.current = { x: e.clientX, y: e.clientY, top: pos.top, left: pos.left };
	};

	const sliderMarks = useMemo(
		() => Array.from({ length: 23 }, (_, i) => ({ value: i, label: i === 0 ? "23" : i === 22 ? "1" : "" })),
		[]
	);

	return (
		<Box
			ref={overlayRef}
			sx={
				isMobile
					? { position: 'fixed', left: 8, right: 8, bottom: `max(8px, env(safe-area-inset-bottom))`, top: 'auto', maxWidth: 'none', zIndex: 1000 }
					: { position: 'fixed', top: pos.top, left: pos.left, maxWidth: 420, zIndex: 1000 }
			}
		>
			<Paper elevation={6} sx={{ p: 2, pt: 1, ...frost.paper }}>
				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
					{isMobile ? (
						<IconButton size="small" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? "Expand" : "Minimize"}>
							{collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
						</IconButton>
					) : (
						<Tooltip title="Drag to move">
							<IconButton size="small" onPointerDown={startDrag} sx={{ cursor: 'move' }} aria-label="drag">
								<OpenWithIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					)}
					<Typography sx={{ fontWeight: 700, textAlign: 'center', flex: 1 }}>Control Panel</Typography>
					<IconButton size="small" onClick={onToggleAnimating} aria-label={isAnimating ? "Pause animation" : "Play animation"} onPointerDown={(e) => e.stopPropagation()}>
						{isAnimating ? <PauseIcon /> : <PlayArrowIcon />}
					</IconButton>
				</Box>
				{!collapsed && <Divider sx={{ mb: 1 }} />}

				{!collapsed && (
					<>
						<Typography gutterBottom>Hours Ago (23…1): {hoursAgo}</Typography>
						<Slider
							value={23 - hoursAgo}
							onChange={(_, v) => {
								if (isAnimating) onToggleAnimating();
								const val = v as number;
								onHoursAgoChange(23 - val);
							}}
							step={1}
							min={0}
							max={22}
							valueLabelDisplay="auto"
							valueLabelFormat={(v) => `${23 - (v as number)}`}
							marks={sliderMarks}
							sx={{ mb: 2 }}
						/>

						<FormControlLabel
							control={<Checkbox checked={fitOnFind} onChange={(_, c) => onFitOnFindChange(c)} />}
							label="Fit map to markers when finding"
						/>
						<FormControlLabel
							control={<Checkbox checked={!!followClosest} onChange={(_, c) => onFollowClosestChange?.(c)} />}
							label="Follow closest balloon"
						/>

						<Button variant="outlined" color="inherit" onClick={onFindClick} fullWidth disabled={loading} sx={{ fontWeight: 700, mt: 1 }}>
							{loading ? "Loading…" : "Find Closest Balloon"}
						</Button>

						<Button variant="text" color="inherit" onClick={onClearMarkers} fullWidth sx={{ mt: 1 }}>
							Clear Balloon Markers
						</Button>

						{loading && (
							<Box sx={{ mt: 2, textAlign: "center" }}>
								<CircularProgress size={24} />
							</Box>
						)}

						{/* {result && (
							<Box sx={{ mt: 2 }}>
								<Typography variant="subtitle2">Buoy</Typography>
								<Typography>
									{formatCoordinate(result.buoy_latitude, "lat")}, {formatCoordinate(result.buoy_longitude, "lon")}
								</Typography>
								<Typography variant="subtitle2" sx={{ mt: 1 }}>Closest Balloon</Typography>
								<Typography>
									{formatCoordinate(result.closest_balloon_triplet.latitude_deg, "lat")}, {formatCoordinate(result.closest_balloon_triplet.longitude_deg, "lon")}
								</Typography>
								<Typography>Altitude: {Math.trunc(result.closest_balloon_triplet.altitude_km * 100) / 100} km</Typography>
								<Typography sx={{ mt: 1 }}>Distance: {result.distance_km.toFixed(2)} km</Typography>
							</Box>
						)} */}
					</>
				)}
			</Paper>
		</Box>
	);
}

