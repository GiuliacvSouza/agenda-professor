import React from "react";

export interface LoggedUserProps {
  tipo_usuario: "aluno" | "professor" | "admin" | "";
  email: string;
  nome_completo: string;
  curso?: string;
}

// Variáveis globais exportadas para acesso de qualquer arquivo
export let loggedRole: "aluno" | "professor" | "admin" | "" = "";
export let loggedEmail: string = "";
export let loggedName: string = "";
export let loggedCourse: string = "";
export let loggedUserId: string = "";

// Função para definir os valores das variáveis globais
export function setLoggedUser(
  tipo_usuario: "aluno" | "professor" | "admin" | "",
  email: string,
  nome_completo: string,
  curso?: string,
  id?: string
) {
  loggedRole = tipo_usuario;
  loggedEmail = email;
  loggedName = nome_completo;
  loggedCourse = curso || "";
  loggedUserId = id || "";
}

// Hook para uso em componentes React (se necessário para reatividade)
export function useLoggedUser() {
  const [user, setUser] = React.useState<LoggedUserProps | null>(null);
  return { user, setUser };
}
