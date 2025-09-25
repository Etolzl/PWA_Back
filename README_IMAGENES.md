# Funcionalidad de Guardar Imágenes en Perfil

## Descripción
Se ha implementado la funcionalidad completa para que los usuarios puedan guardar imágenes en su perfil personal. Las imágenes se almacenan en la base de datos con referencias y metadatos.

## Nuevas Características

### Backend
1. **Modelo Image** (`models/Image.js`)
   - Almacena referencias de imágenes con metadatos
   - Incluye URL, título, descripción, categoría, tags
   - Relación con el usuario que guardó la imagen

2. **Modelo User actualizado** (`models/User.js`)
   - Campo `imagenesGuardadas` para referencias a imágenes guardadas

3. **Controlador de Imágenes** (`controllers/imageController.js`)
   - `guardarImagen`: Guarda una imagen en el perfil del usuario
   - `obtenerImagenesGuardadas`: Obtiene todas las imágenes guardadas por el usuario
   - `eliminarImagenGuardada`: Elimina una imagen del perfil
   - `verificarImagenGuardada`: Verifica si una imagen está guardada
   - `obtenerEstadisticas`: Obtiene estadísticas de imágenes guardadas

4. **Middleware de Autenticación** (`middleware/auth.js`)
   - Middleware simple para autenticación (usa header x-user-id)
   - En producción se debería usar JWT tokens

5. **Rutas de Imágenes** (`routes/imageRoutes.js`)
   - `POST /api/images/save` - Guardar imagen
   - `GET /api/images/saved` - Obtener imágenes guardadas
   - `DELETE /api/images/:imageId` - Eliminar imagen
   - `GET /api/images/check` - Verificar si está guardada
   - `GET /api/images/stats` - Obtener estadísticas

### Frontend
1. **Estados nuevos**:
   - `savedImages`: Set con URLs de imágenes guardadas
   - `savingImage`: Estado de carga al guardar

2. **Funciones nuevas**:
   - `saveImageToProfile()`: Guarda imagen en el perfil
   - `checkIfImageIsSaved()`: Verifica si imagen está guardada
   - `loadSavedImages()`: Carga imágenes guardadas del usuario

3. **UI actualizada**:
   - Botón "Guardar" cambia a "✓ Guardada" cuando la imagen está guardada
   - Botón "Descargar" separado del botón guardar
   - Indicadores visuales de estado (colores, disabled)

## Cómo Probar

### 1. Iniciar el Backend
```bash
cd PWA_Back
npm start
```

### 2. Iniciar el Frontend
```bash
cd PWA_Front
npm start
```

### 3. Flujo de Prueba
1. **Registrarse/Iniciar sesión** en la aplicación
2. **Navegar por la galería** de imágenes
3. **Hacer clic en "Guardar"** en cualquier imagen
4. **Verificar** que el botón cambia a "✓ Guardada"
5. **Recargar la página** y verificar que las imágenes guardadas se mantienen
6. **Probar con diferentes usuarios** para verificar aislamiento

### 4. Endpoints de API para Pruebas

#### Guardar una imagen:
```bash
curl -X POST http://localhost:3000/api/images/save \
  -H "Content-Type: application/json" \
  -H "x-user-id: USER_ID_AQUI" \
  -d '{
    "url": "https://example.com/image.jpg",
    "title": "Mi Imagen",
    "description": "Descripción de la imagen",
    "category": "Naturaleza",
    "tags": ["tag1", "tag2"]
  }'
```

#### Obtener imágenes guardadas:
```bash
curl -H "x-user-id: USER_ID_AQUI" \
  http://localhost:3000/api/images/saved
```

#### Verificar si imagen está guardada:
```bash
curl -H "x-user-id: USER_ID_AQUI" \
  "http://localhost:3000/api/images/check?url=https://example.com/image.jpg"
```

## Notas Técnicas

### Autenticación
- Actualmente usa un header simple `x-user-id`
- En producción se debe implementar JWT tokens
- El middleware `authenticateUser` valida que el usuario existe

### Base de Datos
- Las imágenes se almacenan como referencias (no archivos)
- Se mantiene relación bidireccional entre User e Image
- Índices optimizados para búsquedas eficientes

### Frontend
- Estado de imágenes guardadas se mantiene en memoria
- Se sincroniza con el backend al iniciar sesión
- UI reactiva que muestra estado actual de cada imagen

## Próximas Mejoras
1. Implementar JWT tokens para autenticación
2. Agregar paginación en la UI para imágenes guardadas
3. Crear vista dedicada para ver todas las imágenes guardadas
4. Implementar eliminación de imágenes desde la UI
5. Agregar filtros y búsqueda en imágenes guardadas
6. Implementar categorización personalizada
