import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// This is a placeholder component. In a real application, you would fetch this data from your backend.
const mockRecords = [
  { id: 1, type: "Test", date: "2023-06-01", description: "Blood Test" },
  { id: 2, type: "Prescription", date: "2023-05-15", description: "Antibiotics" },
  { id: 3, type: "Consultation", date: "2023-04-22", description: "Annual Checkup" },
];

export default function RecordsList() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Your Medical Records</h2>
      {mockRecords.map((record) => (
        <Card key={record.id} className="bg-white border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-600">{record.type}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-600"><strong className="text-gray-700">Date:</strong> {record.date}</p>
            <p className="text-gray-600"><strong className="text-gray-700">Description:</strong> {record.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}