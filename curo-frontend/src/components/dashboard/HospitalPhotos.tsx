import { useState } from 'react';
import { PhotoThumbnail } from './PhotoThumbnail';
import { PhotoLightbox } from './PhotoLightBox';
import { ImageIcon } from 'lucide-react';
interface Photo {
  photo_reference: string;
  height: number;
  width: number;
}

interface HospitalPhotosProps {
  photos?: Photo[];
}

export function HospitalPhotos({ photos }: HospitalPhotosProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (!photos?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
        <p>No photos available</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <PhotoThumbnail
            key={index}
            photo={photo}
            index={index}
            onClick={() => setSelectedPhotoIndex(index)}
          />
        ))}
      </div>

      {selectedPhotoIndex !== null && (
        <PhotoLightbox
          photos={photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          onNext={() => setSelectedPhotoIndex(prev => 
            prev !== null && prev < photos.length - 1 ? prev + 1 : prev
          )}
          onPrevious={() => setSelectedPhotoIndex(prev => 
            prev !== null && prev > 0 ? prev - 1 : prev
          )}
        />
      )}
    </>
  );
}