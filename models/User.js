const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  correo: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un correo válido']
  },
  contraseña: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  imagenesGuardadas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  }]
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña ha sido modificada
  if (!this.isModified('contraseña')) return next();
  
  try {
    // Encriptar la contraseña con un salt de 12 rondas
    const salt = await bcrypt.genSalt(12);
    this.contraseña = await bcrypt.hash(this.contraseña, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.compararContraseña = async function(contraseñaCandidata) {
  return await bcrypt.compare(contraseñaCandidata, this.contraseña);
};

// Método para obtener datos del usuario sin la contraseña
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.contraseña;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
