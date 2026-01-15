import { getBaseUrl } from "../config/apiConfig";
const API_BASE = `${getBaseUrl()}/api`;

const getToken = () => localStorage.getItem("token");

export const getAllUsers = async () => {
  const response = await fetch(`${API_BASE}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao buscar usuários");
  }

  return response.json();
};

export const getUserById = async (id: string) => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao buscar usuário");
  }

  return response.json();
};

export const updateUser = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao atualizar usuário");
  }

  return response.json();
};

export const deleteUser = async (id: string) => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao deletar usuário");
  }

  return response.json();
};

export const getTeachers = async () => {
  const response = await fetch(`${API_BASE}/users/teachers/list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro ao buscar professores");
  }

  const data = await response.json();
  console.log('Dados retornados da API getTeachers:', data);
  return data;
};