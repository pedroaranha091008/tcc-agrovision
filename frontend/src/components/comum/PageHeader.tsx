import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export interface Miolo {
  label: string;
  to?: string;
}

export function Breadcrumbs({ itens }: { itens: Miolo[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="mb-2">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
        {itens.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            {item.to ? (
              <Link to={item.to} className="hover:text-[#1B5E20] hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#212121] font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  titulo,
  descricao,
  breadcrumbs,
  acao,
}: {
  titulo: string;
  descricao?: string;
  breadcrumbs?: Miolo[];
  acao?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {breadcrumbs && <Breadcrumbs itens={breadcrumbs} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
            {titulo}
          </h1>
          {descricao && (
            <p className="text-[#4a5568] text-sm mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
              {descricao}
            </p>
          )}
        </div>
        {acao}
      </div>
    </div>
  );
}
