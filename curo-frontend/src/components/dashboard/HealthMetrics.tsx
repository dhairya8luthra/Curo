import { Activity, Heart, Thermometer } from 'lucide-react';

export default function HealthMetrics() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Health Metrics</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Heart Rate</p>
              <p className="font-medium">72 BPM</p>
            </div>
          </div>
          <span className="text-green-500 text-sm">Normal</span>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Blood Pressure</p>
              <p className="font-medium">120/80</p>
            </div>
          </div>
          <span className="text-green-500 text-sm">Normal</span>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Thermometer className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="font-medium">98.6°F</p>
            </div>
          </div>
          <span className="text-green-500 text-sm">Normal</span>
        </div>
      </div>
    </div>
  );
}