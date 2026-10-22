import { ImagemProtegida } from "@/components/comum/ImagemProtegida";
import { numero } from "@/lib/formatar";
import type { DetalhesAnalise, PercentuaisExg } from "@/types/dominio";

const CLASSES = [
  { chave: "saudavel", rotulo: "Vegetação vigorosa", cor: "#2EA043" },
  { chave: "atencao", rotulo: "Atenção", cor: "#FBC02D" },
  { chave: "critico", rotulo: "Pouca ou nenhuma vegetação", cor: "#E53935" },
] as const;

/** Barra empilhada com os percentuais das tres classes, com o texto ao lado (nao depende so da cor). */
function Distribuicao({ valores }: { valores: PercentuaisExg }) {
  return (
    <div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-[#F8F9FA]" aria-hidden="true">
        {CLASSES.map((c) => (
          <div key={c.chave} style={{ width: `${valores[c.chave]}%`, background: c.cor }} />
        ))}
      </div>
      <ul className="mt-2 grid gap-1 text-xs text-[#4a5568]">
        {CLASSES.map((c) => (
          <li key={c.chave} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c.cor }} />
            <span className="flex-1">{c.rotulo}</span>
            <span className="font-semibold text-[#212121] tabular-nums">{numero(valores[c.chave])}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MapasVegetacao({ idAnalise, idVoo, detalhes }: { idAnalise: string; idVoo: string; detalhes: DetalhesAnalise }) {
  return (
    <section className="bg-white rounded-lg border border-border p-5 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <h2 className="font-bold text-[#212121] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
        Mapa de vegetação
      </h2>
      <p className="text-sm text-[#4a5568] mb-4">
        Cada pixel das fotos foi classificado pelo índice de excesso de verde (ExG). Áreas em vermelho têm pouca ou
        nenhuma vegetação; vale conferir em campo.
      </p>

      <div className="mb-6">
        <p className="text-xs text-[#4a5568] uppercase tracking-wide mb-2">Média do voo</p>
        <Distribuicao valores={detalhes.resumo} />
      </div>

      <ul className="space-y-6">
        {detalhes.por_imagem.map((img, i) => (
          <li key={img.id_imagem + i} className="border-t border-border pt-5">
            <p className="text-sm font-medium text-[#212121] mb-3 truncate" title={img.nome}>
              {img.nome}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <figure>
                <ImagemProtegida
                  caminho={`/voos/${idVoo}/imagens/${img.id_imagem}/arquivo?miniatura=1`}
                  alt={`Foto original ${img.nome}`}
                  className="w-full aspect-[4/3] object-cover rounded-md"
                />
                <figcaption className="text-xs text-[#4a5568] mt-1">Foto original</figcaption>
              </figure>
              <figure>
                <ImagemProtegida
                  caminho={`/analises/${idAnalise}/mapas/${i}`}
                  alt={`Mapa de vegetação ${img.nome}`}
                  className="w-full aspect-[4/3] object-cover rounded-md"
                />
                <figcaption className="text-xs text-[#4a5568] mt-1">Mapa de vegetação</figcaption>
              </figure>
            </div>
            <Distribuicao valores={img} />
          </li>
        ))}
      </ul>

      <p className="text-xs text-[#4a5568] mt-5">
        Método {detalhes.metodo} v{detalhes.versao}. Mede cobertura vegetal em fotos comuns (RGB); não identifica
        pragas ou doenças.
      </p>
    </section>
  );
}
