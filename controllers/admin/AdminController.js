const Usuario = require('../../models/userModel');
const { generarToken } = require('../../utils/jwt');

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.status(200).json({ usuarios });
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios.', error: error.message });
  }
};

// Crear un usuario manualmente (por el administrador)
const createUser = async (req, res) => {
    try {
      // Verificar si el usuario que hace la solicitud es administrador
      if (req.usuario.rol !== 'administrador') {
        return res.status(403).json({ mensaje: 'No tienes permiso para crear usuarios.' });
      }
  
      const { primerNombre, segundoNombre, primerApellido, segundoApellido, correo, telefono, contraseña, rol } = req.body;
  
      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ where: { correo } });
      if (usuarioExistente) {
        return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
      }
  
      // Crear usuario
      const nuevoUsuario = await Usuario.create({
        primer_nombre: primerNombre,
        segundo_nombre: segundoNombre,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido,
        correo,
        telefono,
        contraseña, // 🔹 Si quieres encriptar, usa bcrypt aquí
        rol
      });
  
      res.status(201).json({
        mensaje: 'Usuario creado exitosamente.',
        usuario: nuevoUsuario
      });
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      res.status(500).json({ mensaje: 'Error al crear el usuario.', error: error.message });
    }
  };
  

// Editar un usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { primerNombre, segundoNombre, primerApellido, segundoApellido, correo, telefono, contraseña, rol } = req.body;

    // Buscar el usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Actualizar usuario
    await usuario.update({
      primer_nombre: primerNombre || usuario.primer_nombre,
      segundo_nombre: segundoNombre || usuario.segundo_nombre,
      primer_apellido: primerApellido || usuario.primer_apellido,
      segundo_apellido: segundoApellido || usuario.segundo_apellido,
      correo: correo || usuario.correo,
      telefono: telefono || usuario.telefono,
      contraseña: contraseña || usuario.contraseña, // 🔹 Encripta si es necesario
      rol: rol || usuario.rol
    });

    res.status(200).json({
      mensaje: 'Usuario actualizado exitosamente.',
      usuario
    });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el usuario.', error: error.message });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Eliminar usuario
    await usuario.destroy();

    res.status(200).json({ mensaje: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el usuario.', error: error.message });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
