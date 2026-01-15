import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Search, Users, Calendar, Shield, BookOpen, UserX, Mail, Trash2 } from "lucide-react";
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
import { getAllUsers, deleteUser } from "../../services/user.backend";
import { getBookings } from "../../services/booking.backend";
import { getCourses, createCourse, deleteCourse, addUnit, removeUnit } from "../../services/course.backend";
import { loggedName } from "../auth/loggedUserInfo";

interface User {
  _id: string;
  nome_completo: string;
  email: string;
  tipo_usuario: "aluno" | "professor" | "admin";
  curso?: string;
  createdAt: string;
}

interface Booking {
  _id: string;
  student: {
    nome_completo: string;
    email: string;
  };
  teacher: {
    nome_completo: string;
    email: string;
  };
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  reason: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "aluno":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "professor":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "admin":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getRoleText = (role: string) => {
  switch (role) {
    case "aluno":
      return "Aluno";
    case "professor":
      return "Professor";
    case "admin":
      return "Administrador";
    default:
      return role;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-50 text-green-700 border-green-200";
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Confirmada";
    case "pending":
      return "Pendente";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
};

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<{ _id: string; name: string; unidades: string[] }[]>([]);
  const [newCourse, setNewCourse] = useState("");
  const [unitInputs, setUnitInputs] = useState<Record<string, string>>({});
  // control active tab so we can programmatically open "Cursos" if needed (helpful on narrow screens)
  const [activeTab, setActiveTab] = useState<'users'|'bookings'|'courses'>('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, bookingsData, coursesData] = await Promise.all([
          getAllUsers(),
          getBookings(),
          getCourses(),
        ]);
        setUsers(usersData);
        setBookings(bookingsData);
        setCourses(coursesData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete._id);
        setUsers(prev => prev.filter(user => user._id !== userToDelete._id));
        setUserToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
      }
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.trim()) return;
    try {
      const created = await createCourse(newCourse.trim());
      setCourses(prev => [created, ...prev]);
      setNewCourse('');
    } catch (error: any) {
      alert(error.message || 'Erro ao criar curso');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const course = courses.find(c => c._id === id);
    if (!course) return;

    // Verificar alunos associados
    const studentsCount = users.filter(u => u.tipo_usuario === 'aluno' && u.curso === course.name).length;
    // Verificar professores associados
    const teachersCount = users.filter(u =>
      u.tipo_usuario === 'professor' &&
      Array.isArray(u.cursos) &&
      u.cursos.includes(course.name)
    ).length;

    let confirmMessage = `Tem certeza que deseja remover o curso "${course.name}"?`;
    if (studentsCount > 0 || teachersCount > 0) {
      confirmMessage += `\n\n⚠️ Este curso tem:`;
      if (studentsCount > 0) confirmMessage += `\n• ${studentsCount} aluno(s) matriculado(s)`;
      if (teachersCount > 0) confirmMessage += `\n• ${teachersCount} professor(es) associado(s)`;
      confirmMessage += `\n\nA exclusão será bloqueada se houver usuários associados.`;
    }

    if (!confirm(confirmMessage)) return;

    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      alert('Curso removido com sucesso!');
    } catch (error: any) {
      alert(error.message || 'Erro ao remover curso');
    }
  };

  const handleAddUnit = async (courseId: string) => {
    const unidade = (unitInputs[courseId] || '').trim();
    if (!unidade) return;
    try {
      const updated = await addUnit(courseId, unidade);
      setCourses(prev => prev.map(c => c._id === courseId ? updated : c));
      setUnitInputs(prev => ({ ...prev, [courseId]: '' }));
    } catch (error: any) {
      alert(error.message || 'Erro ao adicionar unidade');
    }
  };

  const handleRemoveUnit = async (courseId: string, unidade: string) => {
    if (!confirm('Remover esta unidade?')) return;
    try {
      const updated = await removeUnit(courseId, unidade);
      setCourses(prev => prev.map(c => c._id === courseId ? updated : c));
    } catch (error: any) {
      alert(error.message || 'Erro ao remover unidade');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nome_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.curso && user.curso.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
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
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{loggedName}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <Button variant="outline" onClick={onLogout} size="sm" className="text-xs sm:text-sm">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm">Total Utilizadores</CardTitle>
              <Users className="size-3 sm:size-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl">{users.length}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Registados no sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm">Alunos</CardTitle>
              <Users className="size-3 sm:size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl">{users.filter(user => user.tipo_usuario === "aluno").length}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Alunos ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm">Professores</CardTitle>
              <BookOpen className="size-3 sm:size-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl">{users.filter(user => user.tipo_usuario === "professor").length}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Professores ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm">Reservas</CardTitle>
              <Calendar className="size-3 sm:size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl">{bookings.filter(booking => booking.status === "confirmed").length}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{bookings.filter(booking => booking.status === "pending").length} pendentes</p>
            </CardContent>
          </Card>
        </div>

<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4 sm:space-y-6">
          <TabsList className="bg-white p-1 w-full flex flex-wrap sm:flex-nowrap h-auto">
            <TabsTrigger value="users" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 min-w-0">
              <Users className="size-3 sm:size-4" />
              <span className="truncate">Utilizadores</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 min-w-0">
              <Calendar className="size-3 sm:size-4" />
              <span className="truncate">Reservas</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 min-w-0">
              <BookOpen className="size-3 sm:size-4" />
              <span className="truncate">Cursos</span>
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
                        <TableHead>Curso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Data Registo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className={`text-white ${
                                  user.tipo_usuario === "professor" 
                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                                }`}>
                                  {user.nome_completo.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.nome_completo}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRoleColor(user.tipo_usuario)}>
                              {getRoleText(user.tipo_usuario)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {user.curso || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Ativo
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
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
                        <TableHead>Motivo</TableHead>
                        <TableHead>Data & Hora</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                  {booking.student?.nome_completo ? booking.student.nome_completo.split(" ").map(n => n[0]).join("") : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{booking.student?.nome_completo || "Aluno não encontrado"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                                  {booking.teacher?.nome_completo ? booking.teacher.nome_completo.split(" ").map(n => n[0]).join("") : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{booking.teacher?.nome_completo || "Professor não encontrado"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {booking.reason}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div>{new Date(booking.date).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{booking.time}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Gestão de Cursos e Unidades</CardTitle>
                    <CardDescription className="text-xs sm:text-sm hidden sm:block">
                      Adicione e remova cursos e suas unidades curriculares
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nome do novo curso"
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      className="w-48"
                    />
                    <Button onClick={handleAddCourse} size="sm">
                      <BookOpen className="size-4 mr-2" />
                      Adicionar Curso
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead>Unidades Curriculares</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((c) => (
                        <TableRow key={c._id}>
                          <TableCell>
                            <div className="font-medium">{c.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {c.unidades && c.unidades.length ? (
                                  c.unidades.map((u, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs flex items-center gap-2">
                                      {u}
                                      <button
                                        onClick={() => handleRemoveUnit(c._id, u)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                        title="Remover unidade"
                                      >
                                        <Trash2 className="size-3" />
                                      </button>
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400 italic">Nenhuma unidade definida</span>
                                )}
                              </div>
                              <div className="flex gap-2 items-center">
                                <Input
                                  placeholder="Nome da nova unidade"
                                  value={unitInputs[c._id] || ''}
                                  onChange={(e) => setUnitInputs(prev => ({ ...prev, [c._id]: e.target.value }))}
                                  className="flex-1 text-sm"
                                />
                                <Button
                                  onClick={() => handleAddUnit(c._id)}
                                  size="sm"
                                  variant="outline"
                                >
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCourse(c._id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Remover
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

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar utilizador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar a conta de <strong>{userToDelete?.nome_completo}</strong>?
              Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteUser}>
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}