import { useEffect, useRef, useState } from "react";

/**
 * Botao "Continuar com Google".
 * - Com VITE_GOOGLE_CLIENT_ID: carrega o Google Identity Services e renderiza
 *   o botao oficial; o ID token e enviado para onSuccess (backend /auth/google).
 * - Sem client id, mas em modo mock: botao "demo" que dispara o fluxo simulado.
 * - Sem client id e sem mock: botao desabilitado.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const MOCK = import.meta.env.VITE_API_MOCK === "true";
const GIS_SRC = "https://accounts.google.com/gsi/client";

interface Props {
  onSuccess: (idToken: string) => Promise<void> | void;
  onError?: (mensagem: string) => void;
}

interface GoogleCredentialResponse {
  credential?: string;
}

function carregarGis(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${GIS_SRC}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar o Google Identity Services"));
    document.head.appendChild(s);
  });
}

export function GoogleLoginButton({ onSuccess, onError }: Props) {
  const alvo = useRef<HTMLDivElement>(null);
  const [carregandoDemo, setCarregandoDemo] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelado = false;

    carregarGis()
      .then(() => {
        if (cancelado || !alvo.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google;
        if (!google?.accounts?.id) return;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (resp: GoogleCredentialResponse) => {
            if (resp.credential) await onSuccess(resp.credential);
            else onError?.("Não foi possível obter o token do Google.");
          },
        });
        google.accounts.id.renderButton(alvo.current, {
          theme: "outline",
          size: "large",
          width: 360,
          text: "continue_with",
          locale: "pt-BR",
        });
      })
      .catch((e: Error) => onError?.(e.message));

    return () => {
      cancelado = true;
    };
  }, [onSuccess, onError]);

  if (CLIENT_ID) {
    return <div ref={alvo} className="flex justify-center" />;
  }

  return (
    <button
      type="button"
      disabled={!MOCK || carregandoDemo}
      onClick={async () => {
        setCarregandoDemo(true);
        try {
          await onSuccess("mock-google-id-token");
        } finally {
          setCarregandoDemo(false);
        }
      }}
      title={MOCK ? "Fluxo simulado (modo mock)" : "Configure VITE_GOOGLE_CLIENT_ID para habilitar"}
      className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-md border bg-white border-border hover:bg-[#F8F9FA] transition-all text-[#212121] font-medium text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <span className="font-bold text-base w-5 text-center">G</span>
      {MOCK ? "Continuar com Google (demo)" : "Continuar com Google"}
    </button>
  );
}
