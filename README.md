# Estadísticas de Recolección y Captura · Asuntos Públicos

Plataforma web para revisar el desembarque artesanal y la recolección de orilla de pescadores:
- Asuntos Públicos Norte: Antofagasta y Mejillones.
- Asuntos Públicos Los Pelambres: Los Vilos y Canela.

Funciones principales:
- Inicio de sesión con usuario y contraseña, y creación de cuentas que un administrador aprueba.
- Dos niveles de usuario: Administrador y Visualizador.
- Dashboard con filtros y con un selector para ver toneladas totales o promedios.
- Calculadora de negociación.
- Carga de Excel para actualizar los datos.

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La plataforma completa (pantallas, gráficos, filtros, lectura del Excel). |
| `api/` | Funciones del servidor: inicio de sesión, usuarios, datos e historial de cargas. |
| `lib/core.js` | Código compartido por las funciones: contraseñas, sesión y acceso a la base. |
| `supabase/schema.sql` | Crea las tablas de la base de datos. |
| `vercel.json` | Configuración y cabeceras de seguridad para Vercel. |
| `server.js` | Servidor para hostings con Node distintos de Vercel (Render, Railway, VPS). |
| `tools/hash.js` | Genera el hash de una contraseña para restablecerla a mano. |
| `.env.example` | Lista de variables de configuración. |

La seguridad se aplica en el servidor:
- Las contraseñas se guardan cifradas con scrypt, nunca en texto.
- La sesión vive en una cookie firmada a la que el navegador no tiene acceso.
- Un Visualizador no puede modificar datos ni administrar usuarios, aunque intente llamar directamente a la API.
- Las restricciones por comuna y la opción de ocultar nombres se aplican antes de enviar los datos al navegador.

## Publicar en Vercel (unos 15 minutos)

### 1. Crear la base de datos en Supabase (gratis)
1. Entra a https://supabase.com y crea un proyecto. Elige la región São Paulo, que es la más cercana a Chile.
2. Abre **SQL Editor > New query**, pega todo el contenido de `supabase/schema.sql` y presiona **Run**.
3. Ve a **Project Settings > API** y copia:
   - **Project URL**, que irá en `SUPABASE_URL`.
   - La clave **service_role**, que irá en `SUPABASE_SERVICE_ROLE_KEY`. Es secreta: nunca la pongas en `index.html` ni la compartas.

### 2. Subir el código a GitHub
Crea un repositorio **privado** y sube esta carpeta completa. No subas archivos `.env` ni el Excel; el `.gitignore` ya los excluye.

### 3. Crear el proyecto en Vercel
1. En https://vercel.com elige **Add New > Project** e importa el repositorio.
2. En **Framework Preset** elige **Other**. No hace falta comando de compilación.
3. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | La Project URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | La clave service_role |
| `SESSION_SECRET` | Un texto largo y aleatorio (ver abajo) |
| `ADMIN_USER` | `ivillalobos` |
| `ADMIN_PASSWORD` | La contraseña del administrador |

Para generar `SESSION_SECRET`, en una terminal con Node escribe:
`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

4. Presiona **Deploy**.

### 4. Primer ingreso
1. Abre la dirección que te da Vercel e inicia sesión con `ADMIN_USER` y `ADMIN_PASSWORD`. El administrador se crea solo en ese momento.
2. Como aún no hay datos, la plataforma te pedirá subir el Excel. Usa el archivo con la hoja **DatosPesca**.
3. Listo. Desde ahí:
   - Los demás crean su cuenta con **Crear cuenta**.
   - Tú las apruebas en la pestaña **Administración**.

Después del primer ingreso puedes borrar `ADMIN_PASSWORD` de Vercel: el administrador ya quedó guardado.

## Uso diario
- **Actualizar datos** (solo administradores): sube un Excel nuevo y elige **Agregar solo filas nuevas** o **Reemplazar todos los datos**. Todos los usuarios ven los datos nuevos al volver a entrar.
- **Administración** (solo administradores):
  - Aprobar, rechazar o suspender cuentas.
  - Asignar el nivel (Administrador o Visualizador).
  - Limitar las comunas que ve cada visualizador y ocultarle los nombres.
  - Permitirle exportar a CSV.
  - Revisar el historial de cargas.
- **Cierre de sesión**: con el botón **Cerrar sesión**, tras 30 minutos sin uso, o a las 8 horas.

### Restablecer una contraseña olvidada
1. En tu computador, dentro de esta carpeta, ejecuta: `npm run hash -- "NuevaContraseña"`.
2. En Supabase, abre **Table editor > usuarios**, busca al usuario y pega el resultado en la columna **hash**.

## Otros hostings
- **Render, Railway, Fly.io o un servidor propio con Node 18 o superior:**
  - Comando de inicio: `npm start` (usa `server.js`).
  - Carga las mismas variables de entorno.
  - Usa HTTPS en producción.
- **Netlify:** las funciones de `api/` están escritas para Vercel. En Netlify es más simple usar Render.

## Probar en tu computador
1. Copia `.env.example` como `.env` y completa los valores.
2. Agrega `COOKIE_INSECURE=1` para poder usar http://localhost sin HTTPS.
3. Ejecuta `npm start` y abre http://localhost:3000.
