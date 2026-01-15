import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Search, Calendar, Clock, User, BookOpen, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useLoggedUser, loggedName, loggedEmail, loggedCourse, loggedRole } from "../auth/loggedUserInfo";
import { getTeachers } from "../../services/user.backend";
import { getBookings } from "../../services/booking.backend";

interface Teacher {
  _id: string;
  nome_completo: string;
  email: string;
  tipo_usuario: string;
  curso?: string;
  cursos?: string[];
  unidades?: { curso: string; unidades: string[] }[];
  horarios_disponiveis: string[];
}

interface Booking {
  _id: string;
  teacher: {
    nome_completo: string;
    email: string;
  };
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  subject?: string;
}

interface StudentDashboardProps {
  onLogout: () => void;
  onSelectTeacher: (teacher: Teacher) => void;
  onViewNotifications: () => void;
  notifications: number;
}

export function StudentDashboard({ onLogout, onSelectTeacher, onViewNotifications, notifications }: StudentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersData, bookingsData] = await Promise.all([
          getTeachers(),
          getBookings(),
        ]);
        console.log('Teachers data received:', teachersData);
        console.log('First teacher object:', teachersData[0]);
        console.log('First teacher availability:', teachersData[0]?.horarios_disponiveis);

        // If current user is a student, filter teachers by student's course
        let teachersFiltered = teachersData;
        if (loggedRole === 'aluno' && loggedCourse) {
          const studentCourse = loggedCourse.trim().toLowerCase();
          teachersFiltered = teachersData.filter((t: any) => {
            const cursosArr: string[] = [];
            if (Array.isArray(t.cursos) && t.cursos.length) {
              cursosArr.push(...t.cursos.map((c: string) => String(c).trim()));
            } else if (t.curso && typeof t.curso === 'string') {
              // backend might return a joined string in `curso`, split by comma
              const parts = t.curso.split(',').map((s: string) => s.trim()).filter(Boolean);
              cursosArr.push(...parts);
            }
            return cursosArr.some((c) => c.toLowerCase() === studentCourse);
          });
        }

        setTeachers(teachersFiltered);
        setBookings(bookingsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mock data removido

  const filteredTeachers = teachers.filter((teacher) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    if (teacher.nome_completo.toLowerCase().includes(q)) return true;
    if (teacher.email.toLowerCase().includes(q)) return true;

    // check cursos string or array
    if ((teacher.cursos && teacher.cursos.join(', ').toLowerCase().includes(q)) || (teacher.curso && teacher.curso.toLowerCase().includes(q))) return true;

    // check unidades (array of { curso, unidades })
    if (Array.isArray(teacher.unidades)) {
      for (const uGroup of teacher.unidades) {
        if (uGroup.curso && uGroup.curso.toLowerCase().includes(q)) return true;
        if (uGroup.unidades && uGroup.unidades.some((u) => u.toLowerCase().includes(q))) return true;
      }
    }

    // fallback: check availability text
    if (teacher.horarios_disponiveis && teacher.horarios_disponiveis.join(' ').toLowerCase().includes(q)) return true;

    return false;
  });

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
              <h1 className="text-base sm:text-lg">Dashboard do(a) {loggedName} - {loggedRole === "aluno" ? "Aluno" : loggedRole === "professor" ? "Professor" : loggedRole === "admin" ? "Administrador" : ""}</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Bem-vindo!</p>
              {loggedRole === 'aluno' && loggedCourse && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Curso: {loggedCourse}</p>
              )}
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
        {loading ? (
          <div className="text-center py-12">
            <p>Carregando...</p>
          </div>
        ) : (
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
                <Card key={teacher._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarImage src={teacher.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs sm:text-sm">
                          {teacher.nome_completo.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base truncate">{teacher.nome_completo}</CardTitle>
                        <CardDescription className="truncate text-xs sm:text-sm">{teacher.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 pt-0">
                    <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <BookOpen className="size-3 sm:size-4" />
                        <span className="truncate">{
                          (teacher.cursos && teacher.cursos.length) 
                            ? teacher.cursos.join(', ') 
                            : (teacher.curso 
                              ? teacher.curso 
                              : (Array.isArray(teacher.unidades) && teacher.unidades.length 
                                ? teacher.unidades.map(u => u.curso).filter(Boolean).join(', ')
                                : "N/A"))
                        }</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500">Unidades / Disciplina(s):</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(teacher.unidades) && teacher.unidades.length > 0 ? (
                            teacher.unidades.flatMap(u => u.unidades).slice(0, 6).map((unit, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{unit}</Badge>
                            ))
                          ) : (
                            teacher.horarios_disponiveis.slice(0, 2).map((slot, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                                <Clock className="size-3 text-gray-400" />
                                <span className="text-gray-600 truncate">{slot}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-xs sm:text-sm"
                      onClick={() => {
                        const raw = teacher.horarios_disponiveis ?? [];
                        let availability: string[] = [];
                        if (Array.isArray(raw)) {
                          if (raw.length > 0 && typeof raw[0] === 'string') {
                            availability = raw as string[];
                          } else {
                            availability = raw
                              .map((s: any) => {
                                const day = s?.day ?? s?.dayName ?? '';
                                const start = s?.startTime ?? s?.start ?? '';
                                const end = s?.endTime ?? s?.end ?? '';
                                const str = `${day} ${start}-${end}`.trim();
                                return str === '-' || str === '' ? null : str;
                              })
                              .filter(Boolean) as string[];
                          }
                        }

                        onSelectTeacher({
                          id: teacher._id,
                          name: teacher.nome_completo,
                          subject: teacher.curso || "",
                          course: teacher.curso || "",
                          courses: Array.isArray(teacher.cursos) && teacher.cursos.length ? teacher.cursos : (teacher.curso ? teacher.curso.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                          email: teacher.email,
                          availability,
                        });
                      }}
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
                <Card key={booking._id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs sm:text-sm">
                            {booking.teacher.nome_completo.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">{booking.teacher.nome_completo}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.subject || "N/A"}</p>
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
        )}
      </main>
    </div>
  );
}