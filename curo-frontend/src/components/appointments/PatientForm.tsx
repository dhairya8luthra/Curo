import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface PatientFormProps {
  onSubmit: (patientData: any) => void;
  onCancel: () => void;
  providerid: number;
}

export default function PatientForm({ onSubmit, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: 'Female'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({

      patient: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        bio: {
          date_of_birth: formData.date_of_birth,
          phone_number: formData.phone_number,
          gender: formData.gender
        }
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <Input
            required
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            maxLength={15}
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <Input
            required
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            maxLength={20}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          required
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <Input
          required
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <Input
          required
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Patient</Button>
      </div>
    </form>
  );
}