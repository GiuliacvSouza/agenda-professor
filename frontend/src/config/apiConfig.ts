// Configuração centralizada da API
const LOCALHOST_URL = "http://localhost:5000";
const RENDER_URL = "https://agenda-professor.onrender.com";

// Determina qual URL usar baseado no localStorage
const getApiBaseUrl = (): string => {
  // Verificar se window está disponível (SSR safe)
  if (typeof window === "undefined") {
    return RENDER_URL;
  }

  const useLocalhost = localStorage.getItem("useLocalhost");
  
  // Por padrão, usa Render em qualquer ambiente
  return useLocalhost === "true" ? LOCALHOST_URL : RENDER_URL;
};

export const API_CONFIG = {
  getBaseUrl: getApiBaseUrl,
  LOCALHOST_URL,
  RENDER_URL,
  
  // Funções para alternar entre ambientes
  useRender: () => localStorage.removeItem("useLocalhost"),
  useLocalhost: () => localStorage.setItem("useLocalhost", "true"),
  isUsingRender: (): boolean => localStorage.getItem("useLocalhost") !== "true",
  isUsingLocalhost: (): boolean => localStorage.getItem("useLocalhost") === "true",
};
