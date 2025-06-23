const express = require('express')
const { createProveedor, getProveedores, updateProveedor, deleteProveedor } = require ('../controllers/proveedorController')
const {verificarToken } = require('../middleware/authMiddleware')

const router = express.Router();

router.post('/', verificarToken, createProveedor)
router.get('/', verificarToken, getProveedores)
router.patch('/:id', verificarToken, updateProveedor)
router.delete('/:id', verificarToken, deleteProveedor)

module.exports = router