// Configuração centralizada da API
export const LOCALHOST_URL = "http://localhost:5000";
export const RENDER_URL = "https://agenda-professor.onrender.com";

// Determina qual URL usar baseado no localStorage
export const getBaseUrl = (): string => {
  // Verificar se window está disponível (SSR safe)
  if (typeof window === "undefined") {
    return RENDER_URL;
  }

  const useLocalhost = localStorage.getItem("useLocalhost");
  
  // Por padrão, usa Render em qualquer ambiente
  return useLocalhost === "true" ? LOCALHOST_URL : RENDER_URL;
};

// Funções para alternar entre ambientes
export const useRender = () => localStorage.removeItem("useLocalhost");
export const useLocalhost = () => localStorage.setItem("useLocalhost", "true");
export const isUsingRender = (): boolean => localStorage.getItem("useLocalhost") !== "true";
export const isUsingLocalhost = (): boolean => localStorage.getItem("useLocalhost") === "true";

