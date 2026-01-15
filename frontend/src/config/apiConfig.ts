// Configuração centralizada da API
const LOCALHOST_URL = "http://localhost:5000";
const RENDER_URL = "https://agenda-professor.onrender.com";

// Determina qual URL usar baseado no localStorage
const getApiBaseUrl = (): string => {
  // Verificar se window está disponível (SSR safe)
  if (typeof window === "undefined") {
    return RENDER_URL;
  }

  const useRender = localStorage.getItem("useRenderAPI");
  
  // Em produção (GitHub Pages), usa Render por padrão
  if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return useRender === "false" ? LOCALHOST_URL : RENDER_URL;
  }
  
  // Em desenvolvimento, usa localhost por padrão
  return useRender === "true" ? RENDER_URL : LOCALHOST_URL;
};

export const API_CONFIG = {
  getBaseUrl: getApiBaseUrl,
  LOCALHOST_URL,
  RENDER_URL,
  
  // Funções para alternar entre ambientes
  useRender: () => localStorage.setItem("useRenderAPI", "true"),
  useLocalhost: () => localStorage.setItem("useRenderAPI", "false"),
  isUsingRender: (): boolean => localStorage.getItem("useRenderAPI") === "true",
  isUsingLocalhost: (): boolean => !localStorage.getItem("useRenderAPI") || localStorage.getItem("useRenderAPI") === "false",
};
