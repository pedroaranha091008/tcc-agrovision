import { useEffect, useState } from "react";
import { FileImage } from "lucide-react";
import { baixarArquivo } from "@/services/http";

/**
 * <img> para arquivos que exigem login: baixa com o token (o <img> comum nao
 * envia o header Authorization) e mostra por uma URL temporaria do navegador.
 */
export function ImagemProtegida({ caminho, alt, className = "" }: { caminho: string; alt: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let criada: string | null = null;
    setUrl(null);
    setFalhou(false);
    baixarArquivo(caminho, { signal: controller.signal })
      .then((blob) => {
        criada = URL.createObjectURL(blob);
        setUrl(criada);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFalhou(true);
      });
    return () => {
      controller.abort();
      if (criada) URL.revokeObjectURL(criada);
    };
  }, [caminho]);

  if (url) return <img src={url} alt={alt} className={className} />;
  return (
    <div
      role="img"
      aria-label={falhou ? `${alt} (não foi possível carregar)` : `${alt} (carregando)`}
      className={`flex items-center justify-center bg-[#F8F9FA] ${falhou ? "" : "animate-pulse"} ${className}`}
    >
      <FileImage className="w-8 h-8 text-[#4a5568]" />
    </div>
  );
}
