const API_BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

export const getCourses = async () => {
  const res = await fetch(`${API_BASE}/cursos`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao buscar cursos');
  }
  return res.json();
};

export const createCourse = async (name: string) => {
  const res = await fetch(`${API_BASE}/cursos`, {
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
  const res = await fetch(`${API_BASE}/cursos/${id}`, {
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
  const res = await fetch(`${API_BASE}/cursos/${id}/unidades`, {
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
  const res = await fetch(`${API_BASE}/cursos/${id}/unidades/${encodeURIComponent(unidade)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao remover unidade');
  }
  return res.json();
};
