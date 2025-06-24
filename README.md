# 📦 Inventario Lumxis - Backend

> Sistema completo de gestión de inventario, ventas, egresos, clientes y proveedores con autenticación segura y control multiusuario.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?style=flat&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [API Endpoints](#-api-endpoints)
- [Autenticación](#-autenticación)
- [Controladores](#-controladores)
- [Uploads e Imágenes](#-uploads-e-imágenes)
- [Roadmap](#-roadmap)

## ✨ Características

- 🔐 **Autenticación JWT** - Sistema seguro de tokens
- 👥 **Multi-usuario** - Separación de datos por usuario
- 📦 **Gestión de Inventario** - Control completo de productos y stock
- 🏢 **Proveedores y Clientes** - Administración de contactos comerciales
- 📊 **Egresos** - Registro y control de salidas de inventario
- 🖼️ **Carga de Imágenes** - Hasta 5 imágenes por producto
- 🔒 **Encriptación** - Contraseñas hasheadas con bcrypt
- 📱 **API RESTful** - Endpoints bien estructurados

## 🚀 Tecnologías

| Tecnología     | Versión | Propósito             |
|----------------|---------|-----------------------|
| **Node.js**    | 18+     | Runtime de JavaScript |
| **Express.js** | 4.x     | Framework web         |
| **PostgreSQL** | 13+     | Base de datos         |
| **Sequelize**  | 6.x     | ORM para PostgreSQL   |
| **JWT**        | Latest  | Autenticación         |
| **Multer**     | Latest  | Carga de archivos     |
| **bcrypt**     | Latest  | Hash de contraseñas   |

## 📁 Estructura del Proyecto

```
Inventario-Lumxis/
│
├── 📁 controllers/          # Lógica de negocio
│   ├── categoryController.js
│   ├── clientController.js
│   ├── productController.js
│   ├── proveedorController.js
│   └── egresoController.js
│
├── 📁 middleware/           # Autenticación y roles
│   └── verificarToken.js
│
├── 📁 models/              # Modelos Sequelize
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── Client.js
│   ├── Proveedor.js
│   └── Egreso.js
│
├── 📁 routes/              # Rutas de la API
│   ├── auth.js
│   ├── categories.js
│   ├── products.js
│   ├── clients.js
│   ├── proveedores.js
│   └── egresos.js
│
├── 📁 uploads/             # Imágenes de productos
├── 📁 utils/               # Utilidades (JWT, helpers)
├── 📄 server.js               # Servidor principal
├── 📄 package.json
└── 📄 README.md
```

## 🛠️ Instalación

### Prerrequisitos

- Node.js 18 o superior
- PostgreSQL 13 o superior
- npm

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/inventario-lumxis.git
   cd inventario-lumxis
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales
   ```

4. **Configurar base de datos**
   ```bash
   # Crear base de datos en PostgreSQL
   createdb inventario_lumxis
   
   # Ejecutar migraciones
   npm run migrate
   ```

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventario_lumxis
DB_USER=tu_usuario
DB_PASS=tu_contraseña

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=24h

# Servidor
PORT=3000
NODE_ENV=development

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación segura.

### Headers requeridos
```http
Authorization: Bearer <tu_token_jwt>
Content-Type: application/json
```

### Rutas de autenticación

| Método | Endpoint                     | Descripción                         | Acceso |
|--------|----------------------------- |-------------------------------------|---------|
| `POST` | `/api/auth/register-public`  | Registro público (rol: vendedor)    | Público |
| `POST` | `/api/auth/register-admin`   | Registro admin (rol: administrador) | Admin |
| `POST` | `/api/auth/login`            | Iniciar sesión                      | Público |

## 📡 API Endpoints

### 📂 Categorías
```http
POST   /api/categorias         # Crear categoría
GET    /api/categorias         # Listar categorías del usuario
PUT    /api/categorias/:id     # Actualizar categoría
DELETE /api/categorias/:id     # Eliminar categoría
```

### 👥 Clientes
```http
POST   /api/clientes           # Crear cliente
GET    /api/clientes           # Listar clientes del usuario
PUT    /api/clientes/:id       # Actualizar cliente
DELETE /api/clientes/:id       # Eliminar cliente
```

### 🏢 Proveedores
```http
POST   /api/proveedores        # Crear proveedor
GET    /api/proveedores        # Listar proveedores del usuario
PUT    /api/proveedores/:id    # Actualizar proveedor
DELETE /api/proveedores/:id    # Eliminar proveedor
```

### 📦 Productos
```http
POST   /api/productos          # Crear producto (con imágenes)
GET    /api/productos          # Listar todos los productos
GET    /api/productos/:id      # Obtener producto específico
PUT    /api/productos/:id      # Actualizar producto
DELETE /api/productos/:id      # Eliminar producto
```

### 📉 Egresos
```http
POST   /api/egresos            # Registrar egreso
GET    /api/egresos            # Listar egresos del usuario
PUT    /api/egresos/:id        # Actualizar egreso
DELETE /api/egresos/:id        # Eliminar egreso
```

## 🎯 Controladores

### 📂 Category Controller
- ✅ `createCategory` - Crear nueva categoría
- ✅ `getCategoriesByUser` - Listar categorías del usuario
- ✅ `updateCategory` - Editar categoría
- ✅ `deleteCategory` - Eliminar categoría

### 👥 Client Controller
- ✅ `createClient` - Registrar cliente (nombre único por usuario)
- ✅ `getClientes` - Obtener todos los clientes
- ✅ `updateCliente` - Editar datos del cliente
- ✅ `deleteCliente` - Eliminar cliente

### 🏢 Proveedor Controller
- ✅ `createProveedor` - Registrar con datos bancarios y comerciales
- ✅ `getProveedores` - Listar todos los proveedores
- ✅ `updateProveedor` - Editar cualquier dato
- ✅ `deleteProveedor` - Eliminar proveedor

### 📦 Product Controller
- ✅ `createProduct` - Crear producto con hasta 5 imágenes
- ✅ `getAllProducts` - Listar con URLs de imágenes
- ✅ `getProductById` - Detalles completos
- ✅ `updateProduct` - Editar campos e imágenes
- ✅ `deleteProduct` - Eliminar producto

### 📉 Egreso Controller
- ✅ `createEgreso` - Registrar egreso y actualizar inventario
- ✅ `getEgresos` - Listar todos los egresos
- ✅ `updateEgreso` - Actualizar y ajustar inventario
- ✅ `deleteEgreso` - Eliminar y revertir stock

## 🖼️ Uploads e Imágenes

### Configuración de Multer
- **Directorio:** `/uploads`
- **Límite:** 5 imágenes por producto
- **Formatos:** JPG, PNG, GIF
- **Tamaño máximo:** 5MB por imagen

### URLs de acceso
```
http://localhost:3000/uploads/imagen-producto.jpg
```

### Estructura de archivos
```
uploads/
├── productos/
│   ├── user-1/
│   │   ├── producto-123/
│   │   │   ├── imagen1.jpg
│   │   │   └── imagen2.png
│   │   └── ...
│   └── ...
└── ...
```

## 🔒 Middleware de Seguridad

### `verificarToken`
- Valida JWT en el header `Authorization`
- Adjunta datos del usuario a `req.usuario`
- Protege todas las rutas privadas

### Ejemplo de uso
```javascript
// Ruta protegida
router.get('/productos', verificarToken, productController.getAllProducts);
```

## 🗄️ Base de Datos

### Modelos principales
- **User** - Usuarios del sistema
- **Category** - Categorías de productos
- **Product** - Productos del inventario
- **Client** - Clientes
- **Proveedor** - Proveedores
- **Egreso** - Registro de egresos

### Relaciones
- Todos los modelos están relacionados por `usuarioid`
- Separación completa de datos por usuario
- Integridad referencial con foreign keys

<div align="center">
  <p>Hecho con ❤️ por el equipo de Lumxis</p>
  <p>⭐ ¡No olvides dar una estrella si te gustó el proyecto!</p>
</div>
