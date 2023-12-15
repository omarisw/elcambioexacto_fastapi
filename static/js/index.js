
// Archivo Global

import {
  main_back_key_down,
  main_verify_session,
  global_url,
  main_show_message,
  main_set_notifications,
  main_get_patient_data,
} from './global.js';

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
      pseudo_login();
    }
  }
};


app.initialize();


const loginButton = document.querySelector('#loginButton');

loginButton.addEventListener('click', login)

// Evitar el envío del formulario al presionar "Enter"
document.querySelector('#login_frm').addEventListener('submit', function(event) {
  event.preventDefault();
});

// Llamar a la función login al presionar "Enter" en el campo de usuario
document.querySelector('#username_txt').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    login();
  }
});

// Llamar a la función login al presionar "Enter" en el campo de contraseña
document.querySelector('#password_txt').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    login();
  }
});


/* INICIAR SESION */
async function login() {
  try {
    const response = await fetch(`${global_url}web_service_patients/login`, {
      method: 'post',
      body: new URLSearchParams(new FormData(document.querySelector('#login_frm'))),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();
    const { errors, patient } = data;

    if (errors !== false) {
      main_show_message('Alerta', errors);
    } else {
      const {
        id,
        username,
        password,
        fullname,
        gender,
        photo,
        nickname,
        logged_in,
        id_plan,
        date_start_plan,
        date_finish_plan,
        date_next_appointment_plan,
        time_next_appointment_plan,
        time_breakfast_plan_notification,
        time_snack_am_plan_notification,
        time_dinner_plan_notification,
        time_snack_pm_plan_notification,
        time_evening_meal_plan_notification
      } = patient;

      const session_data = {
        id,
        username,
        fullname,
        password,
        gender,
        logged_in,
        id_plan,
        date_start_plan,
        date_finish_plan,
        date_next_appointment_plan,
        time_next_appointment_plan
      };

      const notifications = {
        time_breakfast_plan_notification,
        time_snack_am_plan_notification,
        time_dinner_plan_notification,
        time_snack_pm_plan_notification,
        time_evening_meal_plan_notification
      };

      localStorage.setItem('patient_data', JSON.stringify(session_data));
      localStorage.setItem('notifications_data', JSON.stringify(notifications));
      localStorage.setItem('photo_data', photo);
      localStorage.setItem('nickname_data', nickname);

      main_set_notifications(
        time_breakfast_plan_notification,
        time_snack_am_plan_notification,
        time_dinner_plan_notification,
        time_snack_pm_plan_notification,
        time_evening_meal_plan_notification
      );

      window.location.assign('fast_consumption');
    }
  } catch (error) {
    main_show_message('Error', 'Error de conexión.');
  }
}

function pseudo_login() {

  const username = main_get_patient_data('username');
  const password = main_get_patient_data('password');

  document.querySelector('#username_txt').value = username;
  document.querySelector('#password_txt').value = password;

  login();
}
