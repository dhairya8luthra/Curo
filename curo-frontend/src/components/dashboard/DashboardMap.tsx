import React, { useState, useRef, useEffect } from "react";
import {google} from "@types/google.maps";

// Declare the google property on the window object
declare global {
  interface Window {
    google: any;
  }
}
import { MapPin } from "lucide-react";
import { getAuth } from "firebase/auth";

interface Hospital {
  name: string;
  vicinity: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export default function DashboardMap() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | null>(null);

  // Reference to the map DOM node
  const mapRef = useRef<HTMLDivElement>(null);
  // Store the Google Map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // Keep track of markers so we can clear them when we fetch new data
  const markersRef = useRef<google.maps.Marker[]>([]);

  /**
   * Fetch the list of hospitals from the backend (protected route).
   */
  const fetchHospitals = async (lat: number, lng: number) => {
    setLoading(true);
    setError("");

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No logged-in user. Please sign in first.");
      }

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
      // data.results is typically an array of places
      setHospitals(data.results || []);
    } catch (err: any) {
      setError(err.message || "Error fetching hospitals");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle button click: ask for geolocation, fetch hospitals, and store the user’s location.
   */
  const handleFindHospitals = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLatLng({ lat, lng });
        fetchHospitals(lat, lng);
      },
      (err) => {
        console.error(err);
        setError("Could not get your location. Please allow location access.");
      }
    );
  };

  /**
   * Initialize the Google Map once we have userLatLng, if it's not created yet.
   */
  useEffect(() => {
    if (userLatLng && mapRef.current && !map) {
      // Create a new map centered on the user's location
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: userLatLng.lat, lng: userLatLng.lng },
        zoom: 13,
      });
      setMap(newMap);

      // Optionally, place a marker for the user’s location
      new window.google.maps.Marker({
        position: userLatLng,
        map: newMap,
        title: "You are here",
      });
    }
  }, [userLatLng, map]);

  /**
   * Whenever 'hospitals' change, place new markers on the map.
   * We clear out old markers first.
   */
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create a marker for each hospital
    hospitals.forEach((h) => {
      if (!h.geometry?.location) return;
      const marker = new window.google.maps.Marker({
        position: {
          lat: h.geometry.location.lat,
          lng: h.geometry.location.lng,
        },
        map,
        title: h.name,
      });
      markersRef.current.push(marker);

      // Optional: add an info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${h.name}</strong><br/>${h.vicinity}</div>`,
      });
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });
  }, [hospitals, map]);

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

      {/* MAP CONTAINER - The actual Google Map will be rendered here */}
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg mb-4 border border-gray-300"
      />

      {/* Hospital list (optional) */}
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
