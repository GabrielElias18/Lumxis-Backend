const express = require('express')
const { createClient, getClientes, updateCliente, deleteCliente } = require('../controllers/clientController')
const { verificarToken } = require('../middleware/authMiddleware')

const router = express.Router();

router.post('/', verificarToken, createClient)
router.get('/', verificarToken, getClientes)
router.patch('/:id', verificarToken, updateCliente)
router.delete('/:id', verificarToken, deleteCliente)

module.exports = router