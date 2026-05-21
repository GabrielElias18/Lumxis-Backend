const Rol = require('../models/rolModel');
const RolSeccion = require('../models/roleSeccionModel');
const Usuario = require('../models/userModel');

const getRoles = async (req, res) => {
  try {
    const { negocioid } = req.usuario;
    const roles = await Rol.findAll({
      where: { negocioid },
      include: [{ model: RolSeccion, as: 'secciones', attributes: ['seccion'] }],
    });
    res.json({ roles });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ mensaje: 'Error al obtener roles.' });
  }
};

const createRol = async (req, res) => {
  try {
    const { negocioid } = req.usuario;
    const { nombre, secciones = [] } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({ mensaje: 'El nombre del rol es obligatorio.' });
    }

    const rol = await Rol.create({ nombre: nombre.trim(), negocioid });

    if (secciones.length > 0) {
      await RolSeccion.bulkCreate(secciones.map((s) => ({ rolid: rol.rolid, seccion: s })));
    }

    const rolConSecciones = await Rol.findByPk(rol.rolid, {
      include: [{ model: RolSeccion, as: 'secciones', attributes: ['seccion'] }],
    });

    res.status(201).json({ mensaje: 'Rol creado exitosamente.', rol: rolConSecciones });
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ mensaje: 'Error al crear el rol.' });
  }
};

const updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;
    const { nombre, secciones = [] } = req.body;

    const rol = await Rol.findOne({ where: { rolid: id, negocioid } });
    if (!rol) return res.status(404).json({ mensaje: 'Rol no encontrado.' });

    if (nombre?.trim()) await rol.update({ nombre: nombre.trim() });

    await RolSeccion.destroy({ where: { rolid: rol.rolid } });
    if (secciones.length > 0) {
      await RolSeccion.bulkCreate(secciones.map((s) => ({ rolid: rol.rolid, seccion: s })));
    }

    const rolActualizado = await Rol.findByPk(rol.rolid, {
      include: [{ model: RolSeccion, as: 'secciones', attributes: ['seccion'] }],
    });

    res.json({ mensaje: 'Rol actualizado.', rol: rolActualizado });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el rol.' });
  }
};

const deleteRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;

    const rol = await Rol.findOne({ where: { rolid: id, negocioid } });
    if (!rol) return res.status(404).json({ mensaje: 'Rol no encontrado.' });

    const usuariosConRol = await Usuario.count({ where: { rolid: id } });
    if (usuariosConRol > 0) {
      return res.status(400).json({
        mensaje: `No se puede eliminar. ${usuariosConRol} usuario(s) tienen este rol asignado.`,
      });
    }

    await RolSeccion.destroy({ where: { rolid: id } });
    await rol.destroy();

    res.json({ mensaje: 'Rol eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el rol.' });
  }
};

module.exports = { getRoles, createRol, updateRol, deleteRol };
