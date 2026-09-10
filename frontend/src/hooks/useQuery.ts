import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/erros";

interface Estado<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Busca dados no mount e quando `deps` mudam. Cancela a requisicao anterior.
 * Retorna { data, loading, error, refetch }.
 */
export function useQuery<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
): Estado<T> & { refetch: () => void } {
  const [estado, setEstado] = useState<Estado<T>>({ data: null, loading: true, error: null });
  const [gatilho, setGatilho] = useState(0);

  const refetch = useCallback(() => setGatilho((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let vivo = true;
    setEstado((e) => ({ ...e, loading: true, error: null }));

    fn(controller.signal)
      .then((data) => {
        if (vivo) setEstado({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!vivo || controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setEstado({
          data: null,
          loading: false,
          error: err instanceof ApiError ? err : new ApiError("DESCONHECIDO", String(err)),
        });
      });

    return () => {
      vivo = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, gatilho]);

  return { ...estado, refetch };
}
