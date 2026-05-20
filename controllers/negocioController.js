const Negocio = require('../models/negocioModel');

const getNegocio = async (req, res) => {
  try {
    const { negocioid } = req.usuario;
    const negocio = await Negocio.findByPk(negocioid);
    if (!negocio) return res.status(404).json({ mensaje: 'Negocio no encontrado.' });
    res.status(200).json({ negocio });
  } catch (error) {
    console.error('Error al obtener negocio:', error);
    res.status(500).json({ mensaje: 'Error al obtener el negocio.' });
  }
};

const updateNegocio = async (req, res) => {
  try {
    const { negocioid } = req.usuario;
    const { nombre, nit, telefono, direccion } = req.body;

    const negocio = await Negocio.findByPk(negocioid);
    if (!negocio) return res.status(404).json({ mensaje: 'Negocio no encontrado.' });

    await negocio.update({
      nombre: nombre || negocio.nombre,
      nit: nit ?? negocio.nit,
      telefono: telefono ?? negocio.telefono,
      direccion: direccion ?? negocio.direccion,
    });

    res.status(200).json({ mensaje: 'Negocio actualizado exitosamente.', negocio });
  } catch (error) {
    console.error('Error al actualizar negocio:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el negocio.' });
  }
};

module.exports = { getNegocio, updateNegocio };
