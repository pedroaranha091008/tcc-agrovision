import type { ImagemVoo } from "@/types/dominio";
import { http, upload } from "./http";

export async function listarDoVoo(idVoo: string, signal?: AbortSignal): Promise<ImagemVoo[]> {
  const { data } = await http.get<ImagemVoo[]>(`/voos/${idVoo}/imagens`, { signal });
  return data;
}

export async function enviar(
  idVoo: string,
  arquivos: File[],
  onProgresso?: (p: number) => void,
  signal?: AbortSignal,
): Promise<ImagemVoo[]> {
  const fd = new FormData();
  for (const f of arquivos) fd.append("imagens", f, f.name);
  const { data } = await upload<ImagemVoo[]>(`/voos/${idVoo}/imagens`, fd, { onProgresso, signal });
  return data;
}

export async function remover(idVoo: string, idImagem: string): Promise<void> {
  await http.delete(`/voos/${idVoo}/imagens/${idImagem}`);
}
