const User = require("../models/Users");
const bcrypt = require("bcrypt");
const generateToken = require("../../utilities/jwt.generate");

exports.register = async (req, res) => {
  try {
    const { nome_completo, email, password, tipo_usuario, curso, cursos, unidades } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nome_completo: nome_completo,
      email,
      password: hashedPassword,
      tipo_usuario: tipo_usuario,
      curso: tipo_usuario === "aluno" ? curso : undefined,
      cursos: tipo_usuario === "professor" ? (Array.isArray(cursos) ? cursos : cursos ? [cursos] : []) : [],
      unidades: tipo_usuario === "professor" ? (Array.isArray(unidades) ? unidades : []) : [],
    });

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: user._id,
        nome_completo: user.nome_completo,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        curso: user.curso || (user.cursos && user.cursos.length ? user.cursos.join(', ') : undefined),
        cursos: user.cursos,
        unidades: user.unidades,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
        tipo_usuario: user.tipo_usuario,
        curso: user.curso || (user.cursos && user.cursos.length ? user.cursos.join(', ') : undefined),
        cursos: user.cursos,
        unidades: user.unidades,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
