import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { getAuth } from "firebase/auth";

export default function DashboardMap() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHospitals = async (lat: number, lng: number) => {
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No logged-in user. Please sign in first.");
      }
      // Get the ID token
      const token = await user.getIdToken();

      const url = `http://localhost:3000/api/maps/nearby-hospitals?lat=${lat}&lng=${lng}&radius=${radius}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch nearby hospitals");
      }

      const data = await response.json();
      setHospitals(data.results || []);
    } catch (err: any) {
      setError(err.message || "Error fetching hospitals");
    } finally {
      setLoading(false);
    }
  };

  const handleFindHospitals = () => {
    // Ask for location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          fetchHospitals(lat, lng);
        },
        (err) => {
          console.error(err);
          setError("Could not get your location. Please allow location access.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  // ...
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Nearby Hospitals</h2>
        <select
          className="border rounded-md p-2"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          <option value={2000}>Within 2km</option>
          <option value={5000}>Within 5km</option>
          <option value={10000}>Within 10km</option>
          <option value={20000}>Within 20km</option>
        </select>
      </div>

      <button
        onClick={handleFindHospitals}
        className="px-4 py-2 bg-blue-600 text-white rounded-md mb-4"
      >
        Find Hospitals
      </button>

      {loading && <p>Loading hospitals...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-gray-100 h-[400px] rounded-lg flex items-center justify-center mb-4">
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>Map integration coming soon</p>
          <p className="text-sm">Google Maps API will be integrated here</p>
        </div>
      </div>

      {/* Hospital list */}
      <div className="space-y-2">
        {hospitals.map((hospital, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{hospital.name}</p>
                <p className="text-sm text-gray-500">{hospital.vicinity}</p>
              </div>
            </div>
            <button className="text-blue-500 text-sm">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}