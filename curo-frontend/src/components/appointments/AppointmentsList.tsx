import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, Edit2, X, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'

interface Appointment {
  id: string
  start_time: string
  provider_name: string
  confirmed: boolean
}

interface AppointmentsListProps {
  appointments: Appointment[]
  onEdit: (appointment: Appointment) => void
  onCancel: (appointmentId: string) => void
  isLoading: boolean
}

const ITEMS_PER_PAGE = 5

export default function AppointmentsList({ 
  appointments, 
  onEdit, 
  onCancel, 
  isLoading 
}: AppointmentsListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [paginatedAppointments, setPaginatedAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setPaginatedAppointments(appointments.slice(startIndex, endIndex))
  }, [appointments, currentPage])

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-primary animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!appointments?.length) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-12 text-center">
          <div className="relative mx-auto h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            <Calendar className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Your schedule is clear. Book your first appointment to begin your healthcare journey.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {paginatedAppointments.map((appointment) => (
        <Card 
          key={appointment.id} 
          className={cn(
            "group relative overflow-hidden transition-all duration-300",
            "hover:shadow-lg hover:translate-y-[-2px]",
            "bg-gradient-to-br from-white to-gray-50"
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
                      {format(new Date(appointment.start_time), 'h:mm a')}
                    </p>
                  </div>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium text-gray-600">
                      {format(new Date(appointment.start_time), 'EEEE, MMMM d, yyyy')}
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
                  <span className={cn(
                    "mr-1.5 h-1.5 w-1.5 rounded-full",
                    appointment.confirmed ? "bg-green-600" : "bg-yellow-600"
                  )}></span>
                  {appointment.confirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(appointment)}
                  className={cn(
                    "transition-colors duration-200",
                    "border-blue-200 text-blue-700 hover:bg-blue-50",
                    "hover:border-blue-300 hover:text-blue-800"
                  )}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(appointment.id)}
                  className={cn(
                    "transition-colors duration-200",
                    "border-red-200 text-red-700 hover:bg-red-50",
                    "hover:border-red-300 hover:text-red-800"
                  )}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={cn(
                    "transition-all duration-200",
                    currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={cn(
                    "transition-all duration-200",
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}