// ======================================================
// 🔐 CONTROLADOR DE AUTENTICACIÓN (Registro y Login)
// ======================================================

const { Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // conexión principal
const defineUsuarioModel = require('../models/userModel');
const Usuario = defineUsuarioModel(sequelize, require('sequelize').DataTypes);
const { generarToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

// Función para limpiar y transformar nombres
const slugify = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/\s+/g, '_')            // espacios a _
    .replace(/[^\w]/g, '')           // quitar símbolos raros
    .toLowerCase();

// 📦 Crear una nueva base de datos usando Sequelize
const crearBaseDeDatos = async (nombreDB) => {
  try {
    const sequelizeTemp = new Sequelize(
      'postgres',
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
      }
    );

    await sequelizeTemp.query(`CREATE DATABASE "${nombreDB}";`);
    await sequelizeTemp.close();

    console.log(`✅ Base de datos ${nombreDB} creada correctamente.`);
  } catch (error) {
    console.error(`❌ Error al crear la base de datos ${nombreDB}:`, error);
    throw error;
  }
};

// ===============================================
// ➕ REGISTRAR USUARIO (Público o Administrador)
// ===============================================
const registerUser = async (req, res) => {
  try {
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      correo,
      telefono,
      contraseña,
      rol
    } = req.body;

    console.log('📌 Datos recibidos para registro:', { ...req.body, contraseña: '[PROTECTED]' });

    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    let nuevoRol = req.path === '/register-public' ? 'vendedor' : rol || 'vendedor';

    if (req.path === '/register-admin' && rol !== 'administrador') {
      return res.status(400).json({ mensaje: 'Debes registrar administradores en esta ruta.' });
    }

    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

    // 🧱 Crear nombre de base de datos personalizado
    let nombreTenantDB = `db_${slugify(primerNombre)}_${slugify(primerApellido)}`;

    // 🧱 Crear la base de datos
    await crearBaseDeDatos(nombreTenantDB);

    // 📥 Cargar conexión a la nueva base de datos
    const nuevaConexion = new Sequelize(
      nombreTenantDB,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
      }
    );

    // 🧩 Cargar y sincronizar modelos
    const defineCategoriaModel = require('../models/categoryModel');
    const defineProductoModel = require('../models/productModel');
    const defineVentaModel = require('../models/ventaModel');
    const defineEgresoModel = require('../models/egresoModel');

    const Categoria = defineCategoriaModel(nuevaConexion, Sequelize.DataTypes);
    const Producto = defineProductoModel(nuevaConexion, Sequelize.DataTypes);
    const Venta = defineVentaModel(nuevaConexion, Sequelize.DataTypes);
    const Egreso = defineEgresoModel(nuevaConexion, Sequelize.DataTypes);

    await nuevaConexion.sync();


    // 📦 Crear el usuario en la base de datos principal
    const nuevoUsuario = await Usuario.create({
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      correo,
      telefono,
      contraseña: contraseñaEncriptada,
      rol: nuevoRol,
      tenant_db: nombreTenantDB
    });

    console.log('✅ Usuario registrado:', { ...nuevoUsuario.toJSON(), contraseña: '[PROTECTED]' });

    const token = generarToken(nuevoUsuario.toJSON());

    const usuarioData = {
      id: nuevoUsuario.usuarioid,
      primerNombre: nuevoUsuario.primer_nombre,
      segundoNombre: nuevoUsuario.segundo_nombre,
      primerApellido: nuevoUsuario.primer_apellido,
      segundoApellido: nuevoUsuario.segundo_apellido,
      correo: nuevoUsuario.correo,
      telefono: nuevoUsuario.telefono,
      rol: nuevoUsuario.rol
    };

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      token,
      usuario: usuarioData
    });

  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    res.status(500).json({ mensaje: 'Error al registrar el usuario.', error: error.message });
  }
};

// ===============================================
// 🔑 LOGIN DE USUARIO
// ===============================================
const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    console.log('📌 Datos recibidos para login:', { correo, contraseña: '[PROTECTED]' });

    if (!correo || !contraseña) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios.' });
    }

    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    console.log('✅ Usuario autenticado:', usuario.correo);

    const token = generarToken(usuario.toJSON());

    const usuarioData = {
      id: usuario.usuarioid,
      primerNombre: usuario.primer_nombre,
      segundoNombre: usuario.segundo_nombre,
      primerApellido: usuario.primer_apellido,
      segundoApellido: usuario.segundo_apellido,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol
    };

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: usuarioData
    });

  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión.', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser
};
