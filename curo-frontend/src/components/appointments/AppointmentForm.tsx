import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import AvailableSlots from './AvailableSlots';
import PatientSelector from './PatientSelector';

interface AppointmentFormProps {
  selectedDoctor: any;
  selectedSlot?: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
  isEditing?: boolean;
  appointmentData?: any;
  isSubmitting?: boolean;
  onPatientCreated?: (patientId: number) => void;
  patientId?: number | null;
}

interface Slot {
  time: string;
  operatory_id: number;
  provider_id: number;
}

export default function AppointmentForm({
  selectedDoctor,
  selectedSlot,
  onSubmit,
  onBack,
  isEditing = false,
  appointmentData,
  isSubmitting = false
}: AppointmentFormProps) {
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState(selectedSlot?.time || '');
  const [notes, setNotes] = useState(appointmentData?.notes || '');
  const [selectedOperatoryId, setSelectedOperatoryId] = useState<number | null>(126045);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTime || !selectedOperatoryId || !selectedPatientId) {
      return;
    }

    const formattedDateTime = new Date(selectedTime).toISOString();
    console.log('Submitting appointment:', {
      patient_id: selectedPatientId,
      provider_id: selectedDoctor.id,
      operatory_id: selectedOperatoryId,
      start_time: formattedDateTime,
      notes: notes,
      provider_name: selectedDoctor.name,
    });

    onSubmit({
      patient_id: selectedPatientId,
      provider_id: selectedDoctor.id,
      operatory_id: selectedOperatoryId,
      start_time: formattedDateTime,
      notes: notes,
      provider_name: selectedDoctor.name,
    });
  };

  const handleSelectSlot = (slot: Slot) => {
    console.log('Selected slot:', slot);
    setSelectedTime(slot.time);
    setSelectedOperatoryId(slot.operatory_id);
  };

  const handlePatientSelected = (patientId: number) => {
    console.log('Patient selected:', patientId);
    setSelectedPatientId(patientId);
  };

  if (!selectedPatientId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4"
        >
          ← Back
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Patient Verification</h2>
          <PatientSelector 
            onPatientSelected={handlePatientSelected} 
            providerid={selectedDoctor.id} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-4"
      >
        ← Back
      </Button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Appointment' : 'Book Appointment'}
        </h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Selected Doctor</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Dr. {selectedDoctor.name}</p>
            <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEditing && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                <AvailableSlots
                  providerId={selectedDoctor.id}
                  startDate={startDate}
                  onSelectSlot={handleSelectSlot}
                />
                {selectedTime && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected time: {format(new Date(selectedTime), 'h:mm a')}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={(!selectedTime || !selectedOperatoryId) && !isEditing || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Booking...'}
                </div>
              ) : (
                isEditing ? 'Update Appointment' : 'Book Appointment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}