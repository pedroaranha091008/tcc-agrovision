import { execSync } from "node:child_process";

/** Ao terminar a suíte, apaga as contas de teste (e seus arquivos) criadas durante os testes. */
export default function limpeza() {
  execSync("npm --prefix ../backend run limpar-testes", { stdio: "inherit" });
}
