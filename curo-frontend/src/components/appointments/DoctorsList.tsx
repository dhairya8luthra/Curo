import { useState, useMemo } from 'react';
import { Search, UserRound, Award, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Doctor {
  id: number;
  name: string;
  nexhealth_specialty: string;
  npi: string;
  profile_url: string;
  locations: any[];
  
}

interface DoctorsListProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  isLoading: boolean;
}

export default function DoctorsList({ doctors, onSelectDoctor }: DoctorsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

  // Get unique specialties
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set(doctors.map(doctor => doctor.nexhealth_specialty));
    return Array.from(uniqueSpecialties);
  }, [doctors]);

  // Filter doctors based on search term and specialty
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = !selectedSpecialty || doctor.nexhealth_specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchTerm, selectedSpecialty]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search doctors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Specialties</option>
          {specialties.map(specialty => (
            <option key={specialty} value={specialty}>
              {specialty}s
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.map(doctor => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectDoctor(doctor)}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {doctor.profile_url ? (
                  <img
                    src={doctor.profile_url}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserRound className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Dr. {doctor.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Award className="w-4 h-4" />
                  <span>{doctor.nexhealth_specialty}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Phone className="w-4 h-4" />
                  <span>Schedule a Visit</span>
                </div>
                {doctor.locations && doctor.locations.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.locations.length} Location{doctor.locations.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="mt-3">
                  <button
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => onSelectDoctor(doctor)}
                  >
                    View Available Times →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No doctors found matching your criteria</p>
        </div>
      )}
    </div>
  );
}