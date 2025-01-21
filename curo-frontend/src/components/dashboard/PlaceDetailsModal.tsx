import { useState ,useEffect} from 'react';
import React from 'react';
import { X, Image, MessageSquare, Star, MapPin } from 'lucide-react';

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
      photo_reference: string;
      widthPx: number;
      heightPx: number;
    }>;
    // ...and so on for more fields...
  }


const PlaceDetailsModal: React.FC<{ place: Place; onClose: () => void; activeTab: 'info' | 'photos' | 'reviews'; setActiveTab: (tab: 'info' | 'photos' | 'reviews') => void}> = ({ place, onClose, activeTab, setActiveTab }) => {
  if (!place) return null;

    const [placeDetails, setPlaceDetails] = useState<PlaceDetailsResponse | null>(null);

    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    useEffect(() => {
      
        fetchPlaceDetails(place.place_id);
    
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [place]);
  const fetchPlaceDetails = async (placeId: string) => {
    try {
      

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
      console.log("place details:",data);    
      setPlaceDetails(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <div className="flex items-start space-x-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{place.name}</h2>
              <p className="text-gray-600 mt-1">{place.vicinity}</p>
              {place.rating && (
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">{place.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({place.user_ratings_total} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <TabButton 
              active={activeTab === 'info'} 
              onClick={() => setActiveTab('info')}
            >
              Information
            </TabButton>
            <TabButton 
              active={activeTab === 'photos'} 
              onClick={() => setActiveTab('photos')}
              icon={<Image className="w-4 h-4" />}
            >
              Photos
            </TabButton>
            <TabButton 
              active={activeTab === 'reviews'} 
              onClick={() => setActiveTab('reviews')}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Reviews
            </TabButton>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {activeTab === 'info' && (
              <PlaceInfo place={place} />
            )}
            
            {activeTab === 'photos' && (
              <PhotosGrid photos={place.photos || []} />
            )}
            
            {activeTab === 'reviews' && (
              <ReviewsList reviews={
                placeDetails?.reviews?.map((rev) => ({
                author_name: rev.authorAttribution.displayName,
                rating: rev.rating,
                relative_time_description: rev.relativePublishTimeDescription,
                text: rev.text?.text|| '',
                profile_photo_url: rev.authorAttribution.photoUri || '',
              })) || [] } />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon?: React.ReactNode; children: React.ReactNode }> = ({ children, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`pb-2 px-1 flex items-center space-x-1 ${
      active ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
    }`}
  >
    {icon}
    <span>{children}</span>
  </button>
);

interface Place {
  place_id:string,
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
  };
  types?: string[];
  photos?: { photo_reference: string; widthPx: number; heightPx: number }[];
  reviews?: {
    profile_photo_url: string;
    author_name: string;
    rating: number;
    relative_time_description: string;
    text: string;
  }[];
}

const PlaceInfo: React.FC<{ place: Place }> = ({ place }) => (
  <div className="space-y-4">
    <div className="bg-blue-50 rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-2">Business Information</h3>
      <div className="space-y-2">
        <p className="text-gray-700">
          <span className="font-medium">Address:</span> {place.vicinity}
        </p>
        {place.opening_hours && (
          <p className="text-gray-700">
            <span className="font-medium">Status:</span>{' '}
            <span className={place.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}>
              {place.opening_hours.open_now ? 'Open Now' : 'Closed'}
            </span>
          </p>
        )}
        {place.types && (
          <p className="text-gray-700">
            <span className="font-medium">Categories:</span>{' '}
            {place.types.map(type => type.replace(/_/g, ' ')).join(', ')}
          </p>
        )}
      </div>
    </div>
  </div>
);

const PhotosGrid: React.FC<{ photos: { photo_reference: string; widthPx: number; heightPx: number }[] }> = ({ photos }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {photos.map((photo, index) => (
      <div key={index} className="aspect-square rounded-lg overflow-hidden">
        <img
          src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
          alt={`Location ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
    ))}
  </div>
);

interface Review {
  profile_photo_url: string;
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

const ReviewsList: React.FC<{ reviews: Review[] }> = ({ reviews }) => (
  <div className="space-y-6">
    {reviews.map((review, index) => (
      <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
        <div className="flex items-center space-x-3 mb-2">
          <img
            src={review.profile_photo_url}
            alt={review.author_name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-medium">{review.author_name}</p>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1">{review.rating}</span>
              <span className="text-sm text-gray-500 ml-2">
                {review.relative_time_description}
              </span>
            </div>
          </div>
        </div>
        <p className="text-gray-600">{review.text}</p>
      </div>
    ))}
  </div>
);

export default PlaceDetailsModal;