import React, { useState } from 'react';
import { getAuth } from "firebase/auth";
import {
    Heart,
    Brain,
    Bone,
    Eye,
    Stethoscope,
    Baby,
    Smile,
    Ear,
    MapPin,
    Star,
    Building,
    TestTube2,
    Pill,
    BrainCog,
    Thermometer,
    Activity,
    User,
    ChevronLeft,
    ChevronRight,
    Image,
    MessageSquare,
    X
} from 'lucide-react';

interface Doctor {
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
    photos?: Array<{
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

interface Place {
    place_id: string;
    name: string;
    vicinity: string;
    rating?: number;
    user_ratings_total?: number;
    photos?: Array<{
        name: string;
        widthPx: number;
        heightPx: number;
    }>;
}
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
    { name: 'Radiology', icon: Activity, keyword: 'radiologist', color: 'text-blue-600' },
];

const facilityTypes = [
    { name: 'Hospitals', icon: Building, type: 'hospitals', color: 'text-blue-600' },
    { name: 'Pharmacies', icon: Pill, type: 'pharmacy', color: 'text-green-600' },
    { name: 'Labs', icon: TestTube2, type: 'lab', color: 'text-purple-600' }
];

export default function FindServices() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<Doctor | Place | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'reviews'>('info');
    const itemsPerPage = 3;


