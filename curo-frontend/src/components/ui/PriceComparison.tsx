
import { ShoppingCart, Package, Tag } from 'lucide-react';

interface Product {
    name: string;
    price: number;
    image?: string;
    manufacturer?: string;
}

interface PharmacyData {
    source: string;
    products: Product[];
}

interface ComparisonData {
    pharmEasy: PharmacyData;
    oneMg: PharmacyData;
    apollo: PharmacyData;
}

interface PriceComparisonProps {
    data: ComparisonData | null;
}

export default function PriceComparison({ data }: PriceComparisonProps) {
    if (!data) return null;

    const pharmacies = [data.pharmEasy, data.oneMg, data.apollo];


    return (
        <div className="w-full max-w-6xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pharmacies.map((pharmacy) => (
                    <div key={pharmacy.source} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">{pharmacy.source}</h3>
                            <ShoppingCart className="text-blue-600" size={24} />
                        </div>

                        {pharmacy.products.length > 0 ? (
                            <div className="space-y-4">
                                {pharmacy.products.map((product, idx) => (
                                    <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                                        <div className="flex items-start gap-3">
                                            {product.image && (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800">{product.name}</h4>
                                                {product.manufacturer && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                        <Package size={14} />
                                                        <span>{product.manufacturer}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Tag size={14} className="text-green-600" />
                                                    <span className="text-lg font-semibold text-green-600">
                                                        ₹{product.price.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No products found</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}