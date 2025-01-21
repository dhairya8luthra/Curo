import  { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { getAuth } from 'firebase/auth';

interface Slot {
  time: string;
  operatory_id: number;
  provider_id: number;
}

interface AvailableSlotsProps {
  providerId: number;
  startDate: string;
  onSelectSlot: (slot: Slot) => void;
}

export default function AvailableSlots({ providerId, startDate, onSelectSlot }: AvailableSlotsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const slotsPerPage = 6;

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setIsLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          console.error("No logged-in user");
          return;
        }
        const token = await user.getIdToken();
        const response = await fetch(`https://curo-156q.onrender.com/api/appointments/slots?startDate=${startDate}&days=7&providerId=${providerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const data = await response.json();
        setSlots(data.data?.[0]?.slots || []);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (providerId && startDate) {
      fetchAvailableSlots();
    }
  }, [providerId, startDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!slots?.length) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No available slots</h3>
        <p className="mt-1 text-sm text-gray-500">Try selecting a different date.</p>
      </div>
    );
  }

  // Group slots by date
  const slotsByDate = slots.reduce((acc: { [key: string]: Slot[] }, slot) => {
    const date = format(new Date(slot.time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  const dates = Object.keys(slotsByDate).sort();
  const currentDate = dates[0]; // Show slots for the first available date
  const currentDateSlots = slotsByDate[currentDate] || [];

  // Calculate pagination
  const totalPages = Math.ceil(currentDateSlots.length / slotsPerPage);
  const startIndex = (currentPage - 1) * slotsPerPage;
  const endIndex = startIndex + slotsPerPage;
  const paginatedSlots = currentDateSlots.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Available slots for {format(new Date(currentDate), 'EEEE, MMMM d, yyyy')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {paginatedSlots.map((slot, index) => (
            <Button
              key={index}
              onClick={() => onSelectSlot(slot)}
              variant="outline"
              className="p-4 h-auto flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Calendar className="h-5 w-5 mb-2 text-blue-500" />
              <span className="text-lg font-semibold">
                {format(new Date(slot.time), 'h:mm a')}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}