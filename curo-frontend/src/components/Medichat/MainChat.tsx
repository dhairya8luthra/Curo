import  { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, Paperclip,FileText,Stethoscope,Syringe,Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getAuth } from "firebase/auth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HealthRecord {
  id: string;
  type: string;
  details: any;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Welcome to MediChat AI Doctor 👋. Please note that I am an AI assistant and not a real doctor. I can provide general health information, but for any serious concerns, always consult with a qualified healthcare professional.",
};

const RECORDS_PER_PAGE = 5;

export default function MediChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("No logged-in user. Please sign in first.");
      return;
    }
    const token = await user.getIdToken();
    try {
      const response = await fetch("http://localhost:3000/api/health-records", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch health records");
      }
      const data = await response.json();
      setHealthRecords(data.records);
    } catch (error) {
      console.error("Error fetching health records:", error);
    }
  };

  const handleSend = async () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      const userQuestion = input.trim();
      setInput("");

      try {
        const selectedHealthRecords = healthRecords.filter((record) =>
          selectedRecords.includes(record.id)
        );
        const medicalRecordsText = selectedHealthRecords
          .map((record) => `${record.type}: ${JSON.stringify(record.details)}`)
          .join("\n");

        const response = await fetch("http://localhost:3000/api/medi-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            question: userQuestion,
            medicalRecordsText,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer || "No answer returned." },
        ]);
      } catch (error) {
        console.error("Error calling /medi-chat:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, there was an error getting the answer.",
          },
        ]);
      }

      setSelectedRecords([]);
    }
  };

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((recordId) => recordId !== id) : [...prev, id]
    );
  };
  const getRecordIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'test':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'prescription':
        return <Syringe className="h-5 w-5 text-green-600" />;
      case 'consultation':
        return <Stethoscope className="h-5 w-5 text-purple-600" />;
      case 'surgery':
        return <Calendar className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderRecordDetails = (record: HealthRecord) => {
    switch (record.type.toLowerCase()) {
      case 'test':
        return record.details.tests?.map((test: any, index: number) => (
          <div key={index} className="mt-2">
            <Badge variant={test.result === 'normal' ? 'default' : 'destructive'} className="bg-blue-600 text-white">
              {test.parameter}: {test.value}
            </Badge>
          </div>
        ));
      case 'prescription':
        return record.details.medicines?.map((medicine: any, index: number) => (
          <div key={index} className="mt-2">
            <Badge variant="outline" className="border-blue-600 text-blue-700">
              {medicine.name} - {medicine.frequency}
            </Badge>
          </div>
        ));
      case 'consultation':
        return (
          <Badge variant="outline" className="mt-2 border-blue-600 text-blue-700">
            Dr. {record.details.doctorName} - {record.details.consultationDate}
          </Badge>
        );
      case 'surgery':
        return (
          <Badge variant="outline" className="mt-2 border-blue-600 text-blue-700">
            {record.details.surgeryDate}
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderHealthRecords = () => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;
    const displayedRecords = healthRecords.slice(startIndex, endIndex);

    return (
      <div className="space-y-4">
        {displayedRecords.map((record) => (
          <Card key={record.id} className="mb-2 hover:border-blue-600 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Checkbox
                  id={record.id}
                  checked={selectedRecords.includes(record.id)}
                  onCheckedChange={() => toggleRecordSelection(record.id)}
                  className="mt-1 h-4 w-4 rounded-full border-blue-600 data-[state=checked]:bg-blue-600"
                />
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-2">
                    {getRecordIcon(record.type)}
                    <Label htmlFor={record.id} className="text-sm font-medium text-blue-700">
                      {record.type}
                    </Label>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-md">
                    {renderRecordDetails(record)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <Card className="w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl rounded-xl bg-white/90 backdrop-blur-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-400 text-white rounded-t-xl p-4 shadow-md">
          <CardTitle className="text-center text-2xl font-bold">
            MediChat - AI 👨‍⚕️🤖 Doctor
          </CardTitle>
          <p className="text-center text-sm text-gray-100 mt-1">
            Remember: I'm not a real doctor. For serious concerns, consult a healthcare professional.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col flex-grow h-full">
          <div
            className="flex-grow overflow-y-auto p-4 space-y-4"
            ref={scrollRef}
            style={{ maxHeight: "70vh" }}
          >
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              const bubbleClasses = isUser
                ? "bg-blue-500 text-white shadow-lg rounded-br-lg rounded-tl-lg"
                : "bg-gray-100 text-gray-800 shadow-md rounded-bl-lg rounded-tr-lg";

              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-start space-x-2 ${isUser ? "flex-row-reverse" : ""}`}>
                    <Avatar
                      className={`${
                        isUser ? "ml-3" : "mr-3"
                      } h-10 w-10 shadow-md`}
                    >
                      <AvatarImage src="" alt="Avatar" />
                      <AvatarFallback>
                        {isUser ? <User /> : <Bot />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-sm px-4 py-2 ${bubbleClasses} transform transition-transform hover:scale-105`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-b-xl flex items-center p-4 border-t border-gray-200 shadow-inner">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button
              onClick={() => setIsAttachModalOpen(true)}
              className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md transform hover:scale-105 rounded-full p-3"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleSend}
              className="ml-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105 rounded-full p-3"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAttachModalOpen} onOpenChange={setIsAttachModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Attach Health Records</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            {renderHealthRecords()}
          </ScrollArea>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} text-blue-700 hover:text-blue-600`}
                />
              </PaginationItem>
              {Array.from({ length: Math.ceil(healthRecords.length / RECORDS_PER_PAGE) }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className={currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-blue-700 hover:text-blue-600'}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(healthRecords.length / RECORDS_PER_PAGE), prev + 1))}
                  className={`${currentPage === Math.ceil(healthRecords.length / RECORDS_PER_PAGE) ? 'pointer-events-none opacity-50' : ''} text-blue-700 hover:text-blue-600`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAttachModalOpen(false)} className="text-blue-700 border-blue-600 hover:bg-blue-50">
              Cancel
            </Button>
            <Button onClick={() => setIsAttachModalOpen(false)} className="bg-blue-600 text-white hover:bg-blue-700">
              Attach
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

