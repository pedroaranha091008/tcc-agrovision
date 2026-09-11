import {
  cloneElement,
  isValidElement,
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const baseInput =
  "w-full px-4 py-2.5 rounded-xl border bg-white text-[#212121] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm";

/**
 * Rotulo associado ao controle (label htmlFor + id, aria-invalid,
 * aria-describedby para dica/erro). O controle filho (Input/Select/Textarea)
 * so precisa declarar o proprio "erro" visual; o id e a ligacao com o rotulo
 * sao resolvidos aqui.
 */
export function Campo({
  label,
  erro,
  children,
  dica,
}: {
  label: string;
  erro?: string;
  dica?: string;
  children: ReactNode;
}) {
  const idGerado = useId();
  const controle = isValidElement(children) ? (children as ReactElement<{ id?: string }>) : null;
  const controlId = controle?.props.id ?? idGerado;
  const descricaoId = erro ? `${controlId}-erro` : dica ? `${controlId}-dica` : undefined;

  return (
    <div>
      <label
        htmlFor={controlId}
        className="block text-sm font-medium text-[#212121] mb-1.5"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </label>
      {controle
        ? cloneElement(controle, {
            id: controlId,
            "aria-invalid": erro ? true : undefined,
            "aria-describedby": descricaoId,
          } as Record<string, unknown>)
        : children}
      {dica && !erro && (
        <p id={descricaoId} className="mt-1 text-xs text-[#4a5568]">
          {dica}
        </p>
      )}
      {erro && (
        <p id={descricaoId} className="mt-1 text-xs text-red-600" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

export function Input({ erro, ...props }: InputHTMLAttributes<HTMLInputElement> & { erro?: boolean }) {
  return <input {...props} className={`${baseInput} ${erro ? "border-red-300" : "border-border"}`} />;
}

export function Select({
  erro,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { erro?: boolean }) {
  return (
    <select {...props} className={`${baseInput} ${erro ? "border-red-300" : "border-border"}`}>
      {children}
    </select>
  );
}

export function Textarea({
  erro,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { erro?: boolean }) {
  return (
    <textarea
      {...props}
      className={`${baseInput} resize-none ${erro ? "border-red-300" : "border-border"}`}
    />
  );
}

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & { carregando?: boolean; children: ReactNode };

export function BotaoPrimario({ children, carregando, disabled, ...props }: BotaoProps) {
  return (
    <button
      {...props}
      disabled={carregando || disabled}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] transition-colors disabled:opacity-60"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {carregando && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}

export function BotaoSecundario({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-[#4a5568] text-sm font-medium hover:bg-[#F8F9FA] transition-colors"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </button>
  );
}
