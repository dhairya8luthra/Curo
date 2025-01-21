import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoLightboxProps {
  photos: any[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PhotoLightbox({ photos, currentIndex, onClose, onNext, onPrevious }: PhotoLightboxProps) {
  if (!photos?.length) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
      >
        <X className="h-8 w-8" />
      </button>

      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-12 w-12" />
      </button>

      <button
        onClick={onNext}
        disabled={currentIndex === photos.length - 1}
        className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-12 w-12" />
      </button>

      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="relative max-w-5xl max-h-[80vh] w-full">
          <img
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${currentPhoto.photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
            alt={`Photo ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="mt-4 text-white text-center">
          <p className="text-sm">Photo {currentIndex + 1} of {photos.length}</p>
        </div>
      </div>
    </div>
  );
}