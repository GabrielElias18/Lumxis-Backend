// ======================================================
// 👥 CONTROLADOR DE CLIENTES
// ======================================================

const createClient = async (req, res) => {
  try {
    const { nombreCliente, telefono, correo, direccion } = req.body;
    const usuarioId = req.usuario.usuarioId; // ID del usuario autenticado
    const Cliente = req.tenantSequelize.models.Cliente;

    if (!usuarioId) {
      return res.status(400).json({ mensaje: 'Usuario no autenticado' });
    }

    // 🔍 Verificar si ya existe un cliente con el mismo nombre para este usuario
    const clienteExistente = await Cliente.findOne({
      where: {
        nombreCliente,
        usuarioid: usuarioId
      }
    });

    if (clienteExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un cliente con este nombre' });
    }

    // 🏗️ Crear el nuevo cliente
    const nuevoCliente = await Cliente.create({
      nombreCliente,
      telefono,
      correo,
      direccion,
      usuarioid: usuarioId
    });

    res.status(201).json({
      mensaje: 'Cliente registrado exitosamente.',
      cliente: nuevoCliente
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar al nuevo cliente.',
      error: error.message
    });
  }
};

// ===============================================
// 📄 Obtener todos los clientes de un usuario
// ===============================================
const getClientes = async (req, res) => {
  try {
    const usuarioId = req.usuario.usuarioId;
    const Cliente = req.tenantSequelize.models.Cliente;

    const clientes = await Cliente.findAll({
      where: { usuarioid: usuarioId },
      order: [['nombreCliente', 'DESC']] // Orden descendente por nombre
    });

    res.status(200).json({ clientes });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener los clientes',
      error: error.message
    });
  }
};

// ===============================================
// ✏️ Actualizar un cliente por ID
// ===============================================
const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCliente, telefono, correo, direccion } = req.body;
    const usuarioId = req.usuario.usuarioId;
    const Cliente = req.tenantSequelize.models.Cliente;

    // Buscar el cliente por ID
    const cliente = await Cliente.findOne({
      where: { clienteid: id }
    });

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    // Actualizar campos solo si se han enviado
    const clienteActualizado = await cliente.update({
      nombreCliente: nombreCliente || cliente.nombreCliente,
      telefono: telefono || cliente.telefono,
      correo: correo || cliente.correo,
      direccion: direccion || cliente.direccion
    });

    res.status(200).json({
      mensaje: 'Datos del cliente actualizados exitosamente',
      clienteActualizado
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar el cliente',
      error: error.message
    });
  }
};

// ===============================================
// 🗑️ Eliminar un cliente por ID
// ===============================================
const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId;
    const Cliente = req.tenantSequelize.models.Cliente;

    const resultado = await Cliente.destroy({
      where: { clienteid: id }
    });

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar el cliente.',
      error: error.message
    });
  }
};

// ===============================================
// 📤 Exportar funciones del controlador
// ===============================================
module.exports = {
  createClient,
  getClientes,
  updateCliente,
  deleteCliente
};