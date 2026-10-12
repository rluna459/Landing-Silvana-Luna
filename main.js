/* ============================================================
   main.js — comportamiento de la landing (JavaScript vanilla)
   ============================================================ */
(function () {
  'use strict'; // Modo estricto: evita errores silenciosos

  /* ----------------------------------------------------------
     CONFIGURACIÓN: ÚNICO LUGAR PARA EDITAR LOS DATOS DE CONTACTO
     ---------------------------------------------------------- */
  const CONFIG = {
    // Número de WhatsApp en formato internacional, SOLO dígitos (sin +, espacios ni guiones).
    // Ejemplo para Argentina móvil: "5493875123456". Dejar "" mientras no esté definido.
    whatsappNumero: '5493875828650',
    // Email donde la profesional recibirá las consultas. Ejemplo: "contacto@dominio.com". Dejar "" si no está definido.
    emailDestino: 'silviluna832@gmail.com',
    // Asunto que llevará el correo
    asuntoEmail: 'Consulta fonoaudiológica desde la web'
  };

  /* ----------------------------------------------------------
     UTILIDADES PEQUEÑAS
     ---------------------------------------------------------- */
  const $ = (selector, parent = document) => parent.querySelector(selector); // Atajo: un elemento
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector)); // Atajo: varios elementos

  const numeroValido = () => /^\d{8,15}$/.test(CONFIG.whatsappNumero); // true si el número tiene entre 8 y 15 dígitos
  const emailValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor); // Comprueba el formato básico de un email

  /* ----------------------------------------------------------
     1) AÑO DINÁMICO DEL FOOTER
     ---------------------------------------------------------- */
  function iniciarAnio() {
    const anio = $('#anio'); // Busca el span del año
    if (anio) anio.textContent = new Date().getFullYear(); // Si existe, escribe el año actual
  }

  /* ----------------------------------------------------------
     2) CABECERA: sombra al hacer scroll
     ---------------------------------------------------------- */
  function iniciarCabecera() {
    const header = $('.site-header'); // Busca la cabecera
    if (!header) return; // Si no existe, termina sin error
    const actualizar = () => header.classList.toggle('is-scrolled', window.scrollY > 10); // Agrega/quita clase según el scroll
    actualizar(); // Aplica el estado inicial
    window.addEventListener('scroll', actualizar, { passive: true }); // Escucha el scroll sin bloquear el rendimiento
  }

  /* ----------------------------------------------------------
     3) MENÚ MÓVIL
     ---------------------------------------------------------- */
  function iniciarMenu() {
    const boton = $('#nav-toggle'); // Botón hamburguesa
    const menu = $('#menu-principal'); // Panel del menú
    if (!boton || !menu) return; // Si falta alguno, no hace nada

    const abrirCerrar = (abrir) => {
      menu.classList.toggle('is-open', abrir); // Muestra u oculta el panel
      boton.setAttribute('aria-expanded', String(abrir)); // Informa el estado a lectores de pantalla
      boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú'); // Actualiza la etiqueta
    };

    boton.addEventListener('click', () => abrirCerrar(!menu.classList.contains('is-open'))); // Alterna al hacer clic
    $$('a', menu).forEach((enlace) => enlace.addEventListener('click', () => abrirCerrar(false))); // Cierra al elegir un enlace
    document.addEventListener('keydown', (e) => { // Escucha el teclado
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { // Con Esc y menú abierto
        abrirCerrar(false); // Cierra el menú
        boton.focus(); // Devuelve el foco al botón
      }
    });
  }

  /* ----------------------------------------------------------
     4) ACORDEÓN DE PREGUNTAS FRECUENTES
     ---------------------------------------------------------- */
  function iniciarAcordeon() {
    const botones = $$('.acc-trigger'); // Todos los botones de pregunta
    botones.forEach((boton) => { // Recorre cada uno
      boton.addEventListener('click', () => { // Al hacer clic (o Enter/Espacio, que son clic en un button)
        const abierto = boton.getAttribute('aria-expanded') === 'true'; // ¿Estaba abierto?
        botones.forEach((otro) => cambiarPanel(otro, false)); // Cierra todos (solo uno abierto a la vez)
        if (!abierto) cambiarPanel(boton, true); // Abre el elegido si estaba cerrado
      });
    });
  }

  function cambiarPanel(boton, abrir) {
    const panel = document.getElementById(boton.getAttribute('aria-controls')); // Panel asociado por id
    if (!panel) return; // Si no existe, termina
    boton.setAttribute('aria-expanded', String(abrir)); // Actualiza accesibilidad
    panel.classList.toggle('is-open', abrir); // Anima la apertura con CSS
  }

  /* ----------------------------------------------------------
     5) ANIMACIÓN DE REVELADO AL HACER SCROLL
     ---------------------------------------------------------- */
  function iniciarRevelado() {
    const elementos = $$('.reveal'); // Elementos a animar
    if (!elementos.length) return; // Nada que hacer
    if (!('IntersectionObserver' in window)) { // Navegadores antiguos
      elementos.forEach((el) => el.classList.add('is-visible')); // Los muestra directamente
      return; // Termina
    }
    const observador = new IntersectionObserver((entradas) => { // Observa cuándo entran en pantalla
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) { // Si ya es visible
          entrada.target.classList.add('is-visible'); // Activa la animación
          observador.unobserve(entrada.target); // Deja de observarlo (se anima una sola vez)
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }); // Se activa cuando asoma el 12 %
    elementos.forEach((el) => observador.observe(el)); // Empieza a observar cada elemento
  }

  /* ----------------------------------------------------------
     6) ENLACES DIRECTOS DEL FOOTER (solo si hay datos reales)
     ---------------------------------------------------------- */
  function iniciarEnlacesDirectos() {
    const wa = $('#link-whatsapp'); // Enlace de WhatsApp del footer
    if (wa && numeroValido()) { // Solo si el número está configurado
      wa.href = 'https://wa.me/' + CONFIG.whatsappNumero; // URL oficial de WhatsApp
      wa.target = '_blank'; // Abre en pestaña nueva
      wa.rel = 'noopener'; // Seguridad
      wa.hidden = false; // Lo muestra
    }
    const mail = $('#link-email'); // Enlace de email del footer
    if (mail && emailValido(CONFIG.emailDestino)) { // Solo si el email es válido
      mail.href = 'mailto:' + CONFIG.emailDestino; // Enlace mailto
      mail.hidden = false; // Lo muestra
    }
  }

  /* ----------------------------------------------------------
     7) FORMULARIO: validación y envío por WhatsApp o email
     ---------------------------------------------------------- */
  function mostrarError(campo, mensaje) {
    const contenedor = campo.closest('.field'); // Contenedor del campo
    const error = $('#error-' + (campo.id === 'contacto-medio' ? 'contacto' : campo.id)); // Párrafo de error
    contenedor.classList.toggle('has-error', Boolean(mensaje)); // Marca el borde rojo
    campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false'); // Informa el error a lectores
    if (error) error.textContent = mensaje; // Escribe (o borra) el mensaje
  }

  function validar(form) {
    const nombre = form.elements.nombre; // Campo nombre
    const medio = form.elements.contacto; // Campo contacto
    let correcto = true; // Supone que todo está bien
    let primerError = null; // Para enfocar el primer campo con error

    if (nombre.value.trim().length < 2) { // Mínimo 2 letras
      mostrarError(nombre, 'Escribí tu nombre (al menos 2 letras).'); // Mensaje claro
      correcto = false; primerError = primerError || nombre; // Guarda el primero
    } else mostrarError(nombre, ''); // Limpia el error

    const valor = medio.value.trim(); // Texto del contacto
    const digitos = valor.replace(/\D/g, ''); // Solo los números
    const esTelefono = /^[\d\s()+-]+$/.test(valor) && digitos.length >= 8; // Teléfono: 8 o más dígitos
    if (!emailValido(valor) && !esTelefono) { // Ni email ni teléfono válidos
      mostrarError(medio, 'Ingresá un teléfono (con código de área) o un email válido.'); // Mensaje claro
      correcto = false; primerError = primerError || medio; // Guarda el primero
    } else mostrarError(medio, ''); // Limpia el error

    if (primerError) primerError.focus(); // Lleva el foco al primer error
    return correcto; // Devuelve el resultado
  }

  function armarMensaje(form) {
    const nombre = form.elements.nombre.value.trim(); // Nombre
    const contacto = form.elements.contacto.value.trim(); // Contacto
    const motivo = form.elements.motivo.value.trim(); // Motivo opcional
    let texto = 'Hola, soy ' + nombre + '. Quisiera consultar disponibilidad para un turno.'; // Saludo
    texto += '\nMi contacto: ' + contacto; // Dato de contacto
    if (motivo) texto += '\nMotivo general: ' + motivo; // Solo si lo escribió
    return texto; // Mensaje final (sin datos clínicos)
  }

  function informar(mensaje, esError) {
    const estado = $('#form-status'); // Zona de estado
    if (!estado) return; // Si no existe, termina
    estado.textContent = mensaje; // Muestra el mensaje
    estado.classList.toggle('is-error', Boolean(esError)); // Estilo de error
  }

  function enviarPorWhatsApp(texto) {
    if (!numeroValido()) { // Si no hay número real configurado
      informar('WhatsApp aún no está configurado: falta cargar el número real en js/main.js (CONFIG.whatsappNumero).', true); // Aviso claro
      return; // No genera enlaces falsos
    }
    const url = 'https://wa.me/' + CONFIG.whatsappNumero + '?text=' + encodeURIComponent(texto); // URL con mensaje codificado
    window.open(url, '_blank', 'noopener'); // Abre WhatsApp en otra pestaña
    informar('Se abrió WhatsApp con tu mensaje. Revisalo y enviálo si estás de acuerdo.', false); // El usuario decide enviar
  }

  function enviarPorEmail(texto) {
    if (!emailValido(CONFIG.emailDestino)) { // Si no hay email real configurado
      informar('El email aún no está configurado: falta cargar el correo real en js/main.js (CONFIG.emailDestino).', true); // Aviso claro
      return; // No genera enlaces falsos
    }
    const url = 'mailto:' + CONFIG.emailDestino + '?subject=' + encodeURIComponent(CONFIG.asuntoEmail) + '&body=' + encodeURIComponent(texto); // mailto codificado
    window.location.href = url; // Abre la app de correo con el borrador
    informar('Se abrió tu app de correo con el mensaje listo. Revisalo y enviálo si estás de acuerdo.', false); // El usuario decide enviar
  }

  function iniciarFormulario() {
    const form = $('#form-contacto'); // Formulario
    if (!form) return; // Si no existe, termina
    let canal = 'whatsapp'; // Canal elegido (por defecto WhatsApp)

    $$('button[type="submit"]', form).forEach((boton) => { // Recorre los botones de envío
      boton.addEventListener('click', () => { canal = boton.dataset.canal; }); // Recuerda cuál se presionó
    });

    form.addEventListener('submit', (e) => { // Al enviar el formulario
      e.preventDefault(); // Evita recargar la página (no hay servidor)
      informar('', false); // Limpia mensajes previos
      if (!validar(form)) return; // Si hay errores, no continúa
      const texto = armarMensaje(form); // Prepara el mensaje
      if (canal === 'email') enviarPorEmail(texto); // Rama email
      else enviarPorWhatsApp(texto); // Rama WhatsApp
    });

    form.addEventListener('input', (e) => { // Mientras escribe
      if (e.target.matches('input, textarea')) mostrarError(e.target, ''); // Borra el error de ese campo
    });
  }

  /* ----------------------------------------------------------
     ARRANQUE: ejecuta todo cuando el HTML ya está cargado
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    iniciarAnio(); // Año del footer
    iniciarCabecera(); // Sombra de cabecera
    iniciarMenu(); // Menú móvil
    iniciarAcordeon(); // Preguntas frecuentes
    iniciarRevelado(); // Animaciones al scroll
    iniciarEnlacesDirectos(); // Enlaces del footer
    iniciarFormulario(); // Formulario
  });
})(); // Fin de la función autoejecutable (evita variables globales)
