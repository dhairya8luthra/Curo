import {
  Activity,
  Heart,
  Scale,
  Ruler,
  AlertTriangle,
  Droplet,
} from 'lucide-react';

interface HealthMetricsProps {
  blood_pressure?: string;
  weight?: number;
  height?: number;
  allergies?: string;
  blood_group?: string;
  heart_rate?: string;
}

export default function HealthMetrics({
  blood_pressure,
  weight,
  height,
  allergies,
  blood_group,
  heart_rate,
}: HealthMetricsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Health Metrics</h2>
      <div className="space-y-4">
        {heart_rate && (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Heart Rate</p>
                <p className="font-medium">{heart_rate} BPM</p>
              </div>
            </div>
            <span className="text-green-500 text-sm">Normal</span>
          </div>
        )}

        {blood_pressure && (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Pressure</p>
                <p className="font-medium">{blood_pressure}</p>
              </div>
            </div>
            <span className="text-green-500 text-sm">Normal</span>
          </div>
        )}

        {typeof weight === 'number' && (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Scale className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{weight} kg</p>
              </div>
            </div>
            <span className="text-green-500 text-sm">Normal</span>
          </div>
        )}

        {typeof height === 'number' && (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Ruler className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Height</p>
                <p className="font-medium">{height} cm</p>
              </div>
            </div>
            <span className="text-green-500 text-sm">Normal</span>
          </div>
        )}

        {allergies && (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Allergies</p>
                <p className="font-medium">{allergies}</p>
              </div>
            </div>
            <span className="text-red-500 text-sm">Take Care</span>
          </div>
        )}

        {blood_group && (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Droplet className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium">{blood_group}</p>
              </div>
            </div>
            <span className="text-blue-500 text-sm">Info</span>
          </div>
        )}
      </div>
    </div>
  );
}
