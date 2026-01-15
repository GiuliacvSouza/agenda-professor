import { getBaseUrl } from "../config/apiConfig";

const getToken = () => localStorage.getItem("token");

export const getCourses = async () => {
  // Fallback para rota pública (sempre usa a rota pública para registro)
  try {
    const publicRes = await fetch(`${getBaseUrl()}/api/public-cursos`);
    if (publicRes.ok) {
      return publicRes.json();
    }
  } catch (e) {
    console.error('Erro ao buscar cursos da rota pública:', e);
  }

  // Se fallback falhar, retorna array vazio em vez de erro
  return [];
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
