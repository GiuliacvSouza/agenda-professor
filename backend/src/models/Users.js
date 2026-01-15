const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    nome_completo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    tipo_usuario: {
      type: String,
      enum: ["aluno", "professor", "admin"],
      required: true,
    },
    curso: {
      type: String,
      required: function () {
        return this.tipo_usuario === "aluno";
      },
    },
    // For teachers, allow multiple courses
    cursos: {
      type: [String],
      default: [],
    },
    // unidades curriculares por curso: [{ curso: String, unidades: [String] }]
    unidades: {
      type: [
        {
          curso: { type: String },
          unidades: { type: [String] },
        },
      ],
      default: [],
    },
    horarios_disponiveis: {
      type: [{}],
      default: [],
    },
    agendamentos: {
      type: [{}],
      default: [],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
