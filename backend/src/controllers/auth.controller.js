const User = require("../models/Users");
const bcrypt = require("bcrypt");
const generateToken = require("../../utilities/jwt.generate");

/**
 * REGISTRO
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nome_completo: name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: user._id,
        nome_completo: user.nome_completo,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * LOGIN
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login efetuado com sucesso",
      token,
      user: {
        id: user._id,
        nome_completo: user.nome_completo,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
