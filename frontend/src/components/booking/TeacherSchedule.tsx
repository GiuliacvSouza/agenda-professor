import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Calendar, Clock, ArrowLeft, BookOpen, Mail, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import { createBooking, getBookingsForTeacher } from "../../services/booking.backend";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  course?: string;
  courses?: string[];
  avatar?: string;
  email?: string;
  availability: string[];
}

interface TimeSlot {
  id: string;
  date: string; // human readable date (weekday + day month)
  isoDate?: string; // ISO date string used for backend (YYYY-MM-DD)
  time: string;
  available: boolean;
}

interface TeacherScheduleProps {
  teacher: Teacher;
  onBack: () => void;
}

export function TeacherSchedule({ teacher, onBack }: TeacherScheduleProps) {
  console.log('TeacherSchedule received teacher prop:', teacher);
  console.log('Teacher availability:', teacher?.availability);
  console.log('Teacher availability type:', typeof teacher?.availability);
  console.log('Teacher availability isArray:', Array.isArray(teacher?.availability));
  console.log('Teacher availability length:', teacher?.availability?.length);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingReason, setBookingReason] = useState("");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  // Early return if no teacher data
  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Ensure teacher has required properties
  const safeTeacher = {
    id: teacher?.id || '',
    name: teacher?.name || 'Professor',
    subject: teacher?.subject || 'Professor',
    course: teacher?.course || 'N/A',
    courses: Array.isArray((teacher as any)?.courses) && (teacher as any).courses.length ? (teacher as any).courses : (teacher?.course ? String(teacher.course).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
    unidades: Array.isArray((teacher as any)?.unidades) && (teacher as any).unidades.length ? (teacher as any).unidades.flatMap((g: any) => g.unidades) : [],
    email: teacher?.email || '',
    availability: teacher?.availability || []
  };

  // Generate real time slots based on teacher's availability
  const generateTimeSlots = (bookedSet: Set<string>): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    console.log('generateTimeSlots called');
    console.log('safeTeacher:', safeTeacher);
    console.log('safeTeacher.availability:', safeTeacher?.availability);

    // Check if teacher and availability exist
    if (!safeTeacher || !safeTeacher.availability || !Array.isArray(safeTeacher.availability) || safeTeacher.availability.length === 0) {
      console.log('No availability data, returning empty slots');
      return slots;
    }

    const today = new Date();
    
    // Process each availability entry
    safeTeacher.availability.forEach((availability, index) => {
      console.log(`Processing availability ${index}:`, availability);
      try {
            // Robust parse: day name and time range (handles spaces around dash)
        const m = String(availability).match(/([^\d]+)\s+(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
        if (!m) {
          console.log('Invalid availability format:', availability);
          return;
        }
        const dayName = m[1].trim();
        const timeRange = m[2].replace(/\s+/g, ''); // remove spaces around -

        console.log('dayName:', dayName, 'timeRange:', timeRange);

        const [startTimeRaw, endTimeRaw] = timeRange.split('-');
        if (!startTimeRaw || !endTimeRaw) return;

        const [startHourStr, startMinStr] = startTimeRaw.split(':');
        const [endHourStr, endMinStr] = endTimeRaw.split(':');

        const startHour = parseInt(startHourStr, 10);
        const startMin = parseInt(startMinStr || '0', 10);
        const endHour = parseInt(endHourStr, 10);
        const endMin = parseInt(endMinStr || '0', 10);

        if ([startHour, startMin, endHour, endMin].some(isNaN)) {
          console.log('Invalid time numbers:', startTimeRaw, endTimeRaw);
          return;
        }

        // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
        const dayMap: { [key: string]: number } = {
          'domingo': 0,
          'segunda-feira': 1,
          'segunda': 1,
          'terça-feira': 2,
          'terça': 2,
          'quarta-feira': 3,
          'quarta': 3,
          'quinta-feira': 4,
          'quinta': 4,
          'sexta-feira': 5,
          'sexta': 5,
          'sábado': 6,
          'sabado': 6
        };

        const targetDay = dayMap[dayName.toLowerCase()];
        if (targetDay === undefined) {
          console.log('Invalid day name:', dayName);
          return; // Skip invalid day names
        }

        console.log('targetDay:', targetDay);

        // For the next 7 days, add slots only when the weekday matches targetDay
        for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + dayOffset);

          if (targetDate.getDay() !== targetDay) continue;

          const dateStr = targetDate.toLocaleDateString('pt-PT', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
          });

          console.log('Creating slots for date:', dateStr);

          // Create 30-min slots between start and end
          const slotStart = new Date(targetDate);
          slotStart.setHours(startHour, startMin, 0, 0);
          const slotEnd = new Date(targetDate);
          slotEnd.setHours(endHour, endMin, 0, 0);

          for (let cur = new Date(slotStart); cur < slotEnd; cur.setMinutes(cur.getMinutes() + 30)) {
            const hh = cur.getHours().toString().padStart(2, '0');
            const mm = cur.getMinutes().toString().padStart(2, '0');
            const timeStr = `${hh}:${mm}`;
            const key = `${dateStr}-${timeStr}`;
            const isoDate = targetDate.toISOString().split('T')[0];

            slots.push({
              id: `${dateStr}-${timeStr}-${index}`,
              date: dateStr,
              isoDate,
              time: timeStr,
              available: !bookedSet.has(key),
            });

            console.log('Created slot:', { date: dateStr, time: timeStr });
          }
        }
      } catch (error) {
        console.error('Error processing availability:', availability, error);
      }
    });

    console.log('Total slots generated:', slots.length);
    return slots;
  };

  const [bookedSet, setBookedSet] = useState<Set<string>>(new Set());

  // Fetch bookings for this teacher and populate bookedSet
  useEffect(() => {
    if (!safeTeacher.id) return;
    let mounted = true;
    (async () => {
      try {
        const bookings: any[] = await getBookingsForTeacher(safeTeacher.id);
        const set = new Set<string>();
        bookings.forEach((b) => {
          try {
            const d = new Date(b.date);
            const dateStr = d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' });
            set.add(`${dateStr}-${b.time}`);
          } catch (e) {
            // ignore malformed booking
          }
        });
        if (mounted) setBookedSet(set);
      } catch (error) {
        console.error('Erro ao buscar agendamentos do professor:', error);
      }
    })();
    return () => { mounted = false; };
  }, [safeTeacher.id]);

  const timeSlots = generateTimeSlots(bookedSet);
  console.log('timeSlots:', timeSlots);

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  console.log('slotsByDate:', slotsByDate);
  console.log('slotsByDate keys:', Object.keys(slotsByDate));

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setIsBookingDialogOpen(true);
    }
  };

  const handleBooking = async () => {
    if (selectedSlot && bookingReason.trim()) {
      try {
        // Send ISO date to backend, keep human-readable for display
        const bookingDate = selectedSlot.isoDate ?? selectedSlot.date;
        await createBooking(safeTeacher.id, bookingDate, selectedSlot.time, bookingReason);
        toast.success("Reserva solicitada com sucesso!", {
          description: `Aguarde confirmação do professor para ${selectedSlot.date} às ${selectedSlot.time}`,
        });
        setIsBookingDialogOpen(false);
        setBookingReason("");
        setSelectedSlot(null);
      } catch (error: any) {
        toast.error("Erro ao criar reserva", {
          description: error.message,
        });
      }
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
                  {safeTeacher.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                <div>
                  <h1 className="text-xl sm:text-2xl">{safeTeacher.name}</h1>
                  <p className="text-sm sm:text-base text-gray-600">{safeTeacher.subject}</p>
                </div>
                {safeTeacher.unidades && safeTeacher.unidades.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-gray-500">Unidades:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {safeTeacher.unidades.map((u, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{u}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 justify-center sm:justify-start">
                    <BookOpen className="size-3 sm:size-4" />
                    <span>{(safeTeacher.courses && safeTeacher.courses.length) ? safeTeacher.courses.join(', ') : safeTeacher.course}</span>
                  </div>
                  {safeTeacher.email && (
                    <div className="flex items-center gap-2 text-gray-600 justify-center sm:justify-start">
                      <Mail className="size-3 sm:size-4" />
                      <span className="truncate">{safeTeacher.email}</span>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">Horários regulares:</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {safeTeacher.availability.map((slot, idx) => (
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
            {Object.keys(slotsByDate).length === 0 ? (
              <div className="text-center py-12">
                <Clock className="size-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum horário disponível no momento</p>
                <p className="text-sm text-gray-400 mt-2">
                  O professor ainda não definiu seus horários de atendimento.
                </p>
              </div>
            ) : (
              Object.entries(slotsByDate).map(([date, slots]) => (
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
              ))
            )}
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
              Reserve um atendimento com {safeTeacher.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-gray-500" />
                <span className="font-medium">{safeTeacher.name}</span>
              </div>
              {(safeTeacher.courses && safeTeacher.courses.length) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="size-4" />
                  <span>{safeTeacher.courses.join(', ')}</span>
                </div>
              )}
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