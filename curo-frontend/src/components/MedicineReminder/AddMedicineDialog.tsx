import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus } from 'lucide-react';
import { DaySelector } from './DaySelector';
import type { Medicine, DayOfWeek } from '../../types/Medicine.ts';
interface AddMedicineDialogProps {
    onAdd: (medicine: Omit<Medicine, 'id'>) => void;
  }

  export function AddMedicineDialog({ onAdd }: AddMedicineDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [dosage, setDosage] = React.useState('');
    const [time, setTime] = React.useState('');
    const [selectedDays, setSelectedDays] = React.useState<DayOfWeek[]>([]);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAdd({ name, dosage, time, days: selectedDays });
      setOpen(false);
      setName('');
      setDosage('');
      setTime('');
      setSelectedDays([]);
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Medicine
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter medicine name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g., 1 tablet"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
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
              Add Medicine
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }