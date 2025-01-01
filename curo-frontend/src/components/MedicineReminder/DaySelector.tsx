
import { Button } from '../ui/button';
import type { DayOfWeek } from '../../types/Medicine';

interface DaySelectorProps {
    selectedDays: DayOfWeek[];
    onChange: (days: DayOfWeek[]) => void;
  }
  
  export function DaySelector({ selectedDays, onChange }: DaySelectorProps) {
    const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
    const toggleDay = (day: DayOfWeek) => {
      const newDays = selectedDays.includes(day)
        ? selectedDays.filter(d => d !== day)
        : [...selectedDays, day];
      onChange(newDays);
    };
  
    const toggleAll = () => {
      onChange(selectedDays.length === days.length ? [] : [...days]);
    };
  
    return (
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={toggleAll}
        >
          {selectedDays.length === days.length ? 'Deselect All' : 'Select All'}
        </Button>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <Button
              key={day}
              type="button"
              variant={selectedDays.includes(day) ? "default" : "outline"}
              className="w-20"
              onClick={() => toggleDay(day)}
            >
              {day.slice(0, 3)}
            </Button>
          ))}
        </div>
      </div>
    );
  }