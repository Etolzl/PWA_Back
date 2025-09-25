const Image = require('../models/Image');
const User = require('../models/User');
const mongoose = require('mongoose');

// Guardar una imagen en el perfil del usuario
const guardarImagen = async (req, res) => {
  try {
    const { url, title, description, category, tags } = req.body;
    const userId = req.user.id; // Asumiendo que el middleware de auth agrega req.user

    // Validar que la imagen no esté ya guardada por el usuario
    const imagenExistente = await Image.findOne({
      url: url,
      savedBy: userId
    });

    if (imagenExistente) {
      return res.status(400).json({
        success: false,
        message: 'Esta imagen ya está guardada en tu perfil'
      });
    }

    // Crear nueva imagen
    const nuevaImagen = new Image({
      url,
      title,
      description,
      category,
      tags: tags || [],
      savedBy: userId
    });

    const imagenGuardada = await nuevaImagen.save();

    // Agregar la imagen al array de imágenes guardadas del usuario
    await User.findByIdAndUpdate(
      userId,
      { $push: { imagenesGuardadas: imagenGuardada._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Imagen guardada exitosamente',
      data: imagenGuardada
    });

  } catch (error) {
    console.error('Error al guardar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al guardar la imagen'
    });
  }
};

// Obtener todas las imágenes guardadas por el usuario
const obtenerImagenesGuardadas = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, category } = req.query;

    // Construir filtro
    const filtro = { savedBy: userId };
    if (category && category !== 'Todas') {
      filtro.category = category;
    }

    // Calcular paginación
    const skip = (page - 1) * limit;

    // Obtener imágenes con paginación
    const imagenes = await Image.find(filtro)
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total de imágenes
    const total = await Image.countDocuments(filtro);

    res.json({
      success: true,
      data: {
        imagenes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalImages: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener imágenes guardadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener las imágenes'
    });
  }
};

// Eliminar una imagen guardada
const eliminarImagenGuardada = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.id;

    // Verificar que la imagen pertenece al usuario
    const imagen = await Image.findOne({
      _id: imageId,
      savedBy: userId
    });

    if (!imagen) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada o no tienes permisos para eliminarla'
      });
    }

    // Eliminar la imagen
    await Image.findByIdAndDelete(imageId);

    // Remover la imagen del array de imágenes guardadas del usuario
    await User.findByIdAndUpdate(
      userId,
      { $pull: { imagenesGuardadas: imageId } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar la imagen'
    });
  }
};

// Verificar si una imagen está guardada por el usuario
const verificarImagenGuardada = async (req, res) => {
  try {
    const { url } = req.query;
    const userId = req.user.id;

    const imagenGuardada = await Image.findOne({
      url: url,
      savedBy: userId
    });

    res.json({
      success: true,
      data: {
        isSaved: !!imagenGuardada,
        imageId: imagenGuardada ? imagenGuardada._id : null
      }
    });

  } catch (error) {
    console.error('Error al verificar imagen guardada:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al verificar la imagen'
    });
  }
};

// Obtener estadísticas de imágenes guardadas
const obtenerEstadisticas = async (req, res) => {
  try {
    const userId = req.user.id;

    // Contar imágenes por categoría
    const estadisticasPorCategoria = await Image.aggregate([
      { $match: { savedBy: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Total de imágenes guardadas
    const totalImagenes = await Image.countDocuments({ savedBy: userId });

    // Imagen más reciente
    const imagenReciente = await Image.findOne({ savedBy: userId })
      .sort({ savedAt: -1 })
      .select('title savedAt');

    res.json({
      success: true,
      data: {
        totalImagenes,
        estadisticasPorCategoria,
        imagenReciente
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

module.exports = {
  guardarImagen,
  obtenerImagenesGuardadas,
  eliminarImagenGuardada,
  verificarImagenGuardada,
  obtenerEstadisticas
};
