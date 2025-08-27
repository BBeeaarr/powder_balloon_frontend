import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchClosestToBuoy = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/closest_to_buoy?station=51101`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error fetching closest balloon:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Closest Balloon to NOAA Buoy
        </Typography>

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
            <Typography>Altitude: {result.buoy_altitude_km} km</Typography>

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
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App;
