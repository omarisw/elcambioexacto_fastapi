const config = {
  dev: {
    global_url: 'https://dev.elcambioexacto.com/index.php/',
    global_pure_url: 'https://dev.elcambioexacto.com/',
    global_pure_fast_url: 'https://appdev.elcambioexacto.com/',
    url_notify: 'http://158.69.112.35:7500',
  },
  production: {
    global_url: 'https://panel2.elcambioexacto.com/index.php/',
    global_pure_url: 'https://panel2.elcambioexacto.com/',
    global_pure_fast_url: 'https://app.elcambioexacto.com/',
    url_notify: 'http://158.69.112.35:7500',
  },
};

// Determina el entorno actual (por ejemplo, usando una variable de entorno)
const environment = 'dev';

// Selecciona la configuración adecuada
export const { global_url, global_pure_url, global_pure_fast_url, url_notify } = config[environment];


let global_place;
export const sessionDataStr = window.localStorage.getItem('patient_data');
export const sessionData = JSON.parse(sessionDataStr);

// Ocultar el elemento con id "notificaciones-pacientes-menu"
export const notificacionesMenu = document.querySelector('#notificaciones-pacientes-menu');
if (notificacionesMenu) {
  notificacionesMenu.style.display = 'none';
}
// Cierre sesión
export const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
  logoutLink.addEventListener('click', () => {
    main_logout();
  })
}
/* CIERRE DE SESION */

export function main_logout() {
  window.localStorage.clear();
}

// Agregar al menu de notificaciones el counter

if (sessionData && sessionData.id === "7") {
  // Obtener todas las notificaciones no leídas
  fetch(url_notify + '/cambios')
    .then(response => response.json())
    .then(data => {
      const unreadNotifications = data.filter(notification => !notification.leido);
      document.getElementById('counter_item').textContent = unreadNotifications.length;

      // Mostrar el menú de notificaciones
      const notificacionesMenu = document.getElementById('notificacionesMenu');
      notificacionesMenu.style.display = 'block';
      const notificacionesPacientesMenu = document.getElementById('notificaciones-pacientes-menu');
      notificacionesPacientesMenu.style.display = 'block';
    })
    .catch(error => console.error(error));
}


/* MUESTRA EL CUADRO MODAL CON MENSAJES */
export function main_show_message(title, message) {
  Swal.fire({
    title: title,
    text: message,
    heightAuto: false,
  });
}

/* MUESTRA EL CUADRO MODAL CON MENSAJES (VERDE) */
export function main_show_message_green(title, message) {
  Swal.fire({
    title: title,
    text: message,
    heightAuto: false,
    icon: 'success',
  });
}

/* MUESTRA EL CUADRO MODAL CON MENSAJES (ROJO) */
export function main_show_message_red(title, message) {
  Swal.fire({
    icon: 'error',
    iconColor: 'red',
    confirmButtonColor: 'teal',
    title: title,
    text: message,
    allowOutsideClick: false,
    heightAuto: false,
  });
}

/* OBTIENE EL COLOR DE LA FUENTE, SEGUN EL COLOR RECIBIDO */
export function main_font_color_get(hexcolor) {
  //return (parseInt(color, 16) > 0xffffff/2) ? '000000':'FFFFFF';

  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '000000' : 'FFFFFF';
}


/*
 * FUNCIONES PARA LOCALSTORAGE
 */



/* OBTIENE LA INFORMACION DEFINIDA DEL PACIENTE, USUARIO DE LA APLICACION */
export function main_get_patient_data(indexes) {
  var data_return;

  var array_indexes = indexes.split('|');

  var data = JSON.parse(window.localStorage.getItem('patient_data'));

  for (var e = 0; e < array_indexes.length; e++) {
    var data_index = data[array_indexes[e]];

    if (array_indexes.length == 1) {
      data_return = data_index;
    }
    else {
      data_return[array_indexes[e]] = data_index;
    }
  }

  return data_return;
}





/* OBTIENE LA FECHA ACTUAL DEL DISPOSITIVO */
export function main_get_date() {
  var today = new Date();

  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  return yyyy + '-' + mm + '-' + dd;
}

/* OBTIENE LA HORA ACTUAL DEL DISPOSITIVO */
export function main_get_time() {
  var today = new Date();

  var hh = today.getHours();
  var ii = today.getMinutes();

  if (hh < 10) {
    hh = '0' + hh;
  }

  if (ii < 10) {
    ii = '0' + ii;
  }

  return hh + ':' + ii + ':00';
}


