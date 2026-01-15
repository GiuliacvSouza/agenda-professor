const Course = require('../models/Course');
const User = require('../models/Users');

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome do curso é obrigatório' });
    const existing = await Course.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Curso já existe' });
    const course = await Course.create({ name });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se existem alunos associados a este curso
    const studentsWithCourse = await User.countDocuments({
      tipo_usuario: 'aluno',
      curso: { $exists: true, $ne: null, $ne: '' }
    });

    // Se houver alunos com cursos, verificar se algum tem exatamente este curso
    if (studentsWithCourse > 0) {
      const course = await Course.findById(id);
      if (!course) return res.status(404).json({ message: 'Curso não encontrado' });

      // Verificar se algum aluno tem este curso específico
      const studentsWithThisCourse = await User.countDocuments({
        tipo_usuario: 'aluno',
        curso: course.name
      });

      if (studentsWithThisCourse > 0) {
        return res.status(400).json({
          message: `Não é possível excluir o curso "${course.name}". Existem ${studentsWithThisCourse} aluno(s) matriculado(s) neste curso. Transfira os alunos para outro curso antes de excluir.`
        });
      }
    }

    // Verificar se existem professores associados a este curso
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Curso não encontrado' });

    const teachersWithCourse = await User.countDocuments({
      tipo_usuario: 'professor',
      cursos: course.name
    });

    if (teachersWithCourse > 0) {
      return res.status(400).json({
        message: `Não é possível excluir o curso "${course.name}". Existem ${teachersWithCourse} professor(es) associado(s) a este curso. Remova a associação dos professores antes de excluir.`
      });
    }

    await Course.findByIdAndDelete(id);
    res.json({ message: 'Curso removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade } = req.body;
    if (!unidade) return res.status(400).json({ message: 'Unidade é obrigatória' });
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Curso não encontrado' });
    if (course.unidades.includes(unidade)) return res.status(400).json({ message: 'Unidade já existe' });
    course.unidades.push(unidade);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeUnit = async (req, res) => {
  try {
    const { id, unidade } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Curso não encontrado' });
    course.unidades = course.unidades.filter(u => u !== unidade);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};