import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  larguraMax?: string;
}

const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal com overlay, fechamento por Esc/clique fora, foco movido para dentro
 * ao abrir, ciclo de Tab preso ao conteudo (focus trap) e foco devolvido ao
 * elemento que abriu o modal quando ele fecha.
 */
export function Modal({ aberto, titulo, onFechar, children, larguraMax = "max-w-lg" }: Props) {
  const painelRef = useRef<HTMLDivElement>(null);
  const gatilhoAnteriorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!aberto) return;

    gatilhoAnteriorRef.current = document.activeElement as HTMLElement | null;
    const primeiro = painelRef.current?.querySelector<HTMLElement>(SELETOR_FOCAVEL);
    (primeiro ?? painelRef.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onFechar();
        return;
      }
      if (e.key !== "Tab" || !painelRef.current) return;
      const focaveis = painelRef.current.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL);
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      gatilhoAnteriorRef.current?.focus();
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onFechar}
      role="presentation"
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`w-full ${larguraMax} bg-white rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto outline-none`}
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
            {titulo}
          </h3>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="p-1.5 rounded-lg hover:bg-[#F8F9FA] text-[#4a5568] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmarExclusao({
  aberto,
  titulo = "Confirmar exclusão",
  mensagem,
  processando,
  onConfirmar,
  onCancelar,
}: {
  aberto: boolean;
  titulo?: string;
  mensagem: string;
  processando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <Modal aberto={aberto} titulo={titulo} onFechar={onCancelar} larguraMax="max-w-md">
      <p className="text-sm text-[#4a5568]">{mensagem}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancelar}
          className="px-4 py-2 rounded-xl border border-border text-[#4a5568] text-sm font-medium hover:bg-[#F8F9FA] transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          disabled={processando}
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {processando ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </Modal>
  );
}
