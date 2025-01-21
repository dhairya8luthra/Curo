
import { Star } from 'lucide-react';

interface Review {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url: string;
}

interface HospitalReviewsProps {
  reviews?: Review[];
}

export function HospitalReviews({ reviews }: HospitalReviewsProps) {
  if (!reviews?.length) {
    return <p className="text-gray-500">No reviews available.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
          <div className="flex items-start space-x-3">
            <img
              src={review.profile_photo_url}
              alt={review.author_name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{review.author_name}</h4>
                <span className="text-sm text-gray-500">{review.relative_time_description}</span>
              </div>
              <div className="flex items-center my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mt-1">{review.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}