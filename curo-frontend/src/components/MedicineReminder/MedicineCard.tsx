
import { Clock, Edit2, Trash2 ,Calendar} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import type { Medicine } from '../../types/Medicine.ts';
interface MedicineCardProps extends Omit<Medicine, 'id'> {
    onEdit: () => void;
    onDelete: () => void;
  }

export function MedicineCard({ name, dosage, time, days, onEdit, onDelete }: MedicineCardProps) {
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{dosage}</p>
            <div className="flex items-center text-sm text-blue-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{time}</span>
            </div>
            <div className="flex items-center text-sm text-emerald-600">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{days.map(day => day.slice(0, 3)).join(', ')}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }