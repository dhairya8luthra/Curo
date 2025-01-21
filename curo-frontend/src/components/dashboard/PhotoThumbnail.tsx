
import { Image as ImageIcon } from 'lucide-react';

interface PhotoThumbnailProps {
  photo: any;
  onClick: () => void;
  index: number;
}

export function PhotoThumbnail({ photo, onClick, index }: PhotoThumbnailProps) {
  return (
    <div 
      className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <img
        src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
        alt={`Hospital view ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
        <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8" />
      </div>
    </div>
  );
}