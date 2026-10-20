import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./api";

/** Busca dados ao montar (e quando `chave` muda), ignorando respostas de buscas antigas. */
export function useCarregar<T>(buscar: () => Promise<T>, chave: unknown[]) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<ApiError | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    buscar()
      .then(d => { if (ativo) setDados(d); })
      .catch(e => { if (ativo) setErro(e instanceof ApiError ? e : new ApiError("Erro inesperado.", 0, "ERRO")); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...chave, versao]);

  const recarregar = useCallback(() => setVersao(v => v + 1), []);
  return { dados, erro, carregando, recarregar };
}
