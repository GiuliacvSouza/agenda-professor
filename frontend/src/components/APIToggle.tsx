import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { API_CONFIG } from "@/config/apiConfig";

export const APIToggle = () => {
  const [isRender, setIsRender] = useState(false);

  useEffect(() => {
    // Verificar qual ambiente está ativo ao carregar
    setIsRender(API_CONFIG.isUsingRender());
  }, []);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      API_CONFIG.useRender();
    } else {
      API_CONFIG.useLocalhost();
    }
    setIsRender(checked);
    // Recarga para aplicar as mudanças
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
      <span className="text-sm font-medium">
        {isRender ? "🌐 Render" : "💻 Localhost"}
      </span>
      <Switch
        checked={isRender}
        onCheckedChange={handleToggle}
        aria-label="Toggle entre Localhost e Render"
      />
    </div>
  );
};
