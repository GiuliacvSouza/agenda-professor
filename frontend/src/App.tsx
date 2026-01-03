import { useState } from "react";
import { LoginRegister } from "./components/auth/LoginRegister";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { TeacherDashboard } from "./components/teacher/TeacherDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { TeacherSchedule } from "./components/booking/TeacherSchedule";
import { NotificationPanel } from "./components/notifications/NotificationPanel";
import { Toaster } from "./components/ui/sonner";

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
  id: string;
  type: "booking_confirmed" | "booking_cancelled" | "booking_request" | "reminder";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

type UserRole = "student" | "teacher" | "admin" | null;

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "booking_confirmed",
      title: "Reserva Confirmada",
      message: "A sua reserva com Dr. Ana Silva foi confirmada para 25 Nov às 10:00",
      time: "Há 2 horas",
      read: false,
    },
    {
      id: "2",
      type: "booking_request",
      title: "Nova Reserva",
      message: "Maria Santos solicitou uma reserva para 26 Nov às 09:00",
      time: "Há 3 horas",
      read: false,
    },
    {
      id: "3",
      type: "reminder",
      title: "Lembrete de Aula",
      message: "Tem uma aula agendada amanhã às 10:00 com Dr. Ana Silva",
      time: "Há 5 horas",
      read: false,
    },
    {
      id: "4",
      type: "booking_cancelled",
      title: "Reserva Cancelada",
      message: "A sua reserva com Prof. João Pereira foi cancelada",
      time: "Há 1 dia",
      read: true,
    },
  ]);

  const handleLogin = (email: string, password: string, role: UserRole) => {
    // In a real app, this would validate credentials
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
    setSelectedTeacher(null);
  };

  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacher({
      ...teacher,
      email: `${teacher.name.toLowerCase().replace(/\s+/g, ".")}@exemplo.com`,
    });
  };

  const handleBackFromSchedule = () => {
    setSelectedTeacher(null);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Show Login/Register screen
  if (!userRole) {
    return (
      <>
        <LoginRegister onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // Show Teacher Schedule if a teacher is selected
  if (selectedTeacher && userRole === "student") {
    return (
      <>
        <TeacherSchedule teacher={selectedTeacher} onBack={handleBackFromSchedule} />
        <Toaster />
      </>
    );
  }

  // Show appropriate dashboard based on role
  return (
    <>
      {userRole === "student" && (
        <StudentDashboard
          onLogout={handleLogout}
          onSelectTeacher={handleSelectTeacher}
          onViewNotifications={() => setShowNotifications(true)}
          notifications={unreadCount}
        />
      )}

      {userRole === "teacher" && (
        <TeacherDashboard
          onLogout={handleLogout}
          onViewNotifications={() => setShowNotifications(true)}
          notifications={unreadCount}
        />
      )}

      {userRole === "admin" && <AdminDashboard onLogout={handleLogout} />}

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
