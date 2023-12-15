$(document).on("click", "#plan_consumption_categories_modal_tbody tr", function() {
  // Verificamos si ya se creó la instancia de PerfectScrollbar
  if (!this.perfectScrollbarInitialized) {
    console.log("Pudimos entrar usando perfectscrollbar")
    var tbody = $("#plan_consumption_portions_modal_tbody");
    new PerfectScrollbar("#scrolling_plan_de_alimentos");
    this.perfectScrollbarInitialized = true; // Marcar como inicializado
  }
});

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

