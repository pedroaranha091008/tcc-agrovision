import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { apiBlob } from "../lib/api";

/** <img> para arquivos que exigem login: baixa com o token e mostra via URL temporária. */
export function ImagemProtegida({ caminho, alt, className = "" }: { caminho: string; alt: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    let ativo = true;
    let criada: string | null = null;
    setUrl(null);
    setFalhou(false);
    apiBlob(caminho)
      .then(blob => {
        if (!ativo) return;
        criada = URL.createObjectURL(blob);
        setUrl(criada);
      })
      .catch(() => { if (ativo) setFalhou(true); });
    return () => {
      ativo = false;
      if (criada) URL.revokeObjectURL(criada);
    };
  }, [caminho]);

  if (falhou) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-[#F8F9FA] text-[#4a5568] text-xs ${className}`} role="img" aria-label={`${alt} (não carregou)`}>
        <ImageOff className="w-5 h-5" aria-hidden /> Não carregou
      </div>
    );
  }
  if (!url) return <div className={`bg-[#E8F5E9] animate-pulse ${className}`} role="img" aria-label={`${alt} (carregando)`} />;
  return <img src={url} alt={alt} className={className} />;
}
