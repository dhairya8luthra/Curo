import  { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Calendar, Clock, User2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Appointment {
  id: string;
  start_time: string;
  provider_name: string;
  confirmed: boolean;
}

interface AppointmentsListProps {
  appointments: Appointment[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 5;

export default function AppointmentsList({
  appointments,
  isLoading,
}: AppointmentsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab1, setActiveTab1] = useState<"upcoming" | "past">("upcoming");

  const now = useMemo(() => new Date(), []); // Memoize now to prevent unnecessary recalculations

  // Memoize filteredAppointments to avoid unnecessary recalculations
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.start_time);
      return activeTab1 === "upcoming"
        ? appointmentDate >= now
        : appointmentDate < now;
    });
  }, [appointments, activeTab1, now]);

  // Memoize paginatedAppointments to avoid unnecessary recalculations
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAppointments.slice(startIndex, endIndex);
  }, [filteredAppointments, currentPage]);

  // Reset page when tab changes or filtered results change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab1, filteredAppointments.length]);

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

  // Rest of the component remains the same...
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-blue-200 animate-pulse"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const renderEmptyState = () => (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-blue-50 shadow-lg">
      <CardContent className="p-12 text-center">
        <div className="relative mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
          <Calendar className="h-12 w-12 text-blue-500" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          {activeTab1 === "upcoming"
            ? "No Upcoming Appointments"
            : "No Past Appointments"}
        </h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          {activeTab1 === "upcoming"
            ? "Your schedule is clear. Book your first appointment to begin your healthcare journey."
            : "You have no past appointments to display."}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <Tabs
        value={activeTab1}
        onValueChange={(value) => setActiveTab1(value as "upcoming" | "past")}
        className="w-full max-w-md mx-auto"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="text-sm font-medium">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="text-sm font-medium">
            Past
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {!filteredAppointments.length ? (
        renderEmptyState()
      ) : (
        <div className="space-y-8">
          {paginatedAppointments.map((appointment) => {
            const appointmentDate = new Date(appointment.start_time);
            const isPast = appointmentDate < now;

            return (
              <Card
                key={appointment.id}
                className={cn(
                  "group relative overflow-hidden transition-all duration-300",
                  "hover:shadow-lg hover:translate-y-[-2px]",
                  "bg-gradient-to-br from-white to-blue-50",
                  isPast && "opacity-75"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-blue-500/0 transition-all duration-500"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <p className="text-lg font-semibold text-gray-900">
                            {format(appointmentDate, "h:mm a")}
                          </p>
                        </div>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <p className="text-sm font-medium text-gray-600">
                            {format(appointmentDate, "EEEE, MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User2 className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-gray-700">
                          Dr. {appointment.provider_name}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors",
                          "ring-1 ring-inset",
                          appointment.confirmed
                            ? "bg-green-50 text-green-700 ring-green-600/20"
                            : "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                        )}
                      >
                        <span
                          className={cn(
                            "mr-1.5 h-1.5 w-1.5 rounded-full",
                            appointment.confirmed
                              ? "bg-green-600"
                              : "bg-yellow-600"
                          )}
                        ></span>
                        {appointment.confirmed ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={cn(
                        "transition-all duration-200",
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-gray-50"
                      )}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                        className={cn(
                          "transition-all duration-200",
                          currentPage === index + 1
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : "hover:bg-gray-50"
                        )}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={cn(
                        "transition-all duration-200",
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-gray-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}