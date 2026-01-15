require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/Users');
const bcrypt = require('bcrypt');
const connectDB = require('../src/config/db');

const run = async () => {
  try {
    await connectDB();
    const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const password = process.env.ADMIN_PASSWORD || '1234';

    let admin = await User.findOne({ email });
    if (admin) {
      console.log('Admin já existe:', email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    admin = await User.create({ nome_completo: 'Administrador', email, password: hashed, tipo_usuario: 'admin' });
    console.log('Admin criado:', { email, password });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();