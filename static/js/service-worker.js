/* ===========================================================
 * docsify sw.js
 * ===========================================================
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 * Register service worker.
 * ========================================================== */
const CACHE_VERSION = 'v2';
const RUNTIME = `docsify-${CACHE_VERSION}`;
const HOSTNAME_WHITELIST = [
  self.location.hostname,
  'fonts.gstatic.com',
  'fonts.googleapis.com',
  'cdn.jsdelivr.net'
]
const NETWORK_TIMEOUT_MS = 500

// The Util Function to hack URLs of intercepted requests
const getFixedUrl = (req) => {
  var now = Date.now()
  var url = new URL(req.url)

  // 1. fixed http URL
  // Just keep syncing with location.protocol
  // fetch(httpURL) belongs to active mixed content.
  // And fetch(httpRequest) is not supported yet.
  url.protocol = self.location.protocol

  // 2. add query for caching-busting.
  // Github Pages served with Cache-Control: max-age=600
  // max-age on mutable content is error-prone, with SW life of bugs can even extend.
  // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
  // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
  if (url.hostname === self.location.hostname) {
    url.search += (url.search ? '&' : '?') + 'cache-bust=' + now
  }
  return url.href
}

/**
 *  @Lifecycle Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

const reminders = {}; // Objeto para almacenar los recordatorios programados

self.addEventListener('message', function(event) {
  const data = event.data;
  if (data.type === 'SCHEDULE_NOTIFICATION') {
    const id = data.id; // Identificador único para el recordatorio
    const message = data.message;
    const time = data.time;

    // Obtén la hora programada
    const scheduledTime = parseTime(time);

    const showNotification = () => {
      self.registration.showNotification('El Cambio Exacto', {
        title: 'El Cambio Exacto',
        body: message,
        icon: '/img/icon1_3_mini.png',
        badge: '/img/icon1_3_mini.png'
      });
    };
    // Calcula el tiempo hasta la primera notificación
    let timeUntilFirstNotification = scheduledTime - new Date();
    if (timeUntilFirstNotification < 0) {
      // Si la hora programada ya pasó, programarla para mañana
      timeUntilFirstNotification += 24 * 60 * 60 * 1000; // 24 horas
    }

    // Programa la primera notificación
    setTimeout(function() {
      showNotification(message);
      // Programa notificaciones diarias a partir de este momento
      const interval = setInterval(function() {
        showNotification(message);
      }, 24 * 60 * 60 * 1000); // 24 horas
      
      // Almacena el recordatorio y su intervalo en el objeto de recordatorios
      reminders[id] = { interval, message, time };
    }, timeUntilFirstNotification);
  } else if (data.type === 'CHANGE_NOTIFICATION_TIME') {
    const id = data.id; // Identificador único del recordatorio
    const newTime = data.newTime;
    
    // Limpia el intervalo existente del recordatorio
    clearInterval(reminders[id].interval);
    // Reprograma la notificación con la nueva hora
    self.postMessage({ type: 'SCHEDULE_NOTIFICATION', id, message: reminders[id].message, time: newTime });
  } else if (data.type === 'SCHEDULE_FREQUENT_NOTIFICATION'){
    console.log("Recordatorios de Agua");
  }
});

function parseTime(time) {
  const [hour, minute, second] = time.split(':');
  const scheduledTime = new Date();
  scheduledTime.setHours(parseInt(hour, 10));
  scheduledTime.setMinutes(parseInt(minute, 10));
  scheduledTime.setSeconds(parseInt(second, 10));
  return scheduledTime;
}


/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *
 *  void respondWith(Promise<Response> r)
 */
self.addEventListener('fetch', event => {
  // Skip some of cross-origin requests, like those for Google Analytics.
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
    // Stale-while-revalidate
    // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
    // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
    const cached = caches.match(event.request)
    const fixedUrl = getFixedUrl(event.request)
    const fetched = fetch(fixedUrl, { cache: 'no-store' })
    const fetchedCopy = fetched.then(resp => resp.clone())

    // Call respondWith() with whatever we get first.
    // If the fetch fails (e.g disconnected), wait for the cache.
    // If there’s nothing in cache, wait for the fetch.
    // If neither yields a response, return offline pages.

    // Updated 2/7/2023 by @zteutsch. Switched from pure race between cache and network to a half second (500 ms) timeout
    // before going to cache. All fallbacks should still work and cache will be updated in the background.

    const delayCacheResponse = new Promise((resolve) => {
      setTimeout(resolve, NETWORK_TIMEOUT_MS, cached);
    })

    event.respondWith(
      Promise.race([fetched.catch(_ => cached), delayCacheResponse])
        .then(resp => resp || fetched)
        .catch(_ => { /* eat any errors */ })
    )

    // Update the cache with the version we fetched (only for ok status)
    event.waitUntil(
      Promise.all([fetchedCopy, caches.open(RUNTIME)])
        .then(([response, cache]) => response.ok && cache.put(event.request, response))
        .catch(_ => { /* eat any errors */ })
    )
  }
})