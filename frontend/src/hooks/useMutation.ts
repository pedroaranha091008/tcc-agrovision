import { useCallback, useState } from "react";
import { ApiError } from "@/services/erros";

/**
 * Executa uma acao de escrita. `run` resolve com o resultado ou rejeita.
 * `loading` bloqueia disparos concorrentes (evita duplo submit).
 */
export function useMutation<Args extends unknown[], R>(fn: (...args: Args) => Promise<R>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const run = useCallback(
    async (...args: Args): Promise<R> => {
      if (loading) throw new ApiError("EM_ANDAMENTO", "Aguarde a operação anterior.");
      setLoading(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : new ApiError("DESCONHECIDO", String(err));
        setError(apiErr);
        throw apiErr;
      } finally {
        setLoading(false);
      }
    },
    [fn, loading],
  );

  return { run, loading, error, setError };
}
