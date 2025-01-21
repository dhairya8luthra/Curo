import  { useState, useRef, useEffect } from "react";
import { MapPin, Map as MapIcon } from "lucide-react";
import { getAuth } from "firebase/auth";
import { HospitalDetails } from "./HospitalDetails";
 
// Declare the google property on the window object
declare global {
  interface Window {
    google: any;
  }
}
 
interface Hospital {
  place_id: string;
  name: string;
  vicinity: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
  };
  types?: string[];
}
 
const ITEMS_PER_PAGE = 5;
 
export default function DashboardMap() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
 
  // Reference to the map DOM node
  const mapRef = useRef<HTMLDivElement>(null);
  // Store the Google Map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // Keep track of markers so we can clear them when we fetch new data
  const markersRef = useRef<google.maps.Marker[]>([]);
 
  // Calculate pagination values
  const totalPages = Math.ceil(hospitals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentHospitals = hospitals.slice(startIndex, endIndex);
 
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
      const url = `https://curo-156q.onrender.com/api/maps/nearby-hospitals?lat=${lat}&lng=${lng}&radius=${radius}`;
 
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch nearby hospitals");
      }
 
      const data = await response.json();
      setHospitals(data.results || []);
      setCurrentPage(1); // Reset to first page when new data is loaded
      console.log(data.results);
    } catch (err: any) {
      setError(err.message || "Error fetching hospitals");
    } finally {
      setLoading(false);
    }
  };
 
  const fetchDoctors = async (lat: number, lng: number) => {
    setLoading(true);
    setError("");
 
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No logged-in user. Please sign in first.");
      }
 
      const token = await user.getIdToken();
      const url = `https://curo-156q.onrender.com/api/maps/nearby-doctor?lat=${lat}&lng=${lng}&radius=${radius}`;
 
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch nearby doctor");
      }
 
      const data = await response.json();
      setHospitals(data.results || []);
      setCurrentPage(1); // Reset to first page when new data is loaded
      console.log(data.results);
    } catch (err: any) {
      setError(err.message || "Error fetching doctor");
    } finally {
      setLoading(false);
    }
  };
 
  const fetchPharmacy = async (lat: number, lng: number) => {
    setLoading(true);
    setError("");
 
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No logged-in user. Please sign in first.");
      }
 
      const token = await user.getIdToken();
      const url = `https://curo-156q.onrender.com/api/maps/nearby-pharmacy?lat=${lat}&lng=${lng}&radius=${radius}`;
 
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch nearby pharmacy");
      }
 
      const data = await response.json();
      setHospitals(data.results || []);
      setCurrentPage(1); // Reset to first page when new data is loaded
      console.log(data.results);
    } catch (err: any) {
      setError(err.message || "Error fetching pharmacy");
    } finally {
      setLoading(false);
    }
  };
 
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
  const handleFindDoctor = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLatLng({ lat, lng });
        fetchDoctors(lat, lng);
      },
      (err) => {
        console.error(err);
        setError("Could not get your location. Please allow location access.");
      }
    );
  };
  const handleFindPharmacy = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLatLng({ lat, lng });
        fetchPharmacy(lat, lng);
      },
      (err) => {
        console.error(err);
        setError("Could not get your location. Please allow location access.");
      }
    );
  };
 
  useEffect(() => {
    if (userLatLng && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: userLatLng.lat, lng: userLatLng.lng },
        zoom: 13,
      });
      setMap(newMap);
 
      new window.google.maps.Marker({
        position: userLatLng,
        map: newMap,
        title: "You are here",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        },
      });
    }
  }, [userLatLng, map]);
 
  useEffect(() => {
    if (!map) return;
 
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
 
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
        <h2 className="text-lg font-semibold text-white">Nearby Healthcare Services</h2>
        <select
          className="bg-blue-500 text-white border border-blue-400 rounded-md p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          <option value={2000} className="bg-blue-500">Within 2km</option>
          <option value={5000} className="bg-blue-500">Within 5km</option>
          <option value={10000} className="bg-blue-500">Within 10km</option>
          <option value={20000} className="bg-blue-500">Within 20km</option>
        </select>
      </div>
 
      <div className="flex justify-center items-center space-x-2 mb-4">
        <button
          onClick={handleFindHospitals}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Find Hospitals
        </button>
        <button
          onClick={handleFindDoctor}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Find Doctor
        </button>
        <button
          onClick={handleFindPharmacy}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Find Pharmacy
        </button>
      </div>
 
      {loading && <p>Loading services...</p>}
      {error && <p className="text-red-500">{error}</p>}
 
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg mb-4 border border-gray-300 relative"
      >
        {!userLatLng && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
            <MapIcon className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 font-medium">No location selected</p>
            <p className="text-sm text-gray-500 mt-2">
              Click one of the buttons above to find healthcare services near you
            </p>
          </div>
        )}
      </div>
 
      <div className="space-y-2">
        {currentHospitals.map((hospital, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{hospital.name}</p>
                <p className="text-sm text-gray-500">{hospital.vicinity}</p>
                {hospital.rating && (
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm">{hospital.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">
                      ({hospital.user_ratings_total} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedHospital(hospital)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
 
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
 
      {/* Hospital Details Modal */}
      {selectedHospital && (
        <HospitalDetails
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
}
