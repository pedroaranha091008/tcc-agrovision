export function Spinner({ claro = false }: { claro?: boolean }) {
  return (
    <span aria-hidden className={`inline-block w-5 h-5 border-2 rounded-full animate-spin ${claro ? "border-white/30 border-t-white" : "border-[#1B5E20]/20 border-t-[#1B5E20]"}`} />
  );
}

export function Carregando({ tela = false }: { tela?: boolean }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-3 text-[#4a5568] text-sm ${tela ? "min-h-screen" : "py-16"}`}>
      <Spinner /> Carregando...
    </div>
  );
}
