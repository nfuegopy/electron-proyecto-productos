# Electron Proyecto Productos

## Descripción

**Electron Proyecto Productos** es una aplicación de escritorio desarrollada con Electron.js para administrar productos en un catálogo. Permite a los administradores iniciar sesión, cargar nuevos productos (con campos como nombre, tipo de maquinaria, marca, movido a, modelo, precio, moneda, características e imagen), listar productos existentes, editarlos y eliminarlos. La aplicación utiliza Firebase como backend para autenticación, almacenamiento de datos (Firestore) e imágenes (Storage). Incluye un diseño minimalista e intuitivo, con opciones como "Recordar usuario" en el login para una mejor experiencia.

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado lo siguiente:

- **Node.js** (versión 22.11.0 o superior): [Descargar Node.js](https://nodejs.org/)
- **Git**: Para clonar el repositorio. [Descargar Git](https://git-scm.com/)
- Una cuenta de Firebase y un proyecto configurado con Authentication, Firestore y Storage.

## Instrucciones para Descargar el Proyecto

1. Clona el repositorio desde GitHub:
   ```bash
   git clone https://github.com/nfuegopy/electron-proyecto-productos.git
   ```
2. Entra al directorio del proyecto:
   ```bash
   cd electron-proyecto-productos
   ```

## Configuración del Entorno

1. **Instala las dependencias**:
   Ejecuta el siguiente comando para instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

2. **Configura las credenciales de Firebase**:
   - Crea un archivo `.env` en el directorio raíz del proyecto.
   - Agrega las credenciales de tu proyecto Firebase (puedes obtenerlas desde Firebase Console > Project Settings):
     ```
     FIREBASE_API_KEY=tu-api-key
     FIREBASE_AUTH_DOMAIN=tu-auth-domain
     FIREBASE_PROJECT_ID=tu-project-id
     FIREBASE_STORAGE_BUCKET=tu-storage-bucket
     FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
     FIREBASE_APP_ID=tu-app-id
     FIREBASE_MEASUREMENT_ID=tu-measurement-id
     ```

3. **Configura Firebase Authentication**:
   - Asegúrate de que el método de autenticación Email/Password esté habilitado en Firebase (Authentication > Sign-in method).
   - Crea un usuario administrador en Firebase Authentication:
     - Correo: `admin@test.com`
     - Contraseña: `admin123`
   - Asegúrate de que el usuario tenga un documento en la colección `users` de Firestore con el rol `"admin"`:
     ```json
     {
       "email": "admin@test.com",
       "role": "admin"
     }
     ```

## Instrucciones para Ejecutar el Proyecto

1. Inicia la aplicación con el siguiente comando:
   ```bash
   npm start
   ```
2. Se abrirá una ventana de la aplicación Electron.
3. Inicia sesión con las credenciales de administrador:
   - **Correo**: `admin@test.com`
   - **Contraseña**: `admin123`
4. Una vez autenticado, podrás cargar, listar, editar y eliminar productos desde el dashboard.

## Notas Adicionales

- **Seguridad**: Actualmente, cualquier usuario autenticado puede subir imágenes y eliminar productos. En producción, se recomienda implementar validación de roles en Firebase Storage para restringir estas operaciones a administradores.
- **Dependencias**: El proyecto utiliza Electron.js, Firebase y Bootstrap. Asegúrate de tener todas las dependencias instaladas (`npm install`).
- **Funcionalidad de "Recordar usuario"**: El login incluye una opción para memorizar las credenciales del usuario, autocompletándolas al iniciar la aplicación.
- **Soporte**: Si encuentras problemas, revisa la consola de Electron para ver los logs de error. Puedes abrir la consola ejecutando `npm start -- --enable-logging`.

---

**Autor**: Antonio Barrios  
**Licencia**: ISC