import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecentRecords() {
  const records = [
    {
      type: "Blood Test Results",
      date: "Mar 15, 2024",
      doctor: "Dr. Sarah Johnson",
      facility: "City General Hospital"
    },
    {
      type: "X-Ray Report",
      date: "Mar 10, 2024",
      doctor: "Dr. Robert Smith",
      facility: "Medical Imaging Center"
    },
    {
      type: "Vaccination Record",
      date: "Mar 5, 2024",
      doctor: "Dr. Emily Brown",
      facility: "Community Health Center"
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Health Records</h2>
        <Button variant="outline" size="sm">
          View All Records
        </Button>
      </div>

      <div className="space-y-4">
        {records.map((record, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">{record.type}</p>
                <p className="text-sm text-gray-500">
                  {record.doctor} • {record.facility}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{record.date}</span>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}