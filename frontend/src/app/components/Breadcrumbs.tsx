import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export type Migalha = { label: string; to?: string };

export function Breadcrumbs({ itens }: { itens: Migalha[] }) {
  return (
    <nav aria-label="Você está em" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-[#4a5568]">
        {itens.map((item, i) => (
          <li key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="w-4 h-4 flex-shrink-0" aria-hidden />}
            {item.to
              ? <Link to={item.to} className="hover:text-[#1B5E20] hover:underline truncate">{item.label}</Link>
              : <span aria-current="page" className="font-medium text-[#212121] truncate">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
