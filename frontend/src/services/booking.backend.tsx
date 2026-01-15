const API_BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

export const createBooking = async (teacherId: string, date: string, time: string, reason: string) => {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      teacherId,
      date,
      time,
      reason,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao criar agendamento");
  }

  return response.json();
};

export const getBookings = async () => {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao buscar agendamentos");
  }

  return response.json();
};

export const getBookingsForTeacher = async (teacherId: string) => {
  const response = await fetch(`${API_BASE}/bookings/teacher/${teacherId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao buscar agendamentos do professor");
  }

  return response.json();
};

export const updateBookingStatus = async (id: string, status: string) => {
  const response = await fetch(`${API_BASE}/bookings/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao atualizar status");
  }

  return response.json();
};

export const deleteBooking = async (id: string) => {
  const response = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao deletar agendamento");
  }

  return response.json();
};