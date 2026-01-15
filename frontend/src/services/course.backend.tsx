import { getBaseUrl } from "../config/apiConfig";

const getToken = () => localStorage.getItem("token");

export const getCourses = async () => {
  // Tenta rota autenticada primeiro (útil para admin logado)
  try {
    const token = getToken();
    if (token) {
      const res = await fetch(`${getBaseUrl()}/api/cursos`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) return res.json();
    }
  } catch (e) {
    // ignore e tentar rota pública
  }

  // Fallback para rota pública (quando não há token ou token é inválido)
  try {
    const publicRes = await fetch(`${getBaseUrl()}/api/public-cursos`);
    if (publicRes.ok) return publicRes.json();
    const text = await publicRes.text();
    throw new Error(text || 'Erro ao buscar cursos (public)');
  } catch (err: any) {
    // tentativa final: lançar mensagem amigável
    throw new Error(err.message || 'Erro ao buscar cursos');
  }
};

export const createCourse = async (name: string) => {
  const res = await fetch(`${getBaseUrl()}/api/cursos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ name })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao criar curso');
  }
  return res.json();
};

export const deleteCourse = async (id: string) => {
  const res = await fetch(`${getBaseUrl()}/api/cursos/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao remover curso');
  }
  return res.json();
};

export const addUnit = async (id: string, unidade: string) => {
  const res = await fetch(`${getBaseUrl()}/api/cursos/${id}/unidades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ unidade })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao adicionar unidade');
  }
  return res.json();
};

export const removeUnit = async (id: string, unidade: string) => {
  const res = await fetch(`${getBaseUrl()}/api/cursos/${id}/unidades/${encodeURIComponent(unidade)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao remover unidade');
  }
  return res.json();
};
