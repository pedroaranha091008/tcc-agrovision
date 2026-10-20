import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { Spinner } from "./Carregando";

/** Janela modal acessível (foco preso, Esc fecha, leitor de tela anuncia o título). */
export function Modal({ aberto, aoFechar, titulo, descricao, children }: {
  aberto: boolean; aoFechar: () => void; titulo: string; descricao?: string; children: ReactNode;
}) {
  return (
    <Dialog.Root open={aberto} onOpenChange={a => { if (!a) aoFechar(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 focus:outline-none">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <Dialog.Title className="text-lg font-bold text-[#212121] font-display">{titulo}</Dialog.Title>
              {descricao
                ? <Dialog.Description className="text-sm text-[#4a5568] mt-1">{descricao}</Dialog.Description>
                : <Dialog.Description className="sr-only">{titulo}</Dialog.Description>}
            </div>
            <Dialog.Close className="p-1 rounded-lg text-[#4a5568] hover:bg-[#F8F9FA]" aria-label="Fechar"><X className="w-5 h-5" /></Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Confirmação para ações destrutivas. */
export function ConfirmarExclusao({ aberto, aoFechar, aoConfirmar, titulo, mensagem, excluindo, erro, bloqueado = false }: {
  aberto: boolean; aoFechar: () => void; aoConfirmar: () => void; titulo: string; mensagem: ReactNode; excluindo: boolean; erro: string | null;
  /** Quando já se sabe que a exclusão não é permitida: só explica, sem botão de excluir. */
  bloqueado?: boolean;
}) {
  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={titulo}>
      <div className="text-sm text-[#4a5568] mb-5">{mensagem}</div>
      {erro && (
        <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden /> {erro}
        </div>
      )}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <button onClick={aoFechar} className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-[#212121] hover:bg-[#F8F9FA]">{bloqueado ? "Entendi" : "Cancelar"}</button>
        {!bloqueado && (
          <button onClick={aoConfirmar} disabled={excluindo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-70">
            {excluindo && <Spinner claro />} Excluir
          </button>
        )}
      </div>
    </Modal>
  );
}
