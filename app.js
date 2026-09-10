/* =========================================================================
   Invitación XV Años — Dairelys
   =========================================================================

   ── PARA EDITAR LOS DATOS DE LA FIESTA, CAMBIA SOLO EL BLOQUE "CONFIG" ──

   Los mismos textos están escritos también dentro de index.html, para que la
   página se vea bien aunque JavaScript falle. Si cambias algo aquí y quieres
   que quede idéntico en ambos lados, busca el mismo texto en index.html
   (los elementos marcados con data-txt="...").
   ========================================================================= */

var CONFIG = {
  nombre: "Dairelys",
  tagline: "Una noche de neón, música y recuerdos nuevos.",

  // --- Evento (PENDIENTE: confirmar fecha y hora reales) ---
  fechaLabel: "Sábado 12 de diciembre, 2026",
  horaLabel: "8:00 PM",
  fechaISO: "2026-12-12T20:00:00",   // usado para el archivo de calendario
  duracionHoras: 6,

  // --- Lugar (PENDIENTE: nombre y dirección reales de la villa) ---
  lugarNombre: "Villa Las Palmas",
  lugarDireccion: "Carretera Sosúa–Cabarete, Puerto Plata",

  // --- Enlaces ---
  mapsUrl: "https://maps.app.goo.gl/WeR9bPg2GYFDGeC1A",   // PENDIENTE: URL definitiva
  wazeUrl: "",                                             // vacío = se genera solo
  whatsappUrl: "https://chat.whatsapp.com/ENLACE-PENDIENTE", // PENDIENTE: link real del grupo

  // --- Secciones ---
  mostrarVestimenta: true,
  vestimenta: "Todo blanco"
};

/* Endpoint del formulario de confirmación (Google Sheets + Apps Script).
   Mientras esté vacío, el formulario solo muestra el mensaje de gracias
   sin guardar nada. Para conectarlo: pega aquí la URL del Web App. */
var RSVP_ENDPOINT = "";


