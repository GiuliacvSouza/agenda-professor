import { useState, useEffect } from "react";
import { LoginRegister } from "./components/auth/LoginRegister";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { TeacherDashboard } from "./components/teacher/TeacherDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { TeacherSchedule } from "./components/booking/TeacherSchedule";
import { NotificationPanel } from "./components/notifications/NotificationPanel";
import { Toaster } from "./components/ui/sonner";
import { APIToggle } from "./components/APIToggle";
import {
  setLoggedUser,
  loggedEmail,
  loggedName,
  loggedRole,
  loggedCourse,
  useLoggedUser,
} from "./components/auth/loggedUserInfo";

import {
  handleLogin as apiLogin,
  handleRegister as apiRegister,
} from "./services/auth.backend";
import { getNotifications, markAsRead, markAllAsRead } from "./services/notification.backend";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  course: string;
  avatar?: string;
  email?: string;
  availability: string[];
}

interface Notification {
  _id: string;
  type: "booking_confirmed" | "booking_cancelled" | "booking_request" | "reminder";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

type UserRole = "aluno" | "professor" | "admin" | "";

const mapRole = (tipo: string): UserRole => {
  switch (tipo) {
    case "aluno":
      return "aluno";
    case "professor":
      return "professor";
    case "admin":
      return "admin";
    default:
      return "";
  }
};

export default function App() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
    }
  }, [userEmail]);

  // Debug selectedTeacher changes
  useEffect(() => {
    console.log('selectedTeacher changed:', selectedTeacher);
    if (selectedTeacher) {
      console.log('selectedTeacher availability:', selectedTeacher.availability);
    }
  }, [selectedTeacher]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  const handleLogin = async (
    email: string,
    password: string,
    role?: "student" | "teacher" | "admin"
  ) => {
    try {
      // Chame a API de login
      await apiLogin(email, password);
      // Defina o estado local com os dados do usuário
      setUserEmail(loggedEmail);
      setUserRole(loggedRole);
      setUser({
        role: loggedRole,
        email: loggedEmail,
        nome_completo: loggedName,
        curso: loggedCourse,
      });
      console.log(loggedName, loggedEmail); // Agora usa as variáveis globais
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    role: "student" | "teacher",
    name: string,
    course?: string | string[],
    unidades?: Record<string, string[]>
  ) => {
    try {
      console.log("Tipo de utilizador:", role)
      console.log("Curso:", course)
      console.log("Unidades:", unidades)
      await apiRegister(email, password, role, name, course as any, unidades as any);
      alert("Registro bem-sucedido! Faça login.");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedUser("", "", "", "", "");
    setUserRole("");
    setSelectedTeacher(null);
    setToken(null);
    setUser(null);
    setUserEmail(null);
    setNotifications([]); // Limpar notificações também
  };

  const handleSelectTeacher = (teacher: any) => {
    console.log('handleSelectTeacher called with:', teacher);

    // Support multiple incoming shapes:
    // - API raw teacher: has `_id`, `nome_completo`, `horarios_disponiveis` (array of objects)
    // - UI mapped teacher: has `id`, `name`, `availability` (array of strings)
    const rawAvailability = teacher.availability ?? teacher.horarios_disponiveis ?? [];
    console.log('rawAvailability:', rawAvailability);

    let availability: string[] = [];
    if (Array.isArray(rawAvailability)) {
      if (rawAvailability.length > 0 && typeof rawAvailability[0] === 'object') {
        availability = rawAvailability
          .map((s: any) => {
            if (!s) return null;
            if (s.day && s.startTime && s.endTime) return `${s.day} ${s.startTime}-${s.endTime}`;
            if (s.startTime && s.endTime && s.dayName) return `${s.dayName} ${s.startTime}-${s.endTime}`;
            return null;
          })
          .filter(Boolean) as string[];
      } else {
        availability = rawAvailability.map((s: any) => String(s));
      }
    }

    console.log('Processed availability:', availability);

    setSelectedTeacher({
      id: teacher._id ?? teacher.id,
      name: teacher.nome_completo ?? teacher.name,
      subject: teacher.curso ?? teacher.subject ?? "Professor",
      course: teacher.curso ?? teacher.course ?? "N/A",
      courses: Array.isArray(teacher.cursos) && teacher.cursos.length ? teacher.cursos : (teacher.curso ? teacher.curso.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      unidades: Array.isArray(teacher.unidades) && teacher.unidades.length ? teacher.unidades.flatMap((g: any) => g.unidades) : [],
      email: teacher.email ?? teacher.email,
      availability,
    });

    console.log('setSelectedTeacher called with availability:', availability);
  };

  const handleBackFromSchedule = () => {
    setSelectedTeacher(null);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!userEmail) {
    return (
      <>
        <LoginRegister onLogin={handleLogin} onRegister={handleRegister} />
        <Toaster />
      </>
    );
  }
  console.log("Nome todo:", loggedName);
  console.log("Email:", loggedEmail);
  console.log("Role:", loggedRole);
  console.log("Course:", loggedCourse);

  // Show Teacher Schedule if a teacher is selected
  if (selectedTeacher && userRole === "aluno") {
    return (
      <>
        <TeacherSchedule
          teacher={selectedTeacher}
          onBack={handleBackFromSchedule}
        />
        <Toaster />
      </>
    );
  }

  // Show appropriate dashboard based on role
  return (
    <>
      {/* Global API toggle (visible on all views) */}
      <div className="fixed top-4 right-4 z-50">
        <APIToggle />
      </div>

      {loggedRole === "aluno" && (
        <StudentDashboard
          onLogout={handleLogout}
          onSelectTeacher={handleSelectTeacher}
          onViewNotifications={() => setShowNotifications(true)}
          notifications={unreadCount}
        />
      )}

      {loggedRole === "professor" && (
        <TeacherDashboard
          onLogout={handleLogout}
          onViewNotifications={() => setShowNotifications(true)}
          notifications={unreadCount}
        />
      )}

      {loggedRole === "admin" && <AdminDashboard onLogout={handleLogout} />}

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      <Toaster />
    </>
  );
}
