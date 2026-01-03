import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Search, Users, Calendar, Shield, BookOpen, Trash2, UserX, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  course?: string;
  subject?: string;
  status: "active" | "inactive";
  joinedDate: string;
}

interface Booking {
  id: string;
  studentName: string;
  teacherName: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  subject: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Mock data
  const users: User[] = [
    {
      id: "1",
      name: "João Almeida",
      email: "joao.almeida@exemplo.com",
      role: "student",
      course: "Engenharia Informática",
      status: "active",
      joinedDate: "15 Set 2025",
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria.santos@exemplo.com",
      role: "student",
      course: "Ciência de Dados",
      status: "active",
      joinedDate: "20 Set 2025",
    },
    {
      id: "3",
      name: "Dr. Ana Silva",
      email: "ana.silva@exemplo.com",
      role: "teacher",
      subject: "Matemática Aplicada",
      status: "active",
      joinedDate: "1 Set 2025",
    },
    {
      id: "4",
      name: "Prof. Carlos Santos",
      email: "carlos.santos@exemplo.com",
      role: "teacher",
      subject: "Programação Avançada",
      status: "active",
      joinedDate: "5 Set 2025",
    },
    {
      id: "5",
      name: "Pedro Costa",
      email: "pedro.costa@exemplo.com",
      role: "student",
      course: "Engenharia Informática",
      status: "inactive",
      joinedDate: "10 Set 2025",
    },
  ];

  const bookings: Booking[] = [
    {
      id: "1",
      studentName: "João Almeida",
      teacherName: "Dr. Ana Silva",
      date: "25 Nov 2025",
      time: "10:00",
      status: "confirmed",
      subject: "Matemática Aplicada",
    },
    {
      id: "2",
      studentName: "Maria Santos",
      teacherName: "Prof. Carlos Santos",
      date: "26 Nov 2025",
      time: "09:00",
      status: "pending",
      subject: "Programação Avançada",
    },
    {
      id: "3",
      studentName: "Pedro Costa",
      teacherName: "Dra. Maria Costa",
      date: "22 Nov 2025",
      time: "14:00",
      status: "confirmed",
      subject: "Bases de Dados",
    },
    {
      id: "4",
      studentName: "João Almeida",
      teacherName: "Prof. João Pereira",
      date: "20 Nov 2025",
      time: "15:00",
      status: "cancelled",
      subject: "Física Aplicada",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.course && user.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.subject && user.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalTeachers = users.filter((u) => u.role === "teacher").length;
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "inactive":
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "confirmed":
        return "Confirmada";
      case "cancelled":
        return "Cancelada";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  const getRoleColor = (role: string) => {
    return role === "teacher" ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-blue-100 text-blue-700 border-blue-200";
  };

  const getRoleText = (role: string) => {
    return role === "teacher" ? "Professor" : "Aluno";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="size-4 sm:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg">Painel de Administração</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Gestão do sistema</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} size="sm" className="text-xs sm:text-sm">
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm">Total Utilizadores</CardTitle>
              <Users className="size-3 sm:size-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl">{totalUsers}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Registados no sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm">Alunos</CardTitle>
              <Users className="size-3 sm:size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl">{totalStudents}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Alunos ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm">Professores</CardTitle>
              <BookOpen className="size-3 sm:size-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl">{totalTeachers}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Professores ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm">Reservas</CardTitle>
              <Calendar className="size-3 sm:size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl">{confirmedBookings}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{pendingBookings} pendentes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-white p-1 w-full grid grid-cols-2">
            <TabsTrigger value="users" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="size-3 sm:size-4" />
              Utilizadores
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="size-3 sm:size-4" />
              Reservas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Gestão de Utilizadores</CardTitle>
                    <CardDescription className="text-xs sm:text-sm hidden sm:block">
                      Visualize e gerir contas de alunos e professores
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                  <Input
                    placeholder="Procurar por nome, e-mail, curso ou unidade curricular..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 text-sm"
                  />
                </div>

                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilizador</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Curso/Unidade</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Data Registo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className={`text-white ${
                                  user.role === "teacher" 
                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                                }`}>
                                  {user.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRoleColor(user.role)}>
                              {getRoleText(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {user.course || user.subject || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(user.status)}>
                              {getStatusText(user.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {user.joinedDate}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="size-8">
                                <Mail className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-red-600 hover:bg-red-50"
                                onClick={() => setUserToDelete(user)}
                              >
                                <UserX className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Monitorização de Reservas</CardTitle>
                <CardDescription className="text-xs sm:text-sm hidden sm:block">
                  Visualize todas as reservas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Professor</TableHead>
                        <TableHead>Unidade Curricular</TableHead>
                        <TableHead>Data & Hora</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                  {booking.studentName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{booking.studentName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                                  {booking.teacherName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{booking.teacherName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {booking.subject}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div>{booking.date}</div>
                            <div className="text-xs text-gray-500">{booking.time}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete User Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar utilizador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar a conta de <strong>{userToDelete?.name}</strong>?
              Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}