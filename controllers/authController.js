// ======================================================
// 🔐 CONTROLADOR DE AUTENTICACIÓN (Registro y Login)
// ======================================================

const Usuario = require('../models/userModel');       
const Negocio = require('../models/negocioModel');     
const { generarToken } = require('../utils/jwt');     
const bcrypt = require('bcrypt');                     
const sequelize = require('../config/database');

// ===============================================
// ➕ REGISTRAR NEGOCIO Y ADMINISTRADOR (SaaS Flow)
// ===============================================
const registerUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      nombreNegocio,
      nit,
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      correo,
      telefono,
      contraseña
    } = req.body;

    // 🔍 Verificar si ya existe un usuario con ese correo
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    // 🏗️ 1. Crear el Negocio
    const nuevoNegocio = await Negocio.create({
      nombre: nombreNegocio,
      nit: nit,
      telefono: telefono
    }, { transaction: t });

    // 🔐 Encriptar la contraseña
    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

    // 🏗️ 2. Crear el Usuario Administrador ligado al Negocio
    const nuevoUsuario = await Usuario.create({
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      correo,
      telefono,
      contraseña: contraseñaEncriptada,
      rol: 'administrador', // El primer registro siempre es Admin
      negocioid: nuevoNegocio.negocioid
    }, { transaction: t });

    await t.commit();

    // 🎟️ Generar token JWT (incluyendo negocioid en el payload)
    const token = generarToken({
      usuarioid: nuevoUsuario.usuarioid,
      negocioid: nuevoUsuario.negocioid,
      rol: nuevoUsuario.rol,
      correo: nuevoUsuario.correo
    });

    res.status(201).json({
      mensaje: 'Negocio y administrador registrados exitosamente.',
      token,
      usuario: {
        id: nuevoUsuario.usuarioid,
        nombre: nuevoUsuario.primer_nombre,
        negocioId: nuevoUsuario.negocioid,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Error al registrar:', error);
    res.status(500).json({ mensaje: 'Error al registrar el negocio.', error: error.message });
  }
};

// ===============================================
// 🔑 LOGIN DE USUARIO (Con Negocio Context)
// ===============================================
const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios.' });
    }

    const usuario = await Usuario.findOne({ 
      where: { correo },
      include: [{ model: Negocio, as: 'negocio', attributes: ['nombre', 'logo'] }] 
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const token = generarToken({
      usuarioid: usuario.usuarioid,
      negocioid: usuario.negocioid,
      rol: usuario.rol,
      correo: usuario.correo
    });

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.usuarioid,
        primerNombre: usuario.primer_nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        negocioId: usuario.negocioid,
        nombreNegocio: usuario.negocio?.nombre
      }
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