/* OBTIENE LA FECHA ACTUAL DEL DISPOSITIVO */
export function main_get_date_formatted() {
  var today = new Date();

  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  return dd + '/' + mm + '/' + yyyy;
}

/* VERIFICA SI HAY DATOS DE SESION */
export function main_verify_session() {

  var data_return;

  var patient_data = JSON.parse(window.localStorage.getItem('patient_data'));

  if (!patient_data) {
    data_return = false;
  }
  else {
    var logged_in = patient_data.logged_in;

    if (logged_in !== true) {
      data_return = false;
    }
    else {
      data_return = true;
    }
  }

  return data_return;
}

// TODO: importante revsiar que se encuentre funcionando las notifiaciones
export async function main_set_notifications(notifications) {
  try {
    // Objeto de mapeo
    const mapeo = {
      time_breakfast: 'Es hora del Desayuno',
      time_snack_am: 'Es hora del Snack de la mañana',
      time_dinner: 'Es hora de la Cena',
      time_snack_pm: 'Es hora del Snack de la tarde',
      time_evening_meal: 'Es hora de la Cena',
      water: 'Es momento de tomar Agua'
    };

    if (Notification.permission === 'granted') {
      for (const key in notifications) {
        const time = notifications[key];
        if (time === 'on') {
          // Esta es una notificación de ejecución frecuente
          scheduleFrequentNotification(`${mapeo[key]}`);
        } else if (isValidTime(time)) {
          scheduleNotification(`${mapeo[key]}`, time);
        } else {
          console.log(`Hora no válida para ${key}: ${time}`);
        }
      }
    } else {
      console.log('Los permisos de notificación no se han otorgado.');
    }
  } catch (err) {
    console.log('Error requesting push notifications permission: ', err);
    alert("Reminder cannot be added because the app doesn't have permission");
  }
}

// Función para verificar si una hora es válida (en formato HH:MM:SS)
function isValidTime(time) {
  const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return timePattern.test(time);
}

// Función asincrónica para programar notificaciones
async function scheduleNotification(message, time) {
  try {
    // Obtener el registro del Service Worker existente
    const registration = await navigator.serviceWorker.getRegistration('js/service-worker.js');

    if (!registration) {
      console.error('Service Worker no encontrado.');
      return;
    }

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        console.error(event.data.error);
      }
    };

    // Enviar mensaje al Service Worker
    console.log("Registro del Service Worker obtenido correctamente.");
    registration.active.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      message: message,
      time: time,
    }, [messageChannel.port2]);
  } catch (error) {
    console.error('Error al obtener el Service Worker:', error);
  }
}

// Función para programar una notificación de ejecución frecuente en el Service Worker
async function scheduleFrequentNotification(message) {
  try {
    const registration = await navigator.serviceWorker.getRegistration('js/service-worker.js');

    if (!registration) {
      console.error('Service Worker no encontrado.');
      return;
    }

    // Enviar mensaje al Service Worker para notificación de ejecución frecuente
    registration.active.postMessage({
      type: 'SCHEDULE_FREQUENT_NOTIFICATION',
      message: message,
    });
  } catch (error) {
    console.error('Error al obtener el Service Worker:', error);
  }
}

/*
 * FUNCIONES SIEMPRE PRESENTES
 */


// Muestra la imagen por defecto del paciente, según su género
export async function main_set_gender_image() {
  let image;
  try {
    const photo = window.localStorage.getItem('photo_data');
    if (photo !== '' && photo !== null) {
      image = 'uploads/' + photo;
      // Verificamos si la URL de la imagen es accesible
      const response = await fetch(image);
      if (response.status !== 200) {
        // Limpia el valor de 'photo_data' en localStorage
        window.localStorage.setItem('photo_data', '');
      }
    } else {
      const gender = main_get_patient_data('gender');
      switch (gender) {
        case 'F':
          image = 'img/female_app.png';
          break;

        case 'M':
          image = 'img/male_app.png';
          break;

        default:
          image = 'img/unknown_app.png';
          break;
      }
    }
    // Actualiza la imagen en el elemento HTML
    $('#main_toolbar_image_img').attr('src', image);
  } catch (error) {
    console.error('Error en main_set_gender_image:', error);
  }
}




