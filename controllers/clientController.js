// ======================================================
// 👥 CONTROLADOR DE CLIENTES
// ======================================================

const Cliente = require('../models/clientModel');

// ===============================================
// ➕ Crear un nuevo cliente
// ===============================================
const createClient = async (req, res) => {
  try {
    const { nombreCliente, telefono, correo, direccion } = req.body;
    const { usuarioid, negocioid } = req.usuario;

    const clienteExistente = await Cliente.findOne({
      where: { nombreCliente, negocioid }
    });

    if (clienteExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un cliente con este nombre en tu negocio.' });
    }

    const nuevoCliente = await Cliente.create({
      nombreCliente,
      telefono,
      correo,
      direccion,
      usuarioid,
      negocioid
    });

    res.status(201).json({ mensaje: 'Cliente registrado exitosamente.', cliente: nuevoCliente });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar al cliente.' });
  }
};

// ===============================================
// 📄 Obtener todos los clientes del NEGOCIO
// ===============================================
const getClientes = async (req, res) => {
  try {
    const { negocioid } = req.usuario;

    const clientes = await Cliente.findAll({
      where: { negocioid },
      order: [['nombre_cliente', 'ASC']]
    });

    res.status(200).json(clientes);

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los clientes' });
  }
};

// ===============================================
// ✏️ Actualizar un cliente por ID
// ===============================================
const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;
    const { nombreCliente, telefono, correo, direccion } = req.body;

    const cliente = await Cliente.findOne({
      where: { clienteid: id, negocioid }
    });

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    await cliente.update({
      nombreCliente: nombreCliente || cliente.nombreCliente,
      telefono: telefono || cliente.telefono,
      correo: correo || cliente.correo,
      direccion: direccion || cliente.direccion
    });

    res.status(200).json({ mensaje: 'Cliente actualizado exitosamente', cliente });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el cliente' });
  }
};

// ===============================================
// 🗑️ Eliminar un cliente por ID
// ===============================================
const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;

    const resultado = await Cliente.destroy({
      where: { clienteid: id, negocioid }
    });

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el cliente.' });
  }
};

module.exports = {
  createClient,
  getClientes,
  updateCliente,
  deleteCliente
};
