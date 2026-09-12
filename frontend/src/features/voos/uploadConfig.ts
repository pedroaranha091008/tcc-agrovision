/**
 * Espelha os padroes de UPLOAD_* do .env.example do backend (Fase 1/4 do
 * planejamento). Em produção, o ideal e o backend expor esses limites via
 * configuração consultável; por ora ficam replicados aqui.
 */
export const UPLOAD_MAX_FILE_MB = 25;
export const UPLOAD_MAX_FILES = 20;
export const UPLOAD_ALLOWED_MIME = ["image/jpeg", "image/png", "image/tiff"];
export const UPLOAD_ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".tif", ".tiff"];

export function extensaoValida(nome: string): boolean {
  const ext = nome.slice(nome.lastIndexOf(".")).toLowerCase();
  return UPLOAD_ALLOWED_EXT.includes(ext);
}

export function validarArquivo(file: File): string | null {
  if (!UPLOAD_ALLOWED_MIME.includes(file.type) || !extensaoValida(file.name)) {
    return "Tipo de arquivo não suportado (use JPEG, PNG ou TIFF).";
  }
  if (file.size > UPLOAD_MAX_FILE_MB * 1024 * 1024) {
    return `Arquivo maior que ${UPLOAD_MAX_FILE_MB} MB.`;
  }
  return null;
}
