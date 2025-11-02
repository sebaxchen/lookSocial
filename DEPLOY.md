# 🚀 Guía de Deploy para Netlify

## Configuración del Proyecto

Este proyecto está configurado para deploy automático en Netlify con las siguientes características:

### 📁 Archivos de Configuración

- **`netlify.toml`**: Configuración principal de Netlify
- **`_redirects`**: Redirecciones para SPA
- **`public/_headers`**: Headers de seguridad y caché

### 🔧 Scripts de Build

```bash
# Build de producción (recomendado para Netlify)
npm run build

# Build de desarrollo
npm run build:dev

# Preview del build de producción
npm run preview
```

### ⚙️ Configuración de Netlify

#### Opción 1: Deploy Automático desde GitHub
1. Conecta tu repositorio de GitHub a Netlify
2. Netlify detectará automáticamente la configuración del `netlify.toml`
3. El deploy se ejecutará automáticamente en cada push a la rama `main`

#### Opción 2: Deploy Manual
1. Ejecuta `npm run build` localmente
2. Sube la carpeta `dist/learning-center/browser` a Netlify

### 🌐 Variables de Entorno

Si necesitas configurar variables de entorno en Netlify:

1. Ve a **Site settings** > **Environment variables**
2. Agrega las variables necesarias:
   - `NODE_ENV`: `production`
   - `NODE_VERSION`: `18`

### 📊 Optimizaciones Incluidas

- ✅ **Compresión gzip** automática
- ✅ **Caché optimizado** para archivos estáticos
- ✅ **Headers de seguridad** configurados
- ✅ **Redirecciones SPA** para Angular Router
- ✅ **Build optimizado** para producción
- ✅ **Tree shaking** habilitado
- ✅ **Minificación** de CSS y JS

### 🔍 Troubleshooting

#### Error: "Cannot find module"
- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm install` antes del build

#### Error: "Build failed"
- Revisa los logs de Netlify
- Verifica que el comando de build sea correcto
- Asegúrate de que la versión de Node.js sea compatible

#### Error: "Page not found" en rutas
- Verifica que el archivo `_redirects` esté en la raíz del proyecto
- Asegúrate de que las redirecciones estén configuradas correctamente

### 📱 Características del Deploy

- **URL**: Se generará automáticamente por Netlify
- **HTTPS**: Habilitado por defecto
- **CDN**: Distribución global automática
- **SSL**: Certificado automático
- **Custom Domain**: Configurable en Netlify

### 🎯 Próximos Pasos

1. **Conecta el repositorio** a Netlify
2. **Configura el dominio** personalizado (opcional)
3. **Configura variables de entorno** si es necesario
4. **Haz push** a la rama `main` para deploy automático

¡El proyecto está listo para deploy en Netlify! 🎉

---

## 🌐 Deploy en GitHub Pages

El proyecto también está configurado para deploy automático en GitHub Pages.

### 📁 Archivos de Configuración

- **`.github/workflows/deploy.yml`**: Workflow de GitHub Actions para deploy automático
- **`angular.json`**: Configuración `githubPages` con `baseHref` configurado

### ⚙️ Configuración Inicial

1. **Habilita GitHub Pages en tu repositorio:**
   - Ve a **Settings** > **Pages** en tu repositorio de GitHub
   - En **Source**, selecciona **GitHub Actions**
   - Guarda los cambios

2. **El deploy se ejecutará automáticamente** cuando hagas push a la rama `main`

### 🔧 Scripts de Build

```bash
# Build específico para GitHub Pages
npm run build:gh-pages

# Este script:
# 1. Construye la aplicación con baseHref configurado
# 2. Crea el archivo 404.html necesario para SPA
```

### 📊 Características del Deploy

- ✅ **Deploy automático** en cada push a `main`
- ✅ **baseHref configurado** para `/Design-thinking-web/`
- ✅ **Archivo 404.html** creado automáticamente para soportar rutas de Angular
- ✅ **Build optimizado** para producción
- ✅ **Node.js 20** en el workflow

### 🔍 Configuración del Repositorio

**IMPORTANTE**: Si tu repositorio tiene un nombre diferente a `Design-thinking-web`, debes actualizar:

1. **`angular.json`**: Cambia el `baseHref` en la configuración `githubPages`
2. **`.github/workflows/deploy.yml`**: No necesita cambios (se adapta automáticamente)

### 📝 URL del Deploy

La aplicación estará disponible en:
```
https://[TU_USUARIO].github.io/Design-thinking-web/
```

### 🔄 Flujo de Deploy

1. Haces push a la rama `main`
2. GitHub Actions detecta el cambio
3. Ejecuta el workflow de build y deploy
4. La aplicación se publica automáticamente en GitHub Pages

### 🐛 Troubleshooting

#### Error: "Workflow failed"
- Verifica que GitHub Pages esté habilitado en la configuración del repositorio
- Revisa los logs del workflow en la pestaña **Actions**
- Asegúrate de que el repositorio tenga permisos de Pages habilitados

#### Error: "Deployment request failed due to in progress deployment"
Este error ocurre cuando hay un deployment anterior aún en progreso. Soluciones:

**Opción 1: Esperar** (Recomendado)
- Espera a que el deployment anterior termine (puede tardar unos minutos)
- Luego haz un nuevo push o re-ejecuta el workflow

**Opción 2: Cancelar manualmente**
1. Ve a **Settings** > **Pages** en tu repositorio
2. Busca el deployment en progreso
3. Cancélalo manualmente si es posible
4. Luego re-ejecuta el workflow desde la pestaña **Actions**

**Opción 3: Forzar nuevo deployment**
1. Haz un commit vacío para disparar un nuevo workflow:
   ```bash
   git commit --allow-empty -m "Force new deployment"
   git push origin main
   ```

**Nota:** El workflow está configurado con `cancel-in-progress: true` para cancelar automáticamente deployments anteriores en futuras ejecuciones.

#### Error: "404 en rutas de Angular"
- Verifica que el archivo `404.html` se haya creado correctamente
- Asegúrate de que el `baseHref` en `angular.json` coincida con el nombre del repositorio

#### Las rutas no funcionan
- GitHub Pages requiere el archivo `404.html` para manejar rutas de SPA
- El workflow crea este archivo automáticamente
- Si persiste, verifica que el `baseHref` sea correcto

¡El proyecto está listo para deploy en GitHub Pages! 🎉