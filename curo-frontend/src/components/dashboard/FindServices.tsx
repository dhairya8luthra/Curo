import React, { useState, useRef, useEffect } from 'react';
import {
    Heart, Brain, Bone, Eye, Stethoscope, Baby, Smile, Ear,
    MapPin, Building, TestTube2, Pill, BrainCog, Thermometer,
    Activity, User, ChevronLeft, ChevronRight, BadgeInfo, MessageSquare
} from 'lucide-react';
import PlaceDetailsModal from './PlaceDetailsModal';
import { getAuth } from "firebase/auth";

declare global {
    interface Window {
        google: any;
    }
}

interface Place {
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
    photos?: Array<{
        photo_reference: string;
        name: string;
        widthPx: number;
        heightPx: number;
    }>;
    reviews?: Array<{
        author_name: string;
        profile_photo_url: string;
        rating: number;
        relative_time_description: string;
        text: string;
    }>;
}

const ITEMS_PER_PAGE = 5;

const specialties = [
    { name: 'Heart Issues', icon: Heart, keyword: 'cardiologist', color: 'text-red-500' },
    { name: 'Neurological', icon: Brain, keyword: 'neurologist', color: 'text-purple-500' },
    { name: 'Orthopedic', icon: Bone, keyword: 'orthopedic', color: 'text-gray-600' },
    { name: 'Eye Care', icon: Eye, keyword: 'ophthalmologist', color: 'text-blue-500' },
    { name: 'General Health', icon: Stethoscope, keyword: 'general physician', color: 'text-green-500' },
    { name: 'Pediatric', icon: Baby, keyword: 'pediatrician', color: 'text-pink-500' },
    { name: 'Dental', icon: Smile, keyword: 'dentist', color: 'text-yellow-500' },
    { name: 'ENT', icon: Ear, keyword: 'ENT', color: 'text-orange-500' },
    { name: 'Skin Issues', icon: Thermometer, keyword: 'dermatologist', color: 'text-teal-500' },
    { name: 'Mental Health', icon: BrainCog, keyword: 'psychiatrist', color: 'text-indigo-500' },
    { name: 'Gynecology', icon: User, keyword: 'gynecologist', color: 'text-rose-500' },
    { name: 'Urology', icon: Activity, keyword: 'urologist', color: 'text-cyan-500' },
    { name: 'Internal Medicine', icon: User, keyword: 'internal medicine', color: 'text-emerald-500' },
    { name: 'Endocrinology', icon: Activity, keyword: 'endocrinologist', color: 'text-violet-500' },
    { name: 'Gastroenterology', icon: Activity, keyword: 'gastroenterologist', color: 'text-amber-500' },
    { name: 'Pulmonology', icon: User, keyword: 'pulmonologist', color: 'text-sky-500' },
    { name: 'Nephrology', icon: User, keyword: 'nephrologist', color: 'text-lime-500' },
    { name: 'Oncology', icon: Activity, keyword: 'oncologist', color: 'text-fuchsia-500' },
    { name: 'Radiology', icon: Activity, keyword: 'radiologist', color: 'text-blue-600' }
];

const facilityTypes = [
    { name: 'Hospitals', icon: Building, type: 'hospitals', color: 'text-blue-600' },
    { name: 'Pharmacies', icon: Pill, type: 'pharmacy', color: 'text-green-600' },
    { name: 'Labs', icon: TestTube2, type: 'lab', color: 'text-purple-600' }
];

const RadiusSelector = ({ radius, setRadius }: { radius: number; setRadius: (radius: number) => void }) => (
    <select
        className="border rounded-lg p-2"
        style={{ backgroundColor: 'white' }} // Added style for white background
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
    >
        <option value={2000}>Within 2km</option>
        <option value={5000}>Within 5km</option>
        <option value={10000}>Within 10km</option>
        <option value={20000}>Within 20km</option>
    </select>
);

interface Specialty {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    keyword: string;
    color: string;
}

const SpecialtyButton = ({ specialty, isSelected, onClick }: { specialty: Specialty; isSelected: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`group p-6 rounded-xl border-2 transition-all duration-300 ${
            isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-100 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
        } bg-white`}
    >
        <div className="flex flex-col items-center space-y-3">
            <specialty.icon
                className={`w-8 h-8 transition-colors duration-300 ${
                    isSelected ? specialty.color : 'text-gray-400 group-hover:' + specialty.color
                }`}
            />
            <span className="font-medium text-gray-900 text-sm text-center">
                {specialty.name}
            </span>
        </div>
    </button>
);

interface Facility {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    type: string;
    color: string;
}

