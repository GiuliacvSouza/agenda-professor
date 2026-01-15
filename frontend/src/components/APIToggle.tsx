import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export const APIToggle = () => {
  const [isRender, setIsRender] = useState(false);

  useEffect(() => {
    // Verificar qual ambiente está ativo ao carregar
    setIsRender(localStorage.getItem("useRenderAPI") === "true");
  }, []);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      localStorage.setItem("useRenderAPI", "true");
    } else {
      localStorage.setItem("useRenderAPI", "false");
    }
    setIsRender(checked);
    // Opcional: recarregar a página para aplicar as mudanças
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
