import React, { useState } from "react";
import Sidebar from "../components/ui/Layout/SideBar";
import SearchBar from "../components/ui/SearchBar";
import ResultsGrid from "../components/ui/ResultsGrid";
import { AlertCircle, Pill, Search, ShoppingBag } from 'lucide-react';
import { getAuth } from "firebase/auth";
 
export default function MedicinePricePage() {
    const [activeTab, setActiveTab] = React.useState("Compare Medicine Prices");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState(null);
 
    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setError(null);
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            setError("Please sign in to search for medicines");
            setIsLoading(false);
            return;
        }
 
        try {
            const token = await user.getIdToken();
            const response = await fetch(
                `http://localhost:3000/api/medicine-search?query=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
 
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch results');
            }
 
            setResults(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching results');
        } finally {
            setIsLoading(false);
        }
    };
 
    return (
        <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Pill className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Compare Medicine Prices</h1>
                                <p className="text-gray-600 mt-1">Find the best prices across multiple pharmacies</p>
                            </div>
                        </div>
 
                        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                    </div>
 
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center text-red-700 animate-fade-in">
                            <AlertCircle className="mr-3 flex-shrink-0" size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
 
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin">
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">Searching Pharmacies</p>
                                <p className="text-sm text-gray-600 mt-1">Finding the best prices for you...</p>
                            </div>
                        </div>
                    )}
 
                    {/* Results */}
                    {results && !isLoading && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Available Options</h2>
                                </div>
                                {/* Add filters or sorting options here if needed */}
                            </div>
                            <ResultsGrid results={results} />
                        </div>
                    )}
 
                    {/* Empty State */}
                    {!results && !isLoading && !error && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Start Your Medicine Search
                            </h2>
                            <p className="text-gray-600 max-w-md mx-auto">
                                Enter a medicine name above to compare prices across different pharmacies and find the best deals
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