/* MUESTRA EL APODO DEL PACIENTE, SI HAY UNO, DE LO CONTRARIO MOSTRARA SU NOMBRE COMPLETO */
export function main_set_nickname() {
  var nickname = window.localStorage.getItem('nickname_data');

  var name;

  if (!nickname || nickname == '') {
    name = main_get_patient_data('fullname');
  }
  else {
    name = nickname;
  }

  $('#main_toolbar_fullname_patient_div').text(name);
}





/* TOMA EL COLOR DADO Y REGRESA UNA VERSION MAS CLARA DE ESTE */
export function main_lighten_darken_color(color, amt) {
  var usePound = false;

  if (color[0] == "#") {
    color = color.slice(1);
    usePound = true;
  }

  var num = parseInt(color, 16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  var b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  var g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}





/* REEMPLAZA LOS PUNTOS DECIMALES POR LAS FRACCIONES QUE CORRESPONDEN */
export function main_replace_decimals(value) {
  var value_s = value.toString();

  value_s = value_s.replace('.00', '');
  value_s = value_s.replace('.0', '');

  value_s = value_s.replace('0.50', '1/2');
  value_s = value_s.replace('.50', ' 1/2');
  value_s = value_s.replace('0.5', '1/2');
  value_s = value_s.replace('.5', ' 1/2');

  value_s = value_s.replace('0.25', '1/4');
  value_s = value_s.replace('.25', ' 1/4');

  return value_s;
}





/* BOTON backbutton DEL DISPOSITIVO */
export function main_back_key_down() {
  if (global_place == 'start') {
    navigator.app.exitApp();
  }
  else {
    window.location = 'start';
  }
}



/* OBTIENE LAS FRASES DEL DIA */
export function main_get_today_phrases() {
  $('#phrases_description_div').find('div').remove();

  var date_today = main_get_date();
  var time_today = main_get_time();

  var date_checked = window.localStorage.getItem('today_phrases_date');
  var id_array_checked = window.localStorage.getItem('today_phrases_array');

  if (!date_checked) {
    date_checked = '';
  }
  if (!id_array_checked) {
    id_array_checked = '';
  }

  $.ajax({
    async: true,
    type: 'post',
    url: global_url + 'web_service_patients/get_today_phrases',
    data: {
      date_today: date_today,
      time_today: time_today
    },
    dataType: 'json',
    success: function(data) {
      var errors = data.errors;

      if (errors === false) {
        var results = data.results;

        var header;

        if (results.length == 1) {
          header = 'El consejo exacto del día';
        } else {
          header = 'Los consejos exactos del día';
        }

        var alerts = [];

        for (var e = 0; e < results.length; e++) {
          var id = results[e].id;
          var description = results[e].description;
          var image = results[e].image;
          var time = results[e].time;

          var image_full = '';

          var fn = id_array_checked.indexOf(id + '-' + time);
          if ((date_today != date_checked) || fn == -1) {
            if (image != '') {
              image_full = '<img class="ui middle aligned image" src="' + global_pure_url + 'uploads/' + image + '" />';
            }

            alerts.push({
              title: '<h3>' + header + '</h3>',
              html: image_full + '<p>' + description + '</p>',
              focusConfirm: false,
              imageWidth: 400,
              imageHeight: 200
            });

            if (id_array_checked == '') {
              id_array_checked = id + '-' + time;
            } else {
              id_array_checked += '|' + id + '-' + time;
            }
          }
        }

        if (alerts.length > 0) {
          showSwalAlerts(alerts, 0, date_today, time_today, id_array_checked);
        }
      }
    },
    error: function() {
      main_show_message('Error', 'Error de conexión.');
    }
  });
}

function showSwalAlerts(alerts, index, date_today, time_today, id_array_checked) {
  if (index < alerts.length) {
    Swal.fire(alerts[index]).then(() => {
      showSwalAlerts(alerts, index + 1, date_today, time_today, id_array_checked);
    });

  } else {
    window.localStorage.setItem('today_phrases_date', date_today);
    window.localStorage.setItem('today_phrases_time', time_today);
    window.localStorage.setItem('today_phrases_array', id_array_checked);
  }
}

async function crearNotificacion() {
  try {
    full_name = ''
    if (sessionData && sessionData.full_name) {
      full_name = sessionData.full_name
    }
    const response = await fetch(url_notify + '/cambios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre_completo: full_name,
        mensaje: 'adicionó alimentos a su día',
        fecha_hora: new Date().toISOString(),
        leido: false
      })
    });
    if (!response.ok) {
      throw new Error('No se pudo crear la notificación');
    }
    const nuevaNotificacion = await response.json();
  } catch (error) {
    console.error(error);
  }
}
