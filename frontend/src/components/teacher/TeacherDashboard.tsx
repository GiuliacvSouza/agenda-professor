import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Calendar, Clock, User, BookOpen, Bell, Plus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { loggedName, loggedRole, loggedEmail, loggedUserId } from "../auth/loggedUserInfo";
import { getBookings, updateBookingStatus } from "../../services/booking.backend";
import { updateUser } from "../../services/user.backend";
interface Booking {
  _id: string;
  student: {
    nome_completo: string;
    email: string;
    curso?: string;
  };
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  reason: string;
}

interface AvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface TeacherDashboardProps {
  onLogout: () => void;
  onViewNotifications: () => void;
  notifications: number;
}

export function TeacherDashboard({ onLogout, onViewNotifications, notifications }: TeacherDashboardProps) {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: "",
    startTime: "",
    endTime: "",
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getBookings();
        setBookings(data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAvailability = async () => {
      try {
        if (loggedUserId) {
          const userData = await updateUser(loggedUserId, {});
          if (userData.user && userData.user.horarios_disponiveis) {
            const slots = userData.user.horarios_disponiveis.map((slot: string, index: number) => ({
              id: `slot-${index}`,
              day: slot.split(' ')[0],
              startTime: slot.split(' ')[1]?.split('-')[0] || '',
              endTime: slot.split(' ')[1]?.split('-')[1] || '',
            }));
            setAvailabilitySlots(slots);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchBookings();
    fetchAvailability();
  }, []);

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(prev => prev.map(booking => 
        booking._id === id ? { ...booking, status: status as "confirmed" | "pending" | "cancelled" } : booking
      ));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const saveAvailabilityToBackend = async (slots: AvailabilitySlot[]) => {
    try {
      const horariosString = slots.map(slot => `${slot.day} ${slot.startTime}-${slot.endTime}`);
      await updateUser(loggedUserId, { horarios_disponiveis: horariosString });
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
    }
  };

  const handleAddSlot = () => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime) {
      const newSlots = [
        ...availabilitySlots,
        {
          id: Date.now().toString(),
          ...newSlot,
        },
      ];
      setAvailabilitySlots(newSlots);
      saveAvailabilityToBackend(newSlots);
      setNewSlot({ day: "", startTime: "", endTime: "" });
      setIsAddingSlot(false);
    }
  };

  const handleRemoveSlot = (id: string) => {
    const newSlots = availabilitySlots.filter((slot) => slot.id !== id);
    setAvailabilitySlots(newSlots);
    saveAvailabilityToBackend(newSlots);
  };

  const getStatusColor = (status: Booking["status"]) => {
    return status === "confirmed"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const getStatusText = (status: Booking["status"]) => {
    return status === "confirmed" ? "Confirmada" : "Pendente";
  };

  // Filtra agendamentos não cancelados para exibição
  const activeBookings = bookings.filter(b => b.status !== "cancelled");
  const upcomingBookings = activeBookings.filter(b => b.status === "confirmed").length;
  const pendingBookings = activeBookings.filter(b => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="size-4 sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg">Olá, {loggedRole}(a) {loggedName}</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Gerir as suas aulas</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 sm:h-10 sm:w-10"
              onClick={onViewNotifications}
            >
              <Bell className="size-4 sm:size-5"/>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={onLogout} size="sm" className="text-xs sm:text-sm">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Aulas Agendadas</CardTitle>
              <Calendar className="size-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{upcomingBookings}</div>
              <p className="text-xs text-gray-500 mt-1">Confirmadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pedidos Pendentes</CardTitle>
              <Clock className="size-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{pendingBookings}</div>
              <p className="text-xs text-gray-500 mt-1">A aguardar confirmação</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Horários Disponíveis</CardTitle>
              <Clock className="size-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{availabilitySlots.length}</div>
              <p className="text-xs text-gray-500 mt-1">Slots configurados</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-white p-1 w-full grid grid-cols-2">
            <TabsTrigger value="bookings" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="size-3 sm:size-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Clock className="size-3 sm:size-4" />
              Disponibilidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p>Carregando...</p>
              </div>
            ) : activeBookings.length > 0 ? (
              activeBookings.map((booking) => (
                <Card key={booking._id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs sm:text-sm">
                            {booking.student.nome_completo.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-medium text-sm sm:text-base truncate">{booking.student.nome_completo}</h3>
                            <Badge variant="outline" className={`${getStatusColor(booking.status)} text-xs sm:text-sm w-fit`}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.student.email}</p>
                          <p className="text-xs sm:text-sm text-gray-700 mt-2">{booking.reason}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="size-3 sm:size-4" />
                              <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-3 sm:size-4" />
                              <span>{booking.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {booking.status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none text-xs sm:text-sm"
                              onClick={() => handleUpdateBookingStatus(booking._id, "confirmed")}
                            >
                              Confirmar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:bg-red-50 flex-1 sm:flex-none text-xs sm:text-sm"
                              onClick={() => handleUpdateBookingStatus(booking._id, "cancelled")}
                            >
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:bg-red-50 w-full sm:w-auto text-xs sm:text-sm"
                            onClick={() => handleUpdateBookingStatus(booking._id, "cancelled")}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="size-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Ainda não tem reservas</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Horários de Atendimento</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Defina os seus horários disponíveis para atendimento
                    </CardDescription>
                  </div>
                  <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs sm:text-sm w-full sm:w-auto" size="sm">
                        <Plus className="size-3 sm:size-4" />
                        <span className="hidden sm:inline">Adicionar Horário</span>
                        <span className="sm:hidden">Adicionar</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Horário de Atendimento</DialogTitle>
                        <DialogDescription>
                          Defina um novo slot de disponibilidade
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Dia da Semana</Label>
                          <Select value={newSlot.day} onValueChange={(value) => setNewSlot({ ...newSlot, day: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o dia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Segunda-feira">Segunda-feira</SelectItem>
                              <SelectItem value="Terça-feira">Terça-feira</SelectItem>
                              <SelectItem value="Quarta-feira">Quarta-feira</SelectItem>
                              <SelectItem value="Quinta-feira">Quinta-feira</SelectItem>
                              <SelectItem value="Sexta-feira">Sexta-feira</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Hora Início</Label>
                            <Input
                              type="time"
                              value={newSlot.startTime}
                              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Hora Fim</Label>
                            <Input
                              type="time"
                              value={newSlot.endTime}
                              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddSlot} className="w-full">
                          Adicionar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingAvailability ? (
                  <div className="text-center py-8">
                    <p>Carregando horários...</p>
                  </div>
                ) : availabilitySlots.length > 0 ? (
                  availabilitySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{slot.day}</p>
                        <p className="text-sm text-gray-600">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSlot(slot.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="size-12 text-gray-300 mx-auto mb-4" />
                    <p>Nenhum horário configurado</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Adicione horários para que os alunos possam reservar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}