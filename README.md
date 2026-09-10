# Invitación XV Años — Dairelys

Invitación virtual de 15 años. Sitio estático (HTML + CSS + JS, sin build) publicado con GitHub Pages.

**Sitio:** https://melkycesar.github.io/invitacion-dairelys-xv/

## Estructura

```
index.html      todo el maquetado y los estilos
app.js          datos de la fiesta + animaciones + formulario
assets/         imágenes (WebP) y SVG
```

## Cómo cambiar los datos de la fiesta

Abre `app.js` y edita el bloque `CONFIG` de arriba: nombre, fecha, hora, lugar,
dirección, enlaces de Maps/Waze/WhatsApp y código de vestimenta.

Los mismos textos están escritos también en `index.html` (en los elementos con
`data-txt="..."`) como respaldo por si JavaScript no carga. Si cambias un texto
en `CONFIG`, conviene cambiarlo también ahí para que coincidan.

Al hacer `git push` a `main`, GitHub Pages republica el sitio en 1–2 minutos.

## Pendientes

- [ ] Fecha y hora reales (`fechaLabel`, `horaLabel`, `fechaISO`)
- [x] Nombre y dirección de la villa
- [x] URL definitiva de Google Maps y Waze (pin en 19.7462368, -70.4644852)
- [ ] Link real del grupo de WhatsApp
- [x] Conectar el formulario de confirmación a Google Sheets

### Conectar el formulario a Google Sheets

1. Crea una hoja de cálculo en Google Sheets con las columnas `fecha`, `nombre`, `telefono`.
2. Extensiones → Apps Script, y pega un `doPost(e)` que agregue una fila con
   `e.parameter.nombre`, `e.parameter.telefono` y `e.parameter.fecha`.
3. Implementar → Nueva implementación → Aplicación web, con acceso "Cualquier persona".
4. Copia la URL del Web App y pégala en `RSVP_ENDPOINT`, en `app.js`.

El formulario ya maneja los estados de envío, éxito y error. Mientras
`RSVP_ENDPOINT` esté vacío, solo muestra el mensaje de agradecimiento.

## Origen del diseño

Diseñado en Claude Design. El handoff original (prototipo `.dc.html`, README de
especificación y assets sin optimizar) está fuera de este repositorio, en
`CUMPLE DAIRELIS/De Claude Design para Claude Code`. Este repo es la
reconstrucción de ese diseño como sitio estático; las imágenes se convirtieron
a WebP (12 MB → 0.9 MB).
