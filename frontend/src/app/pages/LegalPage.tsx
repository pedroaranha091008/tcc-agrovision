import type { ReactNode } from "react";
import { CONTATO } from "../lib/site";

// Textos-base para o TCC. Antes de um lançamento real, devem ser revisados por um profissional jurídico.

function Pagina({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <main className="pt-32 pb-24 bg-white">
      <article className="max-w-3xl mx-auto px-6 text-[#4a5568] leading-relaxed space-y-5 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#212121] [&_h2]:font-display [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
        <h1 className="text-4xl font-bold text-[#212121] font-display">{titulo}</h1>
        <p className="text-sm">Última atualização: outubro de 2026</p>
        {children}
      </article>
    </main>
  );
}

export function PrivacidadePage() {
  return (
    <Pagina titulo="Política de Privacidade">
      <p>Esta política explica como a AgroVision trata os dados pessoais de quem usa o site e a plataforma, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
      <h2>Quais dados coletamos</h2>
      <ul>
        <li><strong>Solicitação de orçamento:</strong> nome, email, telefone, cidade, cultura, área e mensagem.</li>
        <li><strong>Conta na plataforma:</strong> nome, email, senha (armazenada apenas de forma criptografada), telefone e tipo de usuário.</li>
        <li><strong>Dados da propriedade:</strong> fazendas, talhões, imagens de drone e resultados de análises que você cadastrar.</li>
      </ul>
      <h2>Para que usamos</h2>
      <ul>
        <li>Responder solicitações de orçamento e prestar os serviços contratados;</li>
        <li>Permitir o acesso à sua conta e exibir suas análises e relatórios;</li>
        <li>Melhorar a plataforma e cumprir obrigações legais.</li>
      </ul>
      <p>Não vendemos seus dados. Eles só são compartilhados com fornecedores necessários para operar o serviço (por exemplo, hospedagem) ou quando exigido por lei.</p>
      <h2>Seus direitos</h2>
      <p>Você pode pedir acesso, correção, portabilidade ou exclusão dos seus dados a qualquer momento pelo email <a className="text-[#1B5E20] underline" href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>.</p>
      <h2>Armazenamento local</h2>
      <p>Se você marcar "Manter conectado", guardamos um token de acesso no seu navegador para não pedir a senha novamente. Ao sair da conta, esse token é apagado.</p>
    </Pagina>
  );
}

export function TermosPage() {
  return (
    <Pagina titulo="Termos de Uso">
      <p>Ao criar uma conta ou usar a plataforma AgroVision, você concorda com estes termos.</p>
      <h2>Uso da plataforma</h2>
      <ul>
        <li>Você é responsável por manter sua senha em sigilo e pelas informações que cadastrar.</li>
        <li>As imagens e dados enviados devem ser de propriedades que você administra ou tem autorização para monitorar.</li>
        <li>É proibido tentar acessar dados de outros usuários ou prejudicar o funcionamento do serviço.</li>
      </ul>
      <h2>Análises e recomendações</h2>
      <p>Os mapas, índices e recomendações são ferramentas de apoio à decisão e não substituem a avaliação de um engenheiro agrônomo responsável.</p>
      <h2>Disponibilidade</h2>
      <p>A plataforma está em desenvolvimento como Trabalho de Conclusão de Curso. Algumas funcionalidades podem mudar ou ficar indisponíveis temporariamente.</p>
      <h2>Contato</h2>
      <p>Dúvidas sobre estes termos: <a className="text-[#1B5E20] underline" href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>.</p>
    </Pagina>
  );
}
