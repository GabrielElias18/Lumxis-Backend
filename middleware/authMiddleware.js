const jwt = require('jsonwebtoken');

// Middleware para verificar el token
const verificarToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó token.' });
    }

    const usuario = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');

    req.usuario = usuario; // Adjuntar datos del usuario extraídos del token

    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};

// Middleware para verificar si el usuario es administrador
const verificarAdministrador = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'administrador') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

module.exports = { verificarToken, verificarAdministrador };
