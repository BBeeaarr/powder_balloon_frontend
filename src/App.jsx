import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Slider,
} from "@mui/material";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";


function formatCoordinate(value, type) {
  const abs = Math.abs(value).toFixed(5);
  if (type === "lat") {
    return `${abs}° ${value >= 0 ? "N" : "S"}`;
  } else if (type === "lon") {
    return `${abs}° ${value >= 0 ? "E" : "W"}`;
  }
  return value;
}

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoursAgo, setHoursAgo] = useState(0);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchClosestToBuoy = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${baseUrl}/closest_to_buoy?station=51101&hours_ago=${hoursAgo}`);
    const data = await res.json();
    setResult(data);
  } catch (err) {
    console.error("Error fetching closest balloon:", err);
  } finally {
    setLoading(false);
  }
};

  const FitBounds = ({ bounds }) => {
  const map = useMap();
  map.fitBounds(bounds, { padding: [50, 50] });
  return null;
};


  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Closest Balloon to NOAA Buoy
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography gutterBottom>Hours Ago (0–23): {hoursAgo}</Typography>
          <Slider
            value={hoursAgo}
            onChange={(e, newValue) => setHoursAgo(newValue)}
            step={1}
            min={0}
            max={23}
            valueLabelDisplay="auto"
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchClosestToBuoy}
          fullWidth
        >
          Find Closest Balloon to Buoy 51101
        </Button>

        {loading && (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        )}

        {result && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Buoy Coordinates</Typography>
            <Typography>Latitude: {result.buoy_latitude}</Typography>
            <Typography>Longitude: {result.buoy_longitude}</Typography>
            <Typography>Sea Level</Typography>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Closest Balloon
            </Typography>
            <Typography>
              Latitude: {result.closest_balloon_triplet.latitude_deg}
            </Typography>
            <Typography>
              Longitude: {result.closest_balloon_triplet.longitude_deg}
            </Typography>
            <Typography>
              Altitude: {result.closest_balloon_triplet.altitude_km} km
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Distance to buoy: {result.distance_km.toFixed(2)} km
            </Typography>

            <Box sx={{ mt: 4, height: "400px" }}>
              <MapContainer
                center={[result.buoy_latitude, result.buoy_longitude]}
                zoom={4}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker
                  position={[result.buoy_latitude, result.buoy_longitude]}
                  icon={L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png", iconSize: [32, 32] })}
                >
                  <Popup>
                    NOAA Buoy {result.station}<br />
                    ({result.buoy_latitude}, {result.buoy_longitude})
                  </Popup>
                </Marker>
                <Marker
                  position={[
                    result.closest_balloon_triplet.latitude_deg,
                    result.closest_balloon_triplet.longitude_deg,
                  ]}
                  icon={L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png", iconSize: [32, 32] })}
                >
                  <Popup>
                    Closest Balloon<br />
                    ({result.closest_balloon_triplet.latitude_deg},{' '}
                    {result.closest_balloon_triplet.longitude_deg})
                  </Popup>
                </Marker>
                <FitBounds
                  bounds={[
                    [result.buoy_latitude, result.buoy_longitude],
                    [
                      result.closest_balloon_triplet.latitude_deg,
                      result.closest_balloon_triplet.longitude_deg,
                    ],
                  ]}
                />
              </MapContainer>
            </Box>
          </Box>
        )}

      </Paper>
    </Container>
  );
}

export default App;
