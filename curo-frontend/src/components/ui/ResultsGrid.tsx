import { useState } from 'react';
import MedicineCard from './MedicineCard';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

interface Product {
  name?: string;
  brand_name?: string;
  price?: number;
  discounted_price?: number;
  image?: string;
  cropped_image?: string;
  url?: string;
  manufacturer?: string;
  label?: string;
}

interface ResultsGridProps {
  results: {
    pharmEasy?: { products: Product[] };
    oneMg?: { products: Product[] };
    apollo?: { products: Product[] };
  };
}

export default function ResultsGrid({ results }: ResultsGridProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const normalizeProduct = (product: Product, source: string) => {
    const price = product.price || product.discounted_price || 0;
    // Only return the product if it has a valid price
    if (price <= 0) return null;

    return {
      name: product.name || product.brand_name || product.label || '',
      price,
      image: product.image || product.cropped_image || '',
      manufacturer: product.manufacturer || '',
      url: product.url || '',
      source
    };
  };

  const allProducts = [
    ...(results.pharmEasy?.products.map(p => normalizeProduct(p, 'PharmEasy')).filter(Boolean) || []),
    ...(results.oneMg?.products.map(p => normalizeProduct(p, '1mg')).filter(Boolean) || []),
    ...(results.apollo?.products.map(p => normalizeProduct(p, 'Apollo')).filter(Boolean) || [])
  ];

  const filteredProducts = allProducts
    .filter(product =>
      product &&
      (selectedSource === 'all' || product.source === selectedSource) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
    )
    .sort((a, b) => {
      if (!a || !b) return 0;
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="form-select rounded-md border-gray-200 text-sm"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="PharmEasy">PharmEasy</option>
              <option value="1mg">1mg</option>
              <option value="Apollo">Apollo</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Price Range:</label>
              <input
                type="number"
                min="0"
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="form-input w-24 rounded-md border-gray-200 text-sm"
              />
              <span>-</span>
              <input
                type="number"
                min={priceRange[0]}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="form-input w-24 rounded-md border-gray-200 text-sm"
              />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-600"
            >
              {sortOrder === 'asc' ? (
                <SortAsc size={20} className="text-gray-500" />
              ) : (
                <SortDesc size={20} className="text-gray-500" />
              )}
              <span className="text-sm">Price</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, idx) =>
          product && <MedicineCard key={`${product.source}-${idx}`} {...product} />
        )}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria</p>
        </div>
      )}
    </div>
  );
}