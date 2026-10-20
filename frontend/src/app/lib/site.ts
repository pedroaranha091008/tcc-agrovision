// Dados institucionais exibidos no site. Troque aqui quando a equipe tiver os contatos definitivos.

export const CONTATO = {
  telefone: "+55 (16) 99999-0000",
  email: "contato@agrovision.com.br",
  cidade: "Ribeirão Preto, SP — Brasil",
  site: "agrovision.com.br",
};

// Só aparecem no rodapé as redes com URL preenchida.
export const REDES_SOCIAIS: { nome: "Instagram" | "LinkedIn" | "YouTube"; url: string }[] = [];

export function telefoneHref(telefone: string) {
  return "tel:+" + telefone.replace(/\D/g, "");
}

export function whatsappHref(telefone: string) {
  return "https://wa.me/" + telefone.replace(/\D/g, "");
}

export const CULTURAS = ["Soja", "Milho", "Cana-de-açúcar", "Café", "Algodão", "Citros", "Eucalipto", "Outro"];

export const SERVICOS = [
  "NDVI / Saúde vegetativa",
  "Falhas de plantio",
  "Plantas daninhas",
  "Contagem de árvores",
  "Monitoramento completo",
  "Relatório personalizado",
];

export const TIPOS_USUARIO = {
  produtor: "Produtor Rural",
  agronomo: "Agrônomo",
  empresa: "Empresa",
} as const;

export type TipoUsuario = keyof typeof TIPOS_USUARIO;
