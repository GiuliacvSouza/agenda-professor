import { API_CONFIG } from "../config/apiConfig";
const API_BASE = `${API_CONFIG.getBaseUrl()}/api/auth`;
import { setLoggedUser } from "../components/auth/loggedUserInfo"; // Importe a nova função
import {
  loggedEmail,
  loggedName,
  loggedRole,
  loggedCourse,
} from "../components/auth/loggedUserInfo";

export function storeToken(token: string) {
  localStorage.setItem("token", token);
  const localtoken = localStorage.getItem("token");
}

export const handleLogin = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro no login");
  }
  const data = await response.json();
  storeToken(data.token);
  console.log("Token armazenado:", data.token);
  // Use a nova função para definir as variáveis globais
  setLoggedUser(
    data.user.tipo_usuario,
    data.user.email,
    data.user.nome_completo,
    data.user.curso || (data.user.cursos ? data.user.cursos.join(", ") : undefined),
    data.user.id
  );
};

export const handleRegister = async (
  email: string,
  password: string,
  role: "student" | "teacher",
  name: string,
  course?: string | string[],
  unidades?: Record<string, string[]>
) => {
  const tipo_usuario = role === "student" ? "aluno" : "professor";
  const body: any = {
    nome_completo: name,
    email,
    password,
    tipo_usuario,
  };
  if (tipo_usuario === "aluno") {
    body.curso = Array.isArray(course) ? course[0] : course;
  } else if (tipo_usuario === "professor") {
    // ensure an array is sent to backend for professors
    body.cursos = Array.isArray(course) ? course : course ? [course] : [];
    // convert unidades map into an array like [{ curso: 'Engenharia Informática', unidades: ['Algoritmos'] }, ...]
    body.unidades = unidades
      ? Object.entries(unidades).map(([curso, unidadesArr]) => ({ curso, unidades: unidadesArr }))
      : [];
  }

  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erro no registro");
  }

  return response.json();
};
