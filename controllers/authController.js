// ======================================================
// 🔐 CONTROLADOR DE AUTENTICACIÓN (Registro y Login)
// ======================================================

const Usuario = require('../models/userModel');       // Modelo de Usuario
const { generarToken } = require('../utils/jwt');     // Función para generar token JWT
const bcrypt = require('bcrypt');                     // Para encriptar y comparar contraseñas

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

    // 🔍 Verificar si ya existe un usuario con ese correo
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    // 🧾 Determinar el rol según la ruta
    let nuevoRol = req.path === '/register-public' ? 'vendedor' : rol || 'vendedor';

    // Validación extra si se intenta registrar como admin sin usar la ruta correcta
    if (req.path === '/register-admin' && rol !== 'administrador') {
      return res.status(400).json({ mensaje: 'Debes registrar administradores en esta ruta.' });
    }

    // 🔐 Encriptar la contraseña antes de guardarla en la BD
    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10); // 10 = saltRounds

    // 🏗️ Crear el nuevo usuario
    const nuevoUsuario = await Usuario.create({
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      correo,
      telefono,
      contraseña: contraseñaEncriptada,
      rol: nuevoRol
    });

    console.log('✅ Usuario registrado:', { ...nuevoUsuario.toJSON(), contraseña: '[PROTECTED]' });

    // 🎟️ Generar token JWT para el nuevo usuario
    const token = generarToken(nuevoUsuario.toJSON());

    // 🧾 Devolver solo los datos necesarios al cliente
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

    // 📤 Respuesta al cliente
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

    // Validación de campos requeridos
    if (!correo || !contraseña) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios.' });
    }

    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Comparar la contraseña ingresada con la almacenada en BD
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    console.log('✅ Usuario autenticado:', usuario.correo);

    // Generar token JWT
    const token = generarToken(usuario.toJSON());

    // Construir objeto de respuesta
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

    // 📤 Respuesta con token y datos del usuario
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

// Exportamos las funciones para usarlas en las rutas
module.exports = {
  registerUser,
  loginUser
};
