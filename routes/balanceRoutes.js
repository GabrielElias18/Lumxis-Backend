const express = require('express');
const { getBalanceSummary } = require('../controllers/balanceController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', verificarToken, getBalanceSummary);

module.exports = router;
