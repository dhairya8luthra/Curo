import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DaySelector } from './DaySelector';
import type { Medicine, DayOfWeek } from '../../types/Medicine.ts';

interface EditMedicineDialogProps {
  medicine: Medicine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: number, medicine: Omit<Medicine, 'id'>) => void;
}

export function EditMedicineDialog({ medicine, open, onOpenChange, onEdit }: EditMedicineDialogProps) {
  const [name, setName] = React.useState(medicine.name);
  const [dosage, setDosage] = React.useState(medicine.dosage);
  const [time, setTime] = React.useState(medicine.time);
  const [selectedDays, setSelectedDays] = React.useState<DayOfWeek[]>(medicine.days as DayOfWeek[]);

  React.useEffect(() => {
    setName(medicine.name);
    setDosage(medicine.dosage);
    setTime(medicine.time);
    setSelectedDays(medicine.days as DayOfWeek[]);
  }, [medicine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(medicine.id, { name, dosage, time, days: selectedDays });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Medicine Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter medicine name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dosage">Dosage</Label>
            <Input
              id="edit-dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 1 tablet"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-time">Time</Label>
            <Input
              id="edit-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Days</Label>
            <DaySelector selectedDays={selectedDays} onChange={setSelectedDays} />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={selectedDays.length === 0}
          >
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}