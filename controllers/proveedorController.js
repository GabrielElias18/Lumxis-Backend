const { where } = require('sequelize');
const Proveedor = require('../models/proveedorModel');

// ========================================================
// ➕ Crear un nuevo proveedor
// ========================================================
const createProveedor = async (req, res) => {
  try {
    // 📥 Datos recibidos del cliente
    const {
      razonSocial,
      nombreProveedor,
      nit,
      telefono,
      correo,
      direccion,
      banco,
      numeroCuenta,
      tipoCuenta,
      categoriaSuministro,
      estado
    } = req.body;

    const usuarioId = req.usuario.usuarioId; // ID del usuario autenticado

    // 🛡️ Verificar autenticación
    if (!usuarioId) {
      return res.status(400).json({ mensaje: 'Usuario no autenticado' });
    }

    // 🔍 Validar existencia de proveedor con la misma razón social
    const proveedorExistente = await Proveedor.findOne({
      where: {
        razonSocial,
        usuarioid: usuarioId
      }
    });

    if (proveedorExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un proveedor con este nombre' });
    }

    // 🧱 Crear nuevo proveedor
    const nuevoProveedor = await Proveedor.create({
      razonSocial,
      nombreProveedor,
      nit,
      telefono,
      correo,
      direccion,
      banco,
      numeroCuenta,
      tipoCuenta,
      categoriaSuministro,
      estado,
      usuarioid: usuarioId
    });

    res.status(201).json({
      mensaje: 'Proveedor registrado exitosamente',
      proveedor: nuevoProveedor
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar al nuevo proveedor',
      error: error.message
    });
  }
};

// ========================================================
// 📄 Obtener todos los proveedores del usuario
// ========================================================
const getProveedores = async (req, res) => {
  try {
    const usuarioId = req.usuario.usuarioId;

    // 🔍 Obtener proveedores ordenados por nombre
    const proveedores = await Proveedor.findAll({
      where: { usuarioid: usuarioId },
      order: [['nombreProveedor', 'DESC']]
    });

    res.status(200).json(proveedores);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener los proveedores',
      error: error.message
    });
  }
};

// ========================================================
// ✏️ Actualizar proveedor
// ========================================================
const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      razonSocial,
      nombreProveedor,
      nit,
      telefono,
      correo,
      direccion,
      banco,
      numeroCuenta,
      tipoCuenta,
      categoriaSuministro,
      estado
    } = req.body;

    const usuarioId = req.usuario.usuarioId;

    // 🔍 Verificar existencia del proveedor por ID y usuario
    const proveedor = await Proveedor.findOne({
      where: { proveedorid: id, usuarioid: usuarioId }
    });

    if (!proveedor) {
      return res.status(404).json('Proveedor no encontrado');
    }

    // ✏️ Actualizar datos (conservar los existentes si no se envían nuevos)
    const proveedorActualizado = await proveedor.update({
      razonSocial: razonSocial || proveedor.razonSocial,
      nombreProveedor: nombreProveedor || proveedor.nombreProveedor,
      nit: nit || proveedor.nit,
      telefono: telefono || proveedor.telefono,
      correo: correo || proveedor.correo,
      direccion: direccion || proveedor.direccion,
      banco: banco || proveedor.banco,
      numeroCuenta: numeroCuenta || proveedor.numeroCuenta,
      tipoCuenta: tipoCuenta || proveedor.tipoCuenta,
      categoriaSuministro: categoriaSuministro || proveedor.categoriaSuministro,
      estado: estado || proveedor.estado,
    });

    res.status(200).json({
      mensaje: 'Datos del proveedor actualizados exitosamente',
      proveedor: proveedorActualizado
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar el proveedor',
      error: error.message
    });
  }
};

// ========================================================
// 🗑️ Eliminar proveedor
// ========================================================
const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId;

    // 🧹 Eliminar el proveedor por ID y usuario
    const resultado = await Proveedor.destroy({
      where: { proveedorid: id, usuarioid: usuarioId }
    });

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    res.status(200).json({ mensaje: 'Proveedor eliminado correctamente' });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar el proveedor',
      error: error.message
    });
  }
};

// ========================================================
// 📤 Exportar controladores
// ========================================================
module.exports = {
  createProveedor,
  getProveedores,
  updateProveedor,
  deleteProveedor
};