const FacilityButton = ({ facility, onClick }: { facility: Facility; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="group p-6 rounded-xl border-2 border-gray-100 hover:border-blue-300 bg-white hover:bg-blue-50 transition-all duration-300 hover:shadow-md"
    >
        <div className="flex flex-col items-center space-y-3">
            <facility.icon className={`w-8 h-8 ${facility.color} transition-transform group-hover:scale-110 duration-300`} />
            <span className="font-medium text-gray-900">{facility.name}</span>
        </div>
    </button>
);

const PlaceCard = ({ place, onShowDetails, onShowReviews }: { place: Place; onShowDetails: () => void; onShowReviews: () => void }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
        <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{place.name}</h3>
                    <p className="text-gray-600 mt-1">{place.vicinity}</p>
                    {place.rating && (
                        <div className="flex items-center mt-2">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1 font-medium">{place.rating}</span>
                            <span className="text-sm text-gray-500 ml-1">
                                ({place.user_ratings_total} reviews)
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex space-x-2">
                {place.photos && (
                    <button
                        onClick={onShowDetails}
                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <BadgeInfo className="h-5 w-5" />
                        <span>Details</span>
                    </button>
                )}
                {place.reviews && (
                    <button
                        onClick={onShowReviews}
                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <MessageSquare className="h-5 w-5" />
                        <span>Reviews</span>
                    </button>
                )}
            </div>
        </div>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => (
    <div className="flex justify-center items-center space-x-4 mt-8">
        <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
        </button>

        <span className="text-gray-600">
            Page {currentPage} of {totalPages}
        </span>

        <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
        </button>
    </div>
);

const FindServices = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [radius, setRadius] = useState(5000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'reviews'>('info');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);

    const totalPages = Math.ceil(places.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPlaces = places.slice(startIndex, endIndex);

    const fetchPlaces = async (type: string, lat: number, lng: number) => {
        setLoading(true);
        setError('');
        setSelectedSpecialty('');

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No logged-in user. Please sign in first.");
            }

            const token = await user.getIdToken();
            const response = await fetch(
                `https://curo-156q.onrender.com/api/maps/nearby-${type}?lat=${lat}&lng=${lng}&radius=${radius}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch nearby ${type}`);
            }

            const data = await response.json();
            setPlaces(data.results || []);
            setCurrentPage(1);
        } catch (err: any) {
            setError(err.message || `Error fetching ${type}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async (keyword: string, lat: number, lng: number) => {
        setLoading(true);
        setError('');
        setSelectedSpecialty(keyword);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No logged-in user. Please sign in first.");
            }

            const token = await user.getIdToken();
            const response = await fetch(
                `https://curo-156q.onrender.com/api/maps/nearby-doctor-type?lat=${lat}&lng=${lng}&radius=${radius}&keyword=${keyword}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }

            const data = await response.json();
            setPlaces(data.results || []);
            setCurrentPage(1);
        } catch (err: any) {
            setError(err.message || 'Error finding doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (type: string) => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserLocation({ lat, lng });
                fetchPlaces(type, lat, lng);
            },
            (err) => {
                console.error(err);
                setError('Could not get your location. Please allow location access.');
            }
        );
    };

    const handleSpecialtySearch = (keyword: string) => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserLocation({ lat, lng });
                fetchDoctors(keyword, lat, lng);
            },
            (err) => {
                console.error(err);
                setError('Could not get your location. Please allow location access.');
            }
        );
    };

    useEffect(() => {
        if (userLocation && mapRef.current && !map) {
            const newMap = new window.google.maps.Map(mapRef.current, {
                center: userLocation,
                zoom: 13,
                styles: [
                    {
                        featureType: "poi.medical",
                        elementType: "geometry",
                        stylers: [{ visibility: "on" }],
                    },
                ],
            });
            setMap(newMap);

            new window.google.maps.Marker({
                position: userLocation,
                map: newMap,
                title: 'Your Location',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#4F46E5",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#FFFFFF",
                },
            });
        }
    }, [userLocation, map]);

    useEffect(() => {
        if (!map) return;

        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        places.forEach((place) => {
            if (!place.geometry?.location) return;

            const marker = new window.google.maps.Marker({
                position: place.geometry.location,
                map,
                title: place.name,
                animation: window.google.maps.Animation.DROP,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div class="p-2">
                        <h3 class="font-semibold">${place.name}</h3>
                        <p class="text-sm text-gray-600">${place.vicinity}</p>
                        ${place.rating ? 
                            `<div class="flex items-center mt-1">
                                <span class="text-yellow-500">★</span>
                                <span class="ml-1">${place.rating}</span>
                                <span class="text-sm text-gray-500 ml-1">(${place.user_ratings_total} reviews)</span>
                            </div>`
                            : ''
                        }
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
        });
    }, [places, map]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Find Medical Services
                    </h1>
                    <p className="text-xl text-gray-600">
                        Connect with healthcare professionals and medical facilities in your area
                    </p>
                </div>

                {/* Specialties Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Medical Specialists</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {specialties.map((specialty) => (
                            <SpecialtyButton
                                key={specialty.keyword}
                                specialty={specialty}
                                isSelected={selectedSpecialty === specialty.keyword}
                                onClick={() => handleSpecialtySearch(specialty.keyword)}
                            />
                        ))}
                    </div>
                </div>

                {/* Facilities Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Medical Facilities</h2>
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                            {facilityTypes.map((facility) => (
                                <FacilityButton
                                    key={facility.type}
                                    facility={facility}
                                    onClick={() => handleSearch(facility.type)}
                                />
                            ))}
                        </div>
                        <RadiusSelector radius={radius} setRadius={setRadius} />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600">Searching for nearby services...</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Map */}
                <div ref={mapRef} className="w-full h-[400px] rounded-xl shadow-lg mb-8" />

                {/* Results Section */}
                {places.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {selectedSpecialty ? 'Available Specialists' : 'Nearby Services'}
                            </h2>
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1}-{Math.min(endIndex, places.length)} of {places.length}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {currentPlaces.map((place) => (
                                <PlaceCard
                                    key={place.place_id}
                                    place={place}
                                    onShowDetails={() => {
                                        setSelectedPlace(place);
                                        setActiveTab('info');
                                    }}
                                    onShowReviews={() => {
                                        setSelectedPlace(place);
                                        setActiveTab('reviews');
                                    }}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                )}

                {/* Details Modal */}
                {selectedPlace && (
                    <PlaceDetailsModal
                        place={selectedPlace}
                        onClose={() => setSelectedPlace(null)}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        
                    />
                )}
            </div>
        </div>
    );
};

export default FindServices;