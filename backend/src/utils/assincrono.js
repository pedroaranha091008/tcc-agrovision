/**
 * Envolve um handler assincrono e encaminha rejeicoes para o next().
 * O Express 5 ja faz isso nativamente, mas manter o wrapper deixa o
 * comportamento explicito e independe da versao.
 */
export const handler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
