import  { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import PatientForm from './PatientForm';
import { Button } from '../ui/button';

interface PatientSelectorProps {
  onPatientSelected: (patientId: number) => void;
  providerid: number;
}

export default function PatientSelector({ onPatientSelected, providerid }: PatientSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    checkExistingPatient();
  }, []);

  const checkExistingPatient = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user?.email) {
        setError('No authenticated user found');
        setDebugInfo({ stage: 'auth-check', error: 'No user email' });
        return;
      }

      console.log('Checking patient with email:', user.email);
      
      const token = await user.getIdToken();
      console.log('Got auth token');

      const checkUrl = `https://curo-156q.onrender.com/api/appointments/patients/check?email=${encodeURIComponent(user.email)}`;
      console.log('Checking URL:', checkUrl);

      const response = await fetch(checkUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Patient check response:', data);
      
      if (data.exists) {
        console.log('Patient exists, ID:', data.patientId);
        onPatientSelected(data.patientId);
      } else {
        console.log('Patient does not exist, showing create form');
        setShowCreateForm(true);
      }
    } catch (err) {
      console.error('Patient check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check patient status');
      setDebugInfo({
        stage: 'api-call',
        error: err instanceof Error ? err.message : String(err),
        providerid
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePatient = async (patientData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      const token = await user.getIdToken();
      console.log('Creating patient with provider ID:', providerid);

      const response = await fetch(`https://curo-156q.onrender.com/api/appointments/patients?providerid=${providerid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(patientData),
      });
      
      const responseText = await response.text();
      console.log('Create patient response:', responseText);

      if (!response.ok) {
        let errorMessage = 'Failed to create patient';
        try {
          const errorData = JSON.parse(responseText);
          if (response.status === 400 && errorData.message?.includes('already exists')) {
            const existingId = errorData.message.match(/id=(\d+)/)?.[1];
            if (existingId) {
              console.log('Found existing patient ID:', existingId);
              onPatientSelected(parseInt(existingId, 10));
              return;
            }
          }
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const data = JSON.parse(responseText);
      console.log('Patient created successfully:', data);
      onPatientSelected(data.data.id);
    } catch (err) {
      console.error('Create patient error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create patient');
      setDebugInfo({
        stage: 'create-patient',
        error: err instanceof Error ? err.message : String(err),
        providerid
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-center text-sm text-gray-500">Checking patient status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error: {error}</p>
          {debugInfo && (
            <pre className="mt-2 text-xs bg-red-100 p-2 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          )}
        </div>
        <Button
          onClick={() => {
            setError(null);
            setDebugInfo(null);
            checkExistingPatient();
          }}
          className="w-full"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Create Patient Profile</h2>
        <PatientForm
          onSubmit={handleCreatePatient}
          onCancel={() => setShowCreateForm(false)}
          providerid={providerid}
        />
      </div>
    );
  }

  return null;
}