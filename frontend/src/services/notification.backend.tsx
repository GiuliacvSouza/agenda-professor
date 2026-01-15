import { API_CONFIG } from "../config/apiConfig";
const API_BASE = `${API_CONFIG.getBaseUrl()}/api`;

const getToken = () => localStorage.getItem("token");

export const getNotifications = async () => {
  const response = await fetch(`${API_BASE}/notifications`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao buscar notificações");
  }

  return response.json();
};

export const markAsRead = async (id: string) => {
  const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao marcar como lida");
  }

  return response.json();
};

export const markAllAsRead = async () => {
  const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao marcar todas como lidas");
  }

  return response.json();
};

export const deleteNotification = async (id: string) => {
  const response = await fetch(`${API_BASE}/notifications/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao deletar notificação");
  }

  return response.json();
};