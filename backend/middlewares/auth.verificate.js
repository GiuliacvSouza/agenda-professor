const jwt = require("jsonwebtoken");
const User = require("../src/models/Users");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }
    req.userId = decoded.id;
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};
