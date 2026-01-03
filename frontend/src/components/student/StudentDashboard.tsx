import { useState } from "react";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Search, Calendar, Clock, User, BookOpen, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  course: string;
  avatar?: string;
  availability: string[];
}

interface Booking {
  id: string;
  teacherName: string;
  subject: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
}

interface StudentDashboardProps {
  onLogout: () => void;
  onSelectTeacher: (teacher: Teacher) => void;
  onViewNotifications: () => void;
  notifications: number;
}

export function StudentDashboard({ onLogout, onSelectTeacher, onViewNotifications, notifications }: StudentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const teachers: Teacher[] = [
    {
      id: "1",
      name: "Dr. Ana Silva",
      subject: "Matemática Aplicada",
      course: "Engenharia",
      availability: ["Segunda 10:00-12:00", "Quarta 14:00-16:00"],
    },
    {
      id: "2",
      name: "Prof. Carlos Santos",
      subject: "Programação Avançada",
      course: "Informática",
      availability: ["Terça 09:00-11:00", "Quinta 15:00-17:00"],
    },
    {
      id: "3",
      name: "Dra. Maria Costa",
      subject: "Bases de Dados",
      course: "Informática",
      availability: ["Segunda 14:00-16:00", "Sexta 10:00-12:00"],
    },
    {
      id: "4",
      name: "Prof. João Pereira",
      subject: "Física Aplicada",
      course: "Engenharia",
      availability: ["Quarta 10:00-12:00", "Quinta 14:00-16:00"],
    },
  ];

  const bookings: Booking[] = [
    {
      id: "1",
      teacherName: "Dr. Ana Silva",
      subject: "Matemática Aplicada",
      date: "25 Nov 2025",
      time: "10:00",
      status: "confirmed",
    },
    {
      id: "2",
      teacherName: "Prof. Carlos Santos",
      subject: "Programação Avançada",
      date: "26 Nov 2025",
      time: "09:00",
      status: "pending",
    },
    {
      id: "3",
      teacherName: "Dra. Maria Costa",
      subject: "Bases de Dados",
      date: "22 Nov 2025",
      time: "14:00",
      status: "confirmed",
    },
  ];

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const getStatusText = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelada";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="size-4 sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg">Dashboard do Aluno</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Bem-vindo de volta!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 sm:h-10 sm:w-10"
              onClick={onViewNotifications}
            >
              <Bell className="size-4 sm:size-5" />
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
        <Tabs defaultValue="search" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-white p-1 w-full grid grid-cols-2">
            <TabsTrigger value="search" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Search className="size-3 sm:size-4" />
              <span className="hidden sm:inline">Procurar Professores</span>
              <span className="sm:hidden">Procurar</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="size-3 sm:size-4" />
              <span className="hidden sm:inline">Minhas Reservas</span>
              <span className="sm:hidden">Reservas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 sm:space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                  <Input
                    placeholder="Procurar por nome, unidade curricular ou curso..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Teachers Grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarImage src={teacher.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs sm:text-sm">
                          {teacher.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base truncate">{teacher.name}</CardTitle>
                        <CardDescription className="truncate text-xs sm:text-sm">{teacher.subject}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <BookOpen className="size-3 sm:size-4" />
                        <span className="truncate">{teacher.course}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500">Disponibilidade:</p>
                        {teacher.availability.slice(0, 2).map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                            <Clock className="size-3 text-gray-400" />
                            <span className="text-gray-600 truncate">{slot}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-xs sm:text-sm"
                      onClick={() => onSelectTeacher(teacher)}
                      size="sm"
                    >
                      Ver Agenda
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <User className="size-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum professor encontrado</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs sm:text-sm">
                            {booking.teacherName.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">{booking.teacherName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.subject}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="size-3 sm:size-4" />
                              <span>{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-3 sm:size-4" />
                              <span>{booking.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(booking.status)} text-xs sm:text-sm shrink-0`}>
                        {getStatusText(booking.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="size-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Ainda não tem reservas</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Procure por professores e reserve um horário
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}