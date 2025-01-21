import React, { useState } from 'react';
import { Search } from 'lucide-react';
 
interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}
 
export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
    const [query, setQuery] = useState('');
 
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };
 
    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for medicines..."
                    className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                />
                <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? "Searching..." : "Search"}
                </button>
            </div>
        </form>
    );
 
}