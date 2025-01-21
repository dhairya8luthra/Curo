import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, FileText, MoreVertical, Pencil, Stethoscope, Syringe, Trash2 } from 'lucide-react';
import { getAuth } from "firebase/auth";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import EditRecordForm from "./EditRecordForm";
interface Record {
  id: string;
  type: string;
  details: any;
  uploaded_file_url?: string;
}
interface RecordsListProps {
  records: Record[];
  setRecords: React.Dispatch<React.SetStateAction<Record[]>>;
}

export default function RecordsList({ records, setRecords }: RecordsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<Record | null>(null);
  const recordsPerPage = 3;
  const sortRecordsByDate = (records: Record[]) => {
    return [...records].sort((a, b) => {
      const getDate = (record: Record) => {
        const details = record.details;
        return details.consultationDate || 
               details.surgeryDate || 
               (details.medicines?.[0]?.startDate) ||
               new Date().toISOString(); // fallback for records without dates
      };
      
      return new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime();
    });
  };

  
  const handleDelete = async (recordId: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("No logged-in user. Please sign in first.");
      return;
    }
    try {
      const token = await user.getIdToken();
      const response = await fetch(`https://curo-156q.onrender.com/api/health-records/${recordId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setRecords(records.filter(record => record.id !== recordId));
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
      } else {
        const errorResponse = await response.json();
        console.error("Error deleting record:", errorResponse.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleEdit = (record: Record) => {
    setRecordToEdit(record);
    setEditDialogOpen(true);
  };
  const handleUpdate = async (updatedRecord: Record) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error("No logged-in user");
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`https://curo-156q.onrender.com/api/health-records/${updatedRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: updatedRecord.type,
          details: updatedRecord.details,
          uploaded_file_url: updatedRecord.uploaded_file_url
        }),
      });
      const result = await response.json();
      console.log('Server response:', result); // 

      if (response.ok) {
        setRecords(prevRecords => 
          sortRecordsByDate(prevRecords.map(record => 
            record.id === updatedRecord.id 
              ? { ...updatedRecord } // Keep the existing record with updates
              : record
          ))
        );
      }
    } catch (error) {
      console.error("Error updating record:", error);
    }
    
    setEditDialogOpen(false);
    setRecordToEdit(null);
  };
  const getRecordIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'test':
        return <FileText className="h-5 w-5" />;
      case 'prescription':
        return <Syringe className="h-5 w-5" />;
      case 'consultation':
        return <Stethoscope className="h-5 w-5" />;
      case 'surgery':
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);
  const renderPaginationItems = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };
  const renderTestDetails = (details: any) => {
    if (!details.tests || !Array.isArray(details.tests)) return null;
    return (
      <div className="space-y-4">
        {details.tests.map((test: any, index: number) => (
          <div key={index} className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-700 mb-2">Test {index + 1}</h4>
            <div className="grid gap-2">
              <p><span className="font-medium">Parameter:</span> {test.parameter}</p>
              <p><span className="font-medium">Value:</span> {test.value}</p>
              <p>
                <span className="font-medium">Result:</span>
                <Badge 
                  variant={test.result === 'normal' ? 'default' : 'destructive'}
                  className="ml-2"
                >
                  {test.result}
                </Badge>
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderPrescriptionDetails = (details: any) => {
    if (!details.medicines || !Array.isArray(details.medicines)) return null;
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <p><span className="font-medium">Doctor:</span> {details.doctorName}</p>
          {details.diagnosis && (
            <p><span className="font-medium">Diagnosis:</span> {details.diagnosis}</p>
          )}
        </div>
        {details.medicines.map((medicine: any, index: number) => (
          <div key={index} className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-700 mb-2">Medicine {index + 1}</h4>
            <div className="grid gap-2">
              <p><span className="font-medium">Name:</span> {medicine.name}</p>
              <p><span className="font-medium">Frequency:</span> {medicine.frequency}</p>
              {medicine.timing && (
                <p><span className="font-medium">Times per day:</span> {medicine.timing}</p>
              )}
              {medicine.days && medicine.days.length > 0 && (
                <p><span className="font-medium">Days:</span> {medicine.days.join(', ')}</p>
              )}
              {medicine.startDate && (
                <p><span className="font-medium">Start Date:</span> {medicine.startDate}</p>
              )}
              {medicine.duration && (
                <p><span className="font-medium">Duration:</span> {medicine.duration} days</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderConsultationDetails = (details: any) => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid gap-2">
            <p><span className="font-medium">Doctor:</span> {details.doctorName}</p>
            <p><span className="font-medium">Date:</span> {details.consultationDate}</p>
            {details.doctorNote && (
              <div>
                <p className="font-medium mb-1">Doctor's Note:</p>
                <p className="bg-white p-3 rounded-md">{details.doctorNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderSurgeryDetails = (details: any) => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid gap-2">
            <p><span className="font-medium">Date:</span> {details.surgeryDate}</p>
            {details.surgeryDetails && (
              <div>
                <p className="font-medium mb-1">Surgery Details:</p>
                <p className="bg-white p-3 rounded-md">{details.surgeryDetails}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderDetails = (record: Record) => {
    switch (record.type.toLowerCase()) {
      case 'test':
        return renderTestDetails(record.details);
      case 'prescription':
        return renderPrescriptionDetails(record.details);
      case 'consultation':
        return renderConsultationDetails(record.details);
      case 'surgery':
        return renderSurgeryDetails(record.details);
      default:
        return <pre className="text-sm">{JSON.stringify(record.details, null, 2)}</pre>;
    }
  };
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Your Medical Records</h2>
      {currentRecords.map((record) => (
        <Card key={record.id} className="bg-white border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="bg-blue-50 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              {getRecordIcon(record.type)}
              <CardTitle className="text-blue-600">{record.type}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(record)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => {
                    setRecordToDelete(record.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="pt-4">
            {renderDetails(record)}
            {record.uploaded_file_url && (
              <div className="mt-4 pt-4 border-t">
                <a 
                  href={record.uploaded_file_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:text-blue-700 underline flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Attached File
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {records.length > recordsPerPage && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {renderPaginationItems()}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medical record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => recordToDelete && handleDelete(recordToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <EditRecordForm
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        record={recordToEdit}
        onUpdate={handleUpdate}
      />
    </div>
  );
}