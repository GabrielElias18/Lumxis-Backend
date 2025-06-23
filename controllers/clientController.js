const Cliente = require('../models/clientModel')

const createClient = async (req, res) => {
    try {
        const {nombreCliente, telefono, correo, direccion} = req.body
        const usuarioId = req.usuario.usuarioId

        if (!usuarioId) {
            return res.status(400).json({ mensaje: 'Usuario no autenticado'})
        }

        // Verificamos si este cliente ya existe
        const clienteExistente = await Cliente.findOne({
            where: {
                nombreCliente,
                usuarioid: usuarioId
            }
        })

        if (clienteExistente) {
            return res.status(400).json({ mensaje: 'Ya existe un cliente con este nombre'})
        }

        const nuevoCliente = await Cliente.create({
            nombreCliente,
            telefono,
            correo,
            direccion,
            usuarioid: usuarioId
        })
        res.status(201).json({
            mensaje: 'Cliente registrado exitosamente.',
            cliente: nuevoCliente
        })

    } catch (error) {
        res.status(500).json({ 
            mensaje: 'Error al registrar al nuevo cliente.', 
            error:error.message})
    }
}

const getClientes = async (req, res) => {
    try {
        const usuarioId = req.usuario.usuarioId;

        const clientes = await Cliente.findAll({
            where: { usuarioid: usuarioId},
            order: [['nombreCliente', 'DESC']]
        })

        res.status(200).json({ clientes })
    } catch(error) {
        res.status(500).json({ mensaje: 'Error al obtener los clientes',
            error: error.message
        })
    }
}

const updateCliente = async (req, res) => {
    try {
        const { id } = req.params
        const { nombreCliente, telefono, correo, direccion } = req.body;
        const usuarioId = req.usuario.usuarioId

        const cliente = await Cliente.findOne({
            where: {
                clienteid: id
            }
        })

        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado'})
        }

        const clienteActualizado = await cliente.update({
            nombreCliente: nombreCliente || cliente.nombreCliente,
            telefono: telefono || cliente.telefono,
            correo: correo || cliente.correo,
            direccion: direccion || cliente.direccion
        })

        res.status(200).json({
            mensaje: 'Datos del cliente actualizado existosamente',
            clienteActualizado
        })
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el cliente', error: error.message})
    }
}

const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params
        const usuarioId = req.usuario.usuarioId

        const resultado = await Cliente.destroy({
            where: {
                clienteid: id
            }
        })

        if (!resultado) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado'})
        }

        res.status(200).json({ mensaje: 'Cliente eliminado correctamente'})
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el cliente.', error: error.message})
    }
}

module.exports = { createClient, getClientes, updateCliente, deleteCliente}