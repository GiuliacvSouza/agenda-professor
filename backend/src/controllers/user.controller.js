const User = require("../models/Users");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { nome_completo, email, tipo_usuario, curso, horarios_disponiveis } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    user.nome_completo = nome_completo || user.nome_completo;
    user.email = email || user.email;
    user.tipo_usuario = tipo_usuario || user.tipo_usuario;
    user.curso = curso || user.curso;
    if (user.tipo_usuario === "professor" && horarios_disponiveis !== undefined) {
      user.horarios_disponiveis = horarios_disponiveis;
    }
    await user.save();
    res.json({ message: "Usuário atualizado com sucesso", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ tipo_usuario: "professor" }).select("-password");
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};