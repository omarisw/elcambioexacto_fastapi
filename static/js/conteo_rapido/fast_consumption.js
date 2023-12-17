import { sessionData, sessionDataStr, main_verify_session, main_logout } from "../global.js";

let idPlan;
let idPatient;

const app = {
  initialize() {
    this.bindEvents();
  },
  bindEvents() {
    document.addEventListener('DOMContentLoaded', this.onDeviceReady);
  },
  onDeviceReady() {
    document.addEventListener('backbutton', () => {
      main_back_key_down();
    });


    const check = main_verify_session();

    if (check === true) {
      // Asignamos los IDS
      idPlan = sessionData.id_plan;
      idPatient = sessionData.id;
    } else {
      main_logout();
      window.location.assign('/');
    }
  }
};

app.initialize();
document.addEventListener('htmx:afterSwap', function(event) {
  var rows = event.detail.elt.querySelectorAll('.clickable-row');
  rows.forEach(function(row) {
    row.addEventListener('click', function() {
      var selectElement = row.querySelector('.plan_consumption_portion_amount_sel2');
      var selectElement2 = row.querySelector('#bottonCircularLine');
      selectElement.style.display = '';  // Muestra el elemento
      selectElement2.style.display = '';  // Muestra el elemento
    });
  });
});
document.addEventListener('htmx:afterRequest', function(event) {
  // Verifica si la respuesta contiene un mensaje
  const response = event.detail.xhr.response
  const responseURL = event.detail.xhr.responseURL

  if (responseURL && responseURL.includes('portion_save')) {
    // Convertimos a JSON
    const msg = JSON.parse(response)
    // Muestra la alerta SweetAlert con el mensaje
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: msg['message'],
    });
  }
});

