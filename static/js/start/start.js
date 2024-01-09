import { main_get_date_formatted, main_get_patient_data, sessionData, global_url, main_replace_decimals } from "../global.js";
// execute some code after the content has been inserted into the DOM
// Esperar a que el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Obtener el botón o enlace por su ID
  var startButton = document.getElementById('startButton');

  // Agregar un manejador de eventos al botón o enlace
  startButton.addEventListener('click', function() {
    // Realizar la solicitud htmx cuando se hace clic en el botón o enlace
    htmx.ajax('GET', '/start', '#the_segment').then(() => {
      function get_previous_days_portions() {
        var idPlan = main_get_patient_data('id_plan');
        var today = main_get_date_formatted();
        $.ajax({
          async: true,
          type: 'post',
          url: global_url + 'web_service_patients/get_previous_days_portions',
          data: { id_plan: idPlan, date_from: today, date_to: today },
          dataType: 'json',
          success: function(data) {
            var errors = data.errors;

            if (errors === false) {
              var dates = data.dates;
              var results = data.results;
              var total_extra_points_used = data.total_extra_points_used;
              var total_water_drinked = data.total_water_drinked;

              for (var e = 0; e < dates.length; e++) {
                var date_array = dates[e].date_array;
                var date_normal = dates[e].date_normal;
                var exercise = dates[e].exercise;

                var icon = '';
                if (exercise == 1) {
                  icon += '<i class="child large icon"></i>';
                }
                else {
                  icon += '<i class="male large icon"></i>';
                }
                var infos = results[date_array];
                var amount_accumulator = 0;
                var consumed_accumulator = 0;
                var score_accumulator = 0;
                var counter = 0;
                var extra_points_accumulator = 0;
                var total_water = 0;
                extra_points_accumulator = total_extra_points_used[date_array];
                extra_points_accumulator = parseFloat(extra_points_accumulator);
                extra_points_accumulator.toFixed(2);
                total_water = total_water_drinked[date_array];
                total_water = parseFloat(total_water);
                total_water.toFixed(2);
                var total_extra_points = data.total_extra_points[date_array];
                var total_extra_points_exercise = data.total_extra_points_exercise[date_array];

                for (var i = 0; i < infos.length; i++) {
                  var amount_with_exercise = infos[i].amount_with_exercise;
                  var amount_without_exercise = infos[i].amount_without_exercise;
                  var name_category = infos[i].name_category;
                  var consumed_total_amount = infos[i].consumed_total_amount;
                  consumed_accumulator = parseFloat(consumed_accumulator, 10) + parseFloat(consumed_total_amount, 10);

                  //extra_points_accumulator = parseFloat(extra_points_accumulator) + parseFloat(total_extra_points);

                  var to_consume;
                  if (exercise == 1) {
                    to_consume = amount_with_exercise;

                    amount_accumulator = parseFloat(amount_accumulator, 10) + parseFloat(amount_with_exercise, 10);


                  }
                  else {
                    to_consume = amount_without_exercise;

                    amount_accumulator = parseFloat(amount_accumulator, 10) + parseFloat(amount_without_exercise, 10);

                  }
                  var pendent = parseFloat(to_consume) - parseFloat(consumed_total_amount);
                  var pendent_s = main_replace_decimals(pendent);

                  var categories = {
                    'Lácteos': { color: 'blue', label: '' },
                    'Granos y cereales': { color: 'brown', label: '' },
                    'Verduras': { color: 'green', label: '' },
                    'Frutas': { color: 'red', label: '' },
                    'Carnes': { color: 'purple', label: '' },
                    'Grasas': { color: 'yellow', label: '' }
                  };

                  var category = categories[name_category];
                  var colorClass = category ? category.color + ' statistic' : '';
                  var labelClass = pendent < 0 ? 'negative' : '';

                  var row = '<div class="row centered"><div class="ui small statistic ' + colorClass + ' ' + labelClass + '">' +
                    '<div class="value">' + pendent_s + '</div>' +
                    '<div class="label">' + name_category + '</div>' + '</div>' + '</div>';
                  $('#penddings_div').append(row);

                }


                /* Añadidos puntos extra como renglon en tabla */
                var extra_points_show;

                if (exercise == 1) {
                  extra_points_show = parseFloat(total_extra_points_exercise, 10);
                }
                else {
                  extra_points_show = parseFloat(total_extra_points, 10);
                }

                var extra_points_remain = parseFloat(extra_points_show, 10) - parseFloat(extra_points_accumulator, 10);
                var row = '<div class="row centered"><div class="ui small statistic">' +
                  '<div class="value">' + extra_points_remain + '</div>' +
                  '<div class="label" style="color: black">' +
                  'Puntos extra' +
                  '</div>' +
                  '</div>' +
                  '</div>';

                $('#penddings_div').append(row);

              }

            }
            else {
              // main_show_message('Error(es)', errors);
            }
          },
          error: function(data) {
            // main_show_message('Error', 'Error de conexión.');
          }
        });
      }
      get_previous_days_portions();
    });
  });
});

