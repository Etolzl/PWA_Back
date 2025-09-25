const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'La URL de la imagen es obligatoria'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'El título de la imagen es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario que guarda la imagen es obligatorio']
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índice para búsquedas eficientes
imageSchema.index({ savedBy: 1, savedAt: -1 });
imageSchema.index({ category: 1 });
imageSchema.index({ tags: 1 });

// Método para obtener datos de la imagen sin información sensible
imageSchema.methods.toJSON = function() {
  const imageObject = this.toObject();
  return imageObject;
};

module.exports = mongoose.model('Image', imageSchema);
