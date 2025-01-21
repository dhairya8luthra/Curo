import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X } from 'lucide-react';

interface EditRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  record: Record | null;
  onUpdate: (updatedRecord: Record) => void;
}

interface Record {
  id: string;
  type: string;
  details: any;
  uploaded_file_url?: string;
}

export default function EditRecordForm({ isOpen, onClose, record, onUpdate }: EditRecordFormProps) {
  const [formData, setFormData] = useState<Record | null>(null);

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    onUpdate(formData);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, details: { ...prev.details, [name]: value } } : null);
  };
  const handleTestChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedTests = [...prev.details.tests];
      updatedTests[index] = { ...updatedTests[index], [field]: value };
      return { ...prev, details: { ...prev.details, tests: updatedTests } };
    });
  };
  const handleMedicineChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedMedicines = [...prev.details.medicines];
      updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
      return { ...prev, details: { ...prev.details, medicines: updatedMedicines } };
    });
  };
  const addTest = () => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedTests = [...(prev.details.tests || []), { parameter: '', value: '', result: '' }];
      return { ...prev, details: { ...prev.details, tests: updatedTests } };
    });
  };
  const removeTest = (index: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedTests = prev.details.tests.filter((_: any, i: number) => i !== index);
      return { ...prev, details: { ...prev.details, tests: updatedTests } };
    });
  };
  const addMedicine = () => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedMedicines = [...(prev.details.medicines || []), { name: '', dosage: '', frequency: '', duration: '' }];
      return { ...prev, details: { ...prev.details, medicines: updatedMedicines } };
    });
  };
  const removeMedicine = (index: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedMedicines = prev.details.medicines.filter((_: any, i: number) => i !== index);
      return { ...prev, details: { ...prev.details, medicines: updatedMedicines } };
    });
  };
  if (!formData) return null;
  const renderFormFields = () => {
    switch (formData.type.toLowerCase()) {
      case 'test':
        return (
          <>
            {formData.details.tests && formData.details.tests.map((test: any, index: number) => (
              <div key={index} className="space-y-4 p-4 bg-blue-50 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold text-blue-600">Test {index + 1}</Label>
                  {index > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => removeTest(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`parameter-${index}`}>Test Parameter</Label>
                  <Input
                    id={`parameter-${index}`}
                    value={test.parameter || ''}
                    onChange={(e) => handleTestChange(index, 'parameter', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`value-${index}`}>Test Value</Label>
                  <Input
                    id={`value-${index}`}
                    value={test.value || ''}
                    onChange={(e) => handleTestChange(index, 'value', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`result-${index}`}>Result</Label>
                  <Select
                    value={test.result || ''}
                    onValueChange={(value) => handleTestChange(index, 'result', value)}
                  >
                    <SelectTrigger id={`result-${index}`}>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="Increased">Increased</SelectItem>
                      <SelectItem value="Decreased">Decreased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addTest} className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Another Test
            </Button>
          </>
        );
      case 'prescription':
        return (
          <>
            {formData.details.medicines && formData.details.medicines.map((medicine: any, index: number) => (
              <div key={index} className="space-y-4 p-4 bg-blue-50 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold text-blue-600">Medicine {index + 1}</Label>
                  {index > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => removeMedicine(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`medicineName-${index}`}>Medicine Name</Label>
                  <Input
                    id={`medicineName-${index}`}
                    value={medicine.name || ''}
                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                  <Input
                    id={`dosage-${index}`}
                    value={medicine.dosage || ''}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`frequency-${index}`}>Frequency</Label>
                  <Input
                    id={`frequency-${index}`}
                    value={medicine.frequency || ''}
                    onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`duration-${index}`}>Duration</Label>
                  <Input
                    id={`duration-${index}`}
                    value={medicine.duration || ''}
                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button type="button" onClick={addMedicine} className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Another Medicine
            </Button>
            <div className="space-y-2 mt-4">
              <Label htmlFor="doctorName">Doctor's Name</Label>
              <Input
                id="doctorName"
                name="doctorName"
                value={formData.details.doctorName || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.details.diagnosis || ''}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      case 'consultation':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor's Name</Label>
              <Input
                id="doctorName"
                name="doctorName"
                value={formData.details.doctorName || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultationDate">Consultation Date</Label>
              <Input
                id="consultationDate"
                name="consultationDate"
                type="date"
                value={formData.details.consultationDate || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorNote">Doctor's Note</Label>
              <Textarea
                id="doctorNote"
                name="doctorNote"
                value={formData.details.doctorNote || ''}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      case 'surgery':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="surgeryDate">Surgery Date</Label>
              <Input
                id="surgeryDate"
                name="surgeryDate"
                type="date"
                value={formData.details.surgeryDate || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surgeryDetails">Surgery Details</Label>
              <Textarea
                id="surgeryDetails"
                name="surgeryDetails"
                value={formData.details.surgeryDetails || ''}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">Edit {formData.type} Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ScrollArea className="h-[60vh] pr-4">
            {renderFormFields()}
          </ScrollArea>
          <DialogFooter>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
              Update Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}