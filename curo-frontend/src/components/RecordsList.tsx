import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAuth } from "firebase/auth";

export default function RecordsList() {
  interface Record {
    id: string;
    type: string;
    details: any;
    uploaded_file_url?: string;
  }

  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No logged-in user. Please sign in first.");
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:3000/api/health-records", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setRecords(result.records);
      } else {
        console.error("Error fetching records:", result.error);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Your Medical Records</h2>
      {records.map((record) => (
        <Card key={record.id} className="bg-white border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-600">{record.type}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-600"><strong className="text-gray-700">Details:</strong> {JSON.stringify(record.details)}</p>
            {record.uploaded_file_url && (
              <a href={record.uploaded_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                View File
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
