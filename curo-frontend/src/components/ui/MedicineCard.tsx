
import { ExternalLink,  Pill, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MedicineCardProps {
    name: string;
    price: number;
    image: string | undefined;
    source: string;
    url: string;
    manufacturer?: string;
}

export default function MedicineCard({ name, price, image, source, url, manufacturer }: MedicineCardProps) {
    // Don't render the card if price is 0 or invalid
    if (!price || price <= 0) return null;

    // Ensure price is a number
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return null;

    const sourceColors = {
        'PharmEasy': 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        '1mg': 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        'Apollo': 'bg-purple-50 text-purple-700 hover:bg-purple-100'
    };

    return (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden">
            {/* Source Badge and Rating */}
            <div className="flex items-center justify-between p-4 bg-gray-50">
                <span className={cn(
                    "text-sm font-medium px-3 py-1 rounded-full transition-colors",
                    sourceColors[source as keyof typeof sourceColors] || 'bg-gray-50 text-gray-700'
                )}>
                    {source}
                </span>

            </div>

            {/* Image Container */}
            <div className="relative p-6 flex-shrink-0 h-48 group-hover:transform group-hover:scale-105 transition-transform duration-300">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                />
            </div>

            {/* Content */}
            <div className="flex-grow p-6 pt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
                    <Pill size={16} className="inline-block mr-2 text-blue-500" />
                    {name}
                </h3>
                {manufacturer && (
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                        <Building2 size={14} className="mr-1 text-gray-400" />
                        {manufacturer}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-0">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Price</p>
                        <p className="text-2xl font-bold text-blue-600">
                            ₹{numericPrice.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* External Link Button */}
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        "transform hover:-translate-y-0.5 transition-transform duration-200"
                    )}
                >
                    <span>View Details</span>
                    <ExternalLink size={16} />
                </a>
            </div>
        </div>
    );
}