/* =========================================================================
   De aquí para abajo no hace falta tocar nada.
   ========================================================================= */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };

  // ---------------------------------------------------------------- Textos
  CONFIG.wazeUrl = CONFIG.wazeUrl ||
    "https://waze.com/ul?q=" + encodeURIComponent(CONFIG.lugarNombre + " " + CONFIG.lugarDireccion);

  Array.prototype.forEach.call(document.querySelectorAll("[data-txt]"), function (el) {
    var valor = CONFIG[el.getAttribute("data-txt")];
    if (typeof valor === "string" && valor) el.textContent = valor;
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-href]"), function (el) {
    var url = CONFIG[el.getAttribute("data-href")];
    if (url) el.setAttribute("href", url);
  });

  if (!CONFIG.mostrarVestimenta) {
    var vest = document.querySelector('[data-seccion="vestimenta"]');
    if (vest) vest.parentNode.removeChild(vest);
  }

  // ------------------------------------------------- Añadir al calendario
  function construirIcs() {
    var inicio = new Date(CONFIG.fechaISO);
    if (isNaN(inicio.getTime())) return null;
    var fin = new Date(inicio.getTime() + CONFIG.duracionHoras * 3600 * 1000);
    var fmt = function (d) { return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; };
    var esc = function (s) { return String(s).replace(/([,;\\])/g, "\\$1"); };

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//XV//ES",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@xv",
      "DTSTAMP:" + fmt(new Date()),
      "DTSTART:" + fmt(inicio),
      "DTEND:" + fmt(fin),
      "SUMMARY:XV Años de " + esc(CONFIG.nombre),
      "LOCATION:" + esc(CONFIG.lugarNombre + ", " + CONFIG.lugarDireccion),
      "DESCRIPTION:Celebración de los 15 años de " + esc(CONFIG.nombre),
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  var btnIcs = document.querySelector("[data-ics]");
  if (btnIcs) {
    var ics = construirIcs();
    if (!ics) {
      btnIcs.setAttribute("href", "#");
    } else if (window.Blob && window.URL && window.URL.createObjectURL) {
      // Blob: mejor compatibilidad que un data-URI, sobre todo en iOS.
      btnIcs.setAttribute("href", URL.createObjectURL(
        new Blob([ics], { type: "text/calendar;charset=utf-8" })
      ));
    } else {
      btnIcs.setAttribute("href", "data:text/calendar;charset=utf-8," + encodeURIComponent(ics));
    }
  }

  // ------------------------------------------------- Reveal on scroll
  var elementos = Array.prototype.slice.call(document.querySelectorAll("[data-rv]"));
  elementos.forEach(function (el, i) {
    el.style.transitionDelay = (Math.min(i, 4) * 90) + "ms";
  });

  var pendientes = elementos.slice();
  var revelar = function (el) { el.classList.add("is-visible"); };

  var revisar = function () {
    var doc = document.documentElement;
    var vh = window.innerHeight || doc.clientHeight;
    // Al llegar al final de la página ya no queda scroll para cruzar el
    // umbral, así que revelamos lo que falte (si no, el último párrafo
    // se quedaría invisible para siempre).
    var alFinal = (window.pageYOffset || doc.scrollTop) + vh >= doc.scrollHeight - 2;

    pendientes = pendientes.filter(function (el) {
      // Sin condición sobre r.bottom: lo que ya quedó por encima del viewport
      // (por un salto de ancla o un scroll rápido) también debe revelarse.
      if (alFinal || el.getBoundingClientRect().top < vh * 0.94) {
        revelar(el);
        return false;
      }
      return true;
    });
  };

  // Mecanismo principal: IntersectionObserver. Funciona aunque el navegador
  // no emita eventos de scroll (pasa en algunos webviews y con scroll
  // programático), que es el caso en el que la página se quedaría en blanco.
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        // isIntersecting = está entrando; top < 0 = ya quedó por encima.
        if (en.isIntersecting || en.boundingClientRect.top < 0) {
          revelar(en.target);
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    elementos.forEach(function (el) { io.observe(el); });
  }

  // Respaldos: el IntersectionObserver por sí solo no siempre revela lo que ya
  // está visible al cargar (pasó en el prototipo), así que además revisamos en
  // rAF los primeros 2.5 s, escuchamos scroll/resize y dejamos una red de
  // seguridad a 1.2 s.
  window.addEventListener("scroll", revisar, { passive: true, capture: true });
  document.addEventListener("scroll", revisar, { passive: true, capture: true });
  window.addEventListener("resize", revisar);
  window.addEventListener("load", revisar);

  requestAnimationFrame(function () { requestAnimationFrame(revisar); });

  var t0 = Date.now();
  (function tick() {
    revisar();
    if (Date.now() - t0 < 2500) requestAnimationFrame(tick);
  })();

  setTimeout(function () {
    elementos.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) revelar(el);
    });
  }, 1200);

  // ------------------------------------------------- Parallax del nombre
  var foto = document.querySelector("[data-parallax]");
  if (foto) {
    var caja = foto.parentElement;
    var moverParallax = function () {
      var r = caja.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var p = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
      foto.style.transform = "translate(-50%, calc(-50% + " + (p * 90).toFixed(1) + "px))";
    };
    window.addEventListener("scroll", moverParallax, { passive: true });
    document.addEventListener("scroll", moverParallax, { passive: true, capture: true });
    window.addEventListener("resize", moverParallax);
    moverParallax();
  }

  // ------------------------------------------------- Formulario RSVP
  var form = document.querySelector("[data-form]");
  var gracias = document.querySelector("[data-gracias]");
  var error = document.querySelector("[data-error]");

  if (form && gracias) {
    var boton = form.querySelector("button[type=submit]");
    var textoBoton = boton ? boton.textContent : "";

    var mostrarGracias = function (nombreCompleto) {
      var primero = String(nombreCompleto || "").trim().split(" ")[0] || "";
      gracias.textContent = "¡Gracias, " + primero + "! Nos vemos en la fiesta.";
      gracias.hidden = false;
      form.hidden = true;
    };

    var mostrarError = function () {
      if (!error) return;
      error.textContent = "No pudimos guardar tu confirmación. Revisa tu conexión e inténtalo otra vez.";
      error.hidden = false;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var datos = new FormData(form);
      var nombre = (datos.get("nombre") || "").toString();
      var telefono = (datos.get("telefono") || "").toString();

      if (error) error.hidden = true;

      // Sin backend todavía: se muestra el agradecimiento directamente.
      if (!RSVP_ENDPOINT) { mostrarGracias(nombre); return; }

      if (boton) { boton.disabled = true; boton.textContent = "Enviando…"; }

      var cuerpo = new URLSearchParams();
      cuerpo.append("nombre", nombre);
      cuerpo.append("telefono", telefono);
      cuerpo.append("fecha", new Date().toISOString());

      // no-cors evita el preflight que Apps Script no responde; a cambio
      // no podemos leer la respuesta, así que asumimos éxito si no falla la red.
      fetch(RSVP_ENDPOINT, { method: "POST", mode: "no-cors", body: cuerpo })
        .then(function () { mostrarGracias(nombre); })
        .catch(function () {
          mostrarError();
          if (boton) { boton.disabled = false; boton.textContent = textoBoton; }
        });
    });
  }
})();