    const findDoctors = async (keyword: string) => {
        setLoading(true);
        setError('');
        setSelectedSpecialty(keyword);
        setPlaces([]);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude: lat, longitude: lng } = position.coords;

            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No logged-in user. Please sign in first.");
            }

            const token = await user.getIdToken();
            const response = await fetch(
                `http://localhost:3000/api/maps/nearby-doctor-type?lat=${lat}&lng=${lng}&radius=5000&keyword=${keyword}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch doctors');

            const data = await response.json();
            setDoctors(data.results || []);
        } catch (err: any) {
            setError(err.message || 'Error finding doctors');
        } finally {
            setLoading(false);
        }
    };

    const findPlaces = async (type: string) => {
        setLoading(true);
        setError('');
        setDoctors([]);
        setSelectedSpecialty('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude: lat, longitude: lng } = position.coords;

            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No logged-in user. Please sign in first.");
            }

            const token = await user.getIdToken();
            const response = await fetch(
                `http://localhost:3000/api/maps/nearby-${type}?lat=${lat}&lng=${lng}&radius=5000`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch places');

            const data = await response.json();
            setPlaces(data.results || []);
        } catch (err: any) {
            setError(err.message || 'Error finding places');
        } finally {
            setLoading(false);
        }
    };

    const results = [...doctors, ...places];
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentResults = results.slice(startIndex, endIndex);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Find Medical Services
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Connect with healthcare professionals and medical facilities in your area
                    </p>
                </div>

                {/* Specialties Grid */}
                <div className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">Medical Specialists</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {specialties.map((specialty) => (
                            <button
                                key={specialty.keyword}
                                onClick={() => findDoctors(specialty.keyword)}
                                className={`group p-6 rounded-xl border-2 transition-all duration-300 ${selectedSpecialty === specialty.keyword
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-100 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                                    } bg-white`}
                            >
                                <div className="flex flex-col items-center space-y-3">
                                    <specialty.icon
                                        className={`w-8 h-8 transition-colors duration-300 ${selectedSpecialty === specialty.keyword
                                            ? specialty.color
                                            : 'text-gray-400 group-hover:' + specialty.color
                                            }`}
                                    />
                                    <span className="font-medium text-gray-900 text-sm text-center">
                                        {specialty.name}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Facilities Grid */}
                <div className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">Medical Facilities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {facilityTypes.map((facility) => (
                            <button
                                key={facility.type}
                                onClick={() => findPlaces(facility.type)}
                                className="group p-8 rounded-xl border-2 border-gray-100 hover:border-blue-300 bg-white hover:bg-blue-50 transition-all duration-300 hover:shadow-md"
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    <facility.icon className={`w-12 h-12 ${facility.color} transition-transform group-hover:scale-110 duration-300`} />
                                    <span className="font-semibold text-lg text-gray-900">{facility.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                        <p className="mt-6 text-lg text-gray-600">Searching nearby services...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-8 px-4 rounded-lg bg-red-50 border border-red-100">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Results Section with Pagination */}
                {(doctors.length > 0 || places.length > 0) && (
                    <div className="space-y-6 mt-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {doctors.length > 0 ? 'Available Specialists' : 'Nearby Services'}
                            </h2>
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length}
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {currentResults.map((item) => (
                                <div
                                    key={item.place_id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6"
                                >
                                    <div className="flex items-start justify-between flex-wrap gap-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <MapPin className="h-6 w-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {item.name}
                                                </h3>
                                                <p className="text-gray-600 mt-1">{item.vicinity}</p>
                                                {item.rating && (
                                                    <div className="flex items-center mt-3">
                                                        <div className="flex items-center">
                                                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                                            <span className="ml-1.5 font-medium text-gray-900">
                                                                {item.rating}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-gray-500 ml-2">
                                                            ({item.user_ratings_total} reviews)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setActiveTab('photos');
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Image className="h-5 w-5" />
                                                <span>Photos</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setActiveTab('reviews');
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <MessageSquare className="h-5 w-5" />
                                                <span>Reviews</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-4 mt-8">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>Previous</span>
                                </button>

                                <div className="flex items-center space-x-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg transition-colors duration-200 ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-600 hover:bg-blue-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Details Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden relative">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>

                                {/* Tabs */}
                                <div className="flex space-x-4 border-b border-gray-200 mb-6">
                                    <button
                                        onClick={() => setActiveTab('info')}
                                        className={`pb-2 px-1 ${activeTab === 'info'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500'
                                            }`}
                                    >
                                        Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('photos')}
                                        className={`pb-2 px-1 flex items-center space-x-1 ${activeTab === 'photos'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500'
                                            }`}
                                    >
                                        <Image className="w-4 h-4" />
                                        <span>Photos</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`pb-2 px-1 flex items-center space-x-1 ${activeTab === 'reviews'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500'
                                            }`}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Reviews</span>
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="overflow-y-auto max-h-[60vh] pr-2">
                                    {activeTab === 'info' && (
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-700">Address</h3>
                                                <p className="text-gray-600">{selectedItem.vicinity}</p>
                                            </div>

                                            {selectedItem.rating && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-700">Rating</h3>
                                                    <div className="flex items-center">
                                                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                                        <span className="ml-1.5">{selectedItem.rating} / 5</span>
                                                        <span className="text-sm text-gray-500 ml-2">
                                                            ({selectedItem.user_ratings_total} reviews)
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'photos' && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {selectedItem.photos ? (
                                                selectedItem.photos.map((photo, index) => (
                                                    <div
                                                        key={index}
                                                        className="aspect-square rounded-lg overflow-hidden"
                                                    >
                                                        <img
                                                            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.name}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
                                                            alt={`${selectedItem.name} view ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-full text-center py-8 text-gray-500">
                                                    <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                                    <p>No photos available</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'reviews' && (
                                        <div className="space-y-6">
                                            {'reviews' in selectedItem ? (
                                                selectedItem.reviews?.map((review, index) => (
                                                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                                                        <div className="flex items-start space-x-3">
                                                            <img
                                                                src={review.profile_photo_url}
                                                                alt={review.author_name}
                                                                className="w-10 h-10 rounded-full"
                                                            />
                                                            <div>
                                                                <div className="flex justify-between items-center">
                                                                    <h4 className="font-medium">{review.author_name}</h4>
                                                                    <span className="text-sm text-gray-500">
                                                                        {review.relative_time_description}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center my-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-4 h-4 ${i < review.rating
                                                                                ? 'text-yellow-400 fill-current'
                                                                                : 'text-gray-300'
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <p className="text-gray-600 mt-1">{review.text}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                                    <p>No reviews available</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}