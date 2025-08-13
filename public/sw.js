const CACHE_NAME = "sofacover-pro-v1"
const urlsToCache = [
  "/",
  "/products",
  "/collections",
  "/about",
  "/contact",
  "/offline",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/fonts/inter-var.woff2",
  "/images/hero-sofa.webp",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === "document") {
            return caches.match("/offline")
          }
        })
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Background sync for offline orders
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-orders") {
    event.waitUntil(syncOfflineOrders())
  }
})

async function syncOfflineOrders() {
  try {
    const offlineOrders = await getOfflineOrders()
    for (const order of offlineOrders) {
      await submitOrder(order)
      await removeOfflineOrder(order.id)
    }
  } catch (error) {
    console.error("Failed to sync offline orders:", error)
  }
}

// Declare the functions that were previously undeclared
async function getOfflineOrders() {
  // Implementation for getting offline orders
  return []
}

async function submitOrder(order) {
  // Implementation for submitting an order
}

async function removeOfflineOrder(orderId) {
  // Implementation for removing an offline order
}

// Push notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New notification from SofaCover Pro",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "2",
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/icons/checkmark.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/xmark.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("SofaCover Pro", options))
})

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/products"))
  }
})
