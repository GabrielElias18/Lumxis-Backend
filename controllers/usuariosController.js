const Usuario = require('../models/userModel');
const bcrypt = require('bcrypt');

const getAllUsers = async (req, res) => {
  try {
    const { negocioid } = req.usuario;

    const usuarios = await Usuario.findAll({
      where: { negocioid },
      attributes: { exclude: ['contraseña'] }
    });

    res.status(200).json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios.', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;
    const { primerNombre, segundoNombre, primerApellido, segundoApellido, correo, telefono, contraseña, rol } = req.body;

    const usuario = await Usuario.findOne({ where: { usuarioid: id, negocioid } });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado en este negocio.' });
    }

    const contraseñaFinal = contraseña ? await bcrypt.hash(contraseña, 10) : usuario.contraseña;

    await usuario.update({
      primer_nombre: primerNombre || usuario.primer_nombre,
      segundo_nombre: segundoNombre || usuario.segundo_nombre,
      primer_apellido: primerApellido || usuario.primer_apellido,
      segundo_apellido: segundoApellido || usuario.segundo_apellido,
      correo: correo || usuario.correo,
      telefono: telefono || usuario.telefono,
      contraseña: contraseñaFinal,
      rol: rol || usuario.rol
    });

    res.status(200).json({ mensaje: 'Usuario actualizado exitosamente.', usuario });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el usuario.', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;

    const usuario = await Usuario.findOne({ where: { usuarioid: id, negocioid } });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado en este negocio.' });
    }

    if (usuario.usuarioid === req.usuario.usuarioid) {
      return res.status(400).json({ mensaje: 'No puedes eliminarte a ti mismo.' });
    }

    await usuario.destroy();
    res.status(200).json({ mensaje: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el usuario.', error: error.message });
  }
};

module.exports = { getAllUsers, updateUser, deleteUser };
