const Booking = require("../models/Booking");
const User = require("../models/Users");
const Notification = require("../models/Notification");

exports.createBooking = async (req, res) => {
  try {
    const { teacherId, date, time, reason } = req.body;
    const studentId = req.userId;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.tipo_usuario !== "professor") {
      return res.status(404).json({ message: "Professor não encontrado" });
    }

    const booking = await Booking.create({
      student: studentId,
      teacher: teacherId,
      date,
      time,
      reason,
    });

    // Criar notificação para o professor
    await Notification.create({
      user: teacherId,
      type: "booking_request",
      title: "Nova solicitação de agendamento",
      message: `Você tem uma nova solicitação de agendamento de ${req.user.nome_completo}`,
    });

    res.status(201).json({ message: "Agendamento criado com sucesso", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    let bookings;

    if (user.tipo_usuario === "aluno") {
      bookings = await Booking.find({ student: userId }).populate("teacher", "nome_completo email");
    } else if (user.tipo_usuario === "professor") {
      bookings = await Booking.find({ teacher: userId }).populate("student", "nome_completo email curso");
    } else {
      bookings = await Booking.find().populate("student", "nome_completo email curso").populate("teacher", "nome_completo email");
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookingsByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const bookings = await Booking.find({ teacher: teacherId, status: { $ne: 'cancelled' } });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate("student teacher");

    if (!booking) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }

    const user = await User.findById(req.userId);
    if (user.tipo_usuario !== "professor" && user.tipo_usuario !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    booking.status = status;
    await booking.save();

    // Criar notificação para o estudante
    let type, title, message;
    if (status === "confirmed") {
      type = "booking_confirmed";
      title = "Agendamento confirmado";
      message = `Seu agendamento com ${booking.teacher.nome_completo} foi confirmado.`;

      // Tenta sincronizar com Google Calendar (opcional)
      try {
        const googleCalendar = require("../utilities/googleCalendar");
        if (googleCalendar.enabled()) {
          // booking has student and teacher populated earlier
          (async () => {
            const result = await googleCalendar.createGoogleEvent({ booking, teacher: booking.teacher, student: booking.student });
            if (result && result.id) {
              booking.google_event_id = result.id;
              booking.calendar_id = result.calendarId;
              await booking.save();
              console.log('Evento criado no Google Calendar:', result.id);
            }
          })();
        }
      } catch (err) {
        console.error('Erro ao tentar criar evento no Google Calendar:', err.message);
      }

    } else if (status === "cancelled") {
      type = "booking_cancelled";
      title = "Agendamento cancelado";
      message = `Seu agendamento com ${booking.teacher.nome_completo} foi cancelado.`;

      // se houver evento vinculado no Google Calendar, tente remover
      try {
        const googleCalendar = require("../utilities/googleCalendar");
        if (googleCalendar.enabled() && booking.google_event_id && booking.calendar_id) {
          const { google } = require('googleapis');
          // use the utility's client to delete event (we'll call delete via calendar.events.delete)
          const client = googleCalendar.initClient();
          if (client) {
            await client.events.delete({ calendarId: booking.calendar_id, eventId: booking.google_event_id });
            booking.google_event_id = undefined;
            booking.calendar_id = undefined;
            await booking.save();
            console.log('Evento do Google Calendar removido:', booking.google_event_id);
          }
        }
      } catch (err) {
        console.error('Erro ao tentar remover evento do Google Calendar:', err.message);
      }
    }

    await Notification.create({
      user: booking.student._id,
      type,
      title,
      message,
    });

    res.json({ message: "Status do agendamento atualizado", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }

    const user = await User.findById(req.userId);
    if (booking.student.toString() !== req.userId && user.tipo_usuario !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Agendamento deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};