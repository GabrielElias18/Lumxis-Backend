const express = require('express');
const { chat } = require('../controllers/chatController');
const { verificarToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', verificarToken, chat);

module.exports = router;
