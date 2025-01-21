import  { useState,useEffect } from 'react';
import { X, Image, MessageSquare } from 'lucide-react';
import { HospitalPhotos } from './HospitalPhotos';
import { HospitalReviews } from './HospitalReviews';


interface HospitalDetailsProps {
  hospital: any;
  onClose: () => void;
}
// Example of partial shape of the place details API response
interface PlaceDetailsResponse {
    name: string;
    rating?: number;
    userRatingCount?: number;
    formattedAddress?: string;
    websiteUri?: string;
    reviews?: Array<{
      authorAttribution: {
        displayName: string;
        uri?: string;
        photoUri?: string;
      };
      rating: number;
      text: { text: string };
      relativePublishTimeDescription: string;
    }>;
    photos?: Array<{
      name: string;
      widthPx: number;
      heightPx: number;
    }>;
    // ...and so on for more fields...
  }
  

export function HospitalDetails({ hospital, onClose }: HospitalDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'reviews'>('info');
  const [placeDetails, setPlaceDetails] = useState<PlaceDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  useEffect(() => {
    if (hospital?.place_id) {
      fetchPlaceDetails(hospital.place_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospital]);
  const fetchPlaceDetails = async (placeId: string) => {
    try {
      setLoading(true);
      setError("");

      // Choose the fields you want (reviews, photos, displayName, etc.)
      // For example:
      const fields = [
        "name",
        "displayName",
        "rating",
        "userRatingCount",
        "formattedAddress",
        "reviews",
        "photos",
        "regularOpeningHours",
      ].join(",");

      // Construct the URL
      const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&key=${API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch place details for ${placeId}`);
      }

      const data = await response.json();
      console.log(data);    
      setPlaceDetails(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error fetching place details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="p-6">
        {loading && <p className="text-sm text-gray-500 mb-2">Loading details...</p>}
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          <h2 className="text-2xl font-bold mb-4">{hospital.name}</h2>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-1 ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Information
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`pb-2 px-1 flex items-center space-x-1 ${
                activeTab === 'photos'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Photos</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 px-1 flex items-center space-x-1 ${
                activeTab === 'reviews'
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
                  <p className="text-gray-600">{hospital.vicinity}</p>
                </div>
                
                {hospital.rating && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Rating</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{hospital.rating} / 5</span>
                      <span className="ml-2 text-gray-500">
                        ({hospital.user_ratings_total} reviews)
                      </span>
                    </div>
                  </div>
                )}
                
                {hospital.opening_hours && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Status</h3>
                    <p className={hospital.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}>
                      {hospital.opening_hours.open_now ? 'Open Now' : 'Closed'}
                    </p>
                  </div>
                )}
                
                {hospital.types && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {hospital.types.map((type: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && <HospitalPhotos photos={hospital.photos} />}
            
            {activeTab === 'reviews' && (
              <HospitalReviews
                reviews={
                  // The new Places API returns an array of reviews in placeDetails.reviews
                  placeDetails?.reviews?.map((rev) => ({
                    author_name: rev.authorAttribution.displayName,
                    rating: rev.rating,
                    relative_time_description: rev.relativePublishTimeDescription,
                    text: rev.text?.text|| '',
                    profile_photo_url: rev.authorAttribution.photoUri || '',
                  })) || []
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}