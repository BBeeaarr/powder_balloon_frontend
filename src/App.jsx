import { useState } from "react";

function App() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [result, setResult] = useState(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Dummy 3D coordinates
  const balloons = [
    { lat: 45.2, lon: -75.86, alt: 3.4 },
    { lat: 27.5, lon: 136.45, alt: 2.4 },
    { lat: 23.6, lon: -160.1, alt: 5.0 }, // closest to 23.5 / -160.2
  ];

  async function findClosestBalloon() {
    const res = await fetch(`${baseUrl}/balloons/closest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        balloons: balloons,
      }),
    });

    const data = await res.json();
    setResult(data.powder_balloon);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Powder Balloon Finder</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          NOAA Buoy Latitude:{" "}
          <input value={lat} onChange={(e) => setLat(e.target.value)} />
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          NOAA Buoy Longitude:{" "}
          <input value={lon} onChange={(e) => setLon(e.target.value)} />
        </label>
      </div>
      <button onClick={findClosestBalloon}>Find Powder Balloon</button>

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Closest Balloon:</h2>
          <p>Lat: {result.lat}</p>
          <p>Lon: {result.lon}</p>
          <p>Alt: {result.alt}</p>
        </div>
      )}
    </div>
  );
}

export default App;
