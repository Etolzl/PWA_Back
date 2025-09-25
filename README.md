# PWA Backend - Sistema de Autenticación

API backend para aplicación PWA con sistema de autenticación básico usando MongoDB.

## 🚀 Características

- ✅ Registro de usuarios
- ✅ Login de usuarios  
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Validación de datos
- ✅ Conexión a MongoDB
- ✅ Manejo de errores
- ✅ Estructura modular

## 📋 Requisitos

- Node.js (v14 o superior)
- MongoDB (local o en la nube)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd PWA_Back
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crea un archivo `.env` en la raíz del proyecto:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pwa_back
```

4. **Iniciar MongoDB**
Asegúrate de que MongoDB esté corriendo en tu sistema.

5. **Ejecutar la aplicación**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 Endpoints de la API

### Base URL
```
http://localhost:3000
```

### Autenticación

#### Registro de Usuario
```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "correo": "juan@ejemplo.com",
  "contraseña": "miContraseña123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "nombre": "Juan Pérez",
    "correo": "juan@ejemplo.com",
    "createdAt": "2023-09-01T10:30:00.000Z"
  }
}
```

#### Login de Usuario
```http
POST /api/auth/login
Content-Type: application/json

{
  "correo": "juan@ejemplo.com",
  "contraseña": "miContraseña123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "nombre": "Juan Pérez",
    "correo": "juan@ejemplo.com",
    "createdAt": "2023-09-01T10:30:00.000Z"
  }
}
```

#### Obtener Perfil
```http
GET /api/auth/perfil/:id
```

## 🗂️ Estructura del Proyecto

```
PWA_Back/
├── config/
│   └── database.js          # Configuración de MongoDB
├── controllers/
│   └── authController.js    # Lógica de autenticación
├── models/
│   └── User.js             # Modelo de Usuario
├── routes/
│   └── authRoutes.js       # Rutas de autenticación
├── index.js                # Archivo principal
├── package.json
└── README.md
```

## 🔧 Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **bcryptjs** - Encriptación de contraseñas
- **CORS** - Manejo de CORS
- **dotenv** - Variables de entorno

## 📝 Notas Importantes

- Las contraseñas se encriptan automáticamente antes de guardarse
- El sistema incluye validaciones de datos
- No se incluye JWT por el momento (autenticación básica)
- Los errores se manejan de forma consistente
- La API responde en formato JSON

## 🚧 Próximas Características

- [ ] Implementar JWT para autenticación
- [ ] Middleware de autenticación
- [ ] Recuperación de contraseña
- [ ] Validación de email
- [ ] Rate limiting
- [ ] Logs de auditoría
