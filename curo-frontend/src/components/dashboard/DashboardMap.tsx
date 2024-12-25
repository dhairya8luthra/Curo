import { MapPin } from 'lucide-react';

export default function DashboardMap() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Nearby Hospitals</h2>
        <select className="border rounded-md p-2">
          <option>Within 5km</option>
          <option>Within 10km</option>
          <option>Within 20km</option>
        </select>
      </div>
      
      <div className="bg-gray-100 h-[400px] rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>Map integration coming soon</p>
          <p className="text-sm">Google Maps API will be integrated here</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">City General Hospital</p>
              <p className="text-sm text-gray-500">2.3 km away</p>
            </div>
          </div>
          <button className="text-blue-500 text-sm">View Details</button>
        </div>
        {/* Add more hospital entries as needed */}
      </div>
    </div>
  );
}