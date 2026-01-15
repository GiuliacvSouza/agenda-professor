/**
 * Middleware para validar domínio do email
 * @param {string[]} allowedDomains - domínios permitidos (ex: ['ipvc.pt', 'ipvc.estg.pt'])
 */
const validateEmailDomain = (allowedDomains = []) => {
  if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) {
    throw new Error("allowedDomains deve ser um array não vazio");
  }

  // cria regex dinâmica a partir dos domínios
  const domainRegex = new RegExp(
    `@(${allowedDomains.map(d => d.replace('.', '\\.')).join('|')})$`
  );

  return (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email é obrigatório",
      });
    }

    if (!domainRegex.test(email)) {
      return res.status(400).json({
        message: `Email inválido. Utilize um email institucional (${allowedDomains.join(
          " ou "
        )}).`,
      });
    }

    next();
  };
};

module.exports = validateEmailDomain;
