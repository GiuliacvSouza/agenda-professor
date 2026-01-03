import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Calendar, Clock, ArrowLeft, BookOpen, Mail, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  course: string;
  avatar?: string;
  email?: string;
  availability: string[];
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

interface TeacherScheduleProps {
  teacher: Teacher;
  onBack: () => void;
}

export function TeacherSchedule({ teacher, onBack }: TeacherScheduleProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingReason, setBookingReason] = useState("");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  // Mock time slots for the next week
  const timeSlots: TimeSlot[] = [
    // Segunda-feira (25 Nov)
    { id: "1", date: "25 Nov 2025", time: "10:00", available: true },
    { id: "2", date: "25 Nov 2025", time: "11:00", available: false },
    { id: "3", date: "25 Nov 2025", time: "12:00", available: true },
    // Quarta-feira (27 Nov)
    { id: "4", date: "27 Nov 2025", time: "14:00", available: true },
    { id: "5", date: "27 Nov 2025", time: "15:00", available: true },
    { id: "6", date: "27 Nov 2025", time: "16:00", available: false },
    // Segunda-feira (2 Dez)
    { id: "7", date: "2 Dez 2025", time: "10:00", available: true },
    { id: "8", date: "2 Dez 2025", time: "11:00", available: true },
    // Quarta-feira (4 Dez)
    { id: "9", date: "4 Dez 2025", time: "14:00", available: true },
    { id: "10", date: "4 Dez 2025", time: "15:00", available: false },
  ];

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setIsBookingDialogOpen(true);
    }
  };

  const handleBooking = () => {
    if (selectedSlot && bookingReason.trim()) {
      toast.success("Reserva solicitada com sucesso!", {
        description: `Aguarde confirmação do professor para ${selectedSlot.date} às ${selectedSlot.time}`,
      });
      setIsBookingDialogOpen(false);
      setBookingReason("");
      setSelectedSlot(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <ArrowLeft className="size-3 sm:size-4" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Teacher Info Card */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto sm:mx-0">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg sm:text-xl">
                  {teacher.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                <div>
                  <h1 className="text-xl sm:text-2xl">{teacher.name}</h1>
                  <p className="text-sm sm:text-base text-gray-600">{teacher.subject}</p>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 justify-center sm:justify-start">
                    <BookOpen className="size-3 sm:size-4" />
                    <span>{teacher.course}</span>
                  </div>
                  {teacher.email && (
                    <div className="flex items-center gap-2 text-gray-600 justify-center sm:justify-start">
                      <Mail className="size-3 sm:size-4" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">Horários regulares:</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {teacher.availability.map((slot, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="size-4 sm:size-5" />
              Horários Disponíveis
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Selecione um horário disponível para reservar um atendimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {Object.entries(slotsByDate).map(([date, slots]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Calendar className="size-3 sm:size-4 text-gray-500" />
                  <h3 className="font-medium text-sm sm:text-base text-gray-900">{date}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      disabled={!slot.available}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        slot.available
                          ? "border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 cursor-pointer"
                          : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <Clock className={`size-3 sm:size-4 ${slot.available ? "text-blue-600" : "text-gray-400"}`} />
                        <span className={`text-sm sm:text-base font-medium ${slot.available ? "text-blue-700" : "text-gray-400"}`}>
                          {slot.time}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 text-center">
                        {slot.available ? "Disponível" : "Ocupado"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-400 bg-blue-50"></div>
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gray-200 bg-gray-50"></div>
            <span>Ocupado</span>
          </div>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>
              Reserve um atendimento com {teacher.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-gray-500" />
                <span className="font-medium">{teacher.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="size-4" />
                <span>{selectedSlot?.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="size-4" />
                <span>{selectedSlot?.time}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo do atendimento</Label>
              <Textarea
                id="reason"
                placeholder="Descreva brevemente o motivo do atendimento..."
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsBookingDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleBooking}
                disabled={!bookingReason.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}