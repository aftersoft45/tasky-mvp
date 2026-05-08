Tasky es una plataforma de gestión de proyectos diseñada para optimizar tu flujo de trabajo. Esta guía te ayudará a configurar el entorno de desarrollo y levantar la aplicación rápidamente utilizando Docker.

##  Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:
* [Node.js y npm](https://nodejs.org/)
* [Docker](https://www.docker.com/) y Docker Compose


---

##  Pasos para la Instalación

### Paso 1: Instalar dependencias locales
Primero, necesitamos instalar las dependencias del proyecto. Esto también se encargará de instalar las herramientas de Prisma necesarias para leer tu base de datos.
Abre tu terminal en la raíz del proyecto y ejecuta:

```bash
npm install
Paso 2: Configurar las Variables de Entorno
La aplicación requiere ciertas variables de entorno para conectarse a la base de datos y manejar las sesiones de usuario.

Busca el archivo .env.example en la raíz del proyecto.

Renómbralo a .env

Ábrelo y asigna los valores correspondientes a las credenciales: solicitarlas a Diego Esparza Tech Lead   por correo: motokrat0z@gmail.com

Fragmento de código
# URL de conexión a tu base de datos PostgreSQL
DATABASE_URL="tu_cadena_de_conexion_aqui"

# URL base de tu aplicación (para desarrollo local)
NEXTAUTH_URL="http://localhost:3000"

# Credenciales de Google para el inicio de sesión
GOOGLE_CLIENT_ID="tu_google_client_id_aqui"
GOOGLE_CLIENT_SECRET="tu_google_client_secret_aqui"

Paso 3: Montar la aplicación en Docker
Una vez que el archivo .env esté configurado correctamente con tus credenciales, procede a construir y levantar los contenedores de Docker. Ejecuta el siguiente comando:

Bash
docker compose up --build
Nota: El parámetro --build asegura que Docker reconstruya la imagen con los últimos cambios en tu código y tu esquema de base de datos.

 Navegación en la Aplicación
Una vez que la terminal indique que los contenedores están en ejecución y el servidor está listo, puedes comenzar a usar la aplicación:

Abre tu navegador web.

Dirígete a http://localhost:3000.

Al ingresar, serás recibido por la pantalla de inicio o el login. Podrás iniciar sesión utilizando tu cuenta de Google configurada en el Paso 2.

¡Listo! Ya puedes comenzar a crear tus espacios de trabajo, organizar tareas y gestionar tus proyectos dentro de Tasky.
