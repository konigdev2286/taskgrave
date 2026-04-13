"use client"

import { useEffect, useRef, useState } from "react"
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
}

const BRAZZAVILLE_CENTER = { lat: -4.2661, lng: 15.2832 }

const MAP_ID = "jarrive-tracking"

// Custom map style — dark blue/slate theme
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1a1f36" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1f36" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8899bb" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d3561" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1f36" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2563eb" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f8fafc" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4361ee" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#8899bb" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
]

type TrackingMapProps = {
  originAddress?: string
  destAddress?: string
  originLat?: number | null
  originLng?: number | null
  destLat?: number | null
  destLng?: number | null
  status?: string
}

export function TrackingMap({
  originAddress,
  destAddress,
  originLat,
  originLng,
  destLat,
  destLng,
  status,
}: TrackingMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  })

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(
    originLat && originLng ? { lat: originLat, lng: originLng } : null
  )
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(
    destLat && destLng ? { lat: destLat, lng: destLng } : null
  )
  const [geocoding, setGeocoding] = useState(false)
  const [activeInfo, setActiveInfo] = useState<"origin" | "dest" | null>(null)

  // Geocode addresses if no coordinates provided
  useEffect(() => {
    if (!isLoaded) return
    if (originLat && originLng && destLat && destLng) return

    const geocoder = new google.maps.Geocoder()
    setGeocoding(true)

    const geocodeAddress = (address: string): Promise<{ lat: number; lng: number } | null> =>
      new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            })
          } else {
            resolve(null)
          }
        })
      })

    async function doGeocode() {
      const [oCoords, dCoords] = await Promise.all([
        originAddress ? geocodeAddress(originAddress) : Promise.resolve(null),
        destAddress ? geocodeAddress(destAddress) : Promise.resolve(null),
      ])
      if (oCoords) setOriginCoords(oCoords)
      if (dCoords) setDestCoords(dCoords)
      setGeocoding(false)
    }

    doGeocode()
  }, [isLoaded, originAddress, destAddress, originLat, originLng, destLat, destLng])

  // Compute directions route once we have both coords
  useEffect(() => {
    if (!isLoaded || !originCoords || !destCoords) return

    const service = new google.maps.DirectionsService()
    service.route(
      {
        origin: originCoords,
        destination: destCoords,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result)
        }
      }
    )
  }, [isLoaded, originCoords, destCoords])

  // Determine truck position along route based on status
  const truckPosition = (() => {
    if (!directions || !directions.routes[0]) return null
    const path = directions.routes[0].overview_path
    const statusProgress: Record<string, number> = {
      pending:   0,
      accepted:  0.05,
      picked_up: 0.5,
      delivered: 1,
    }
    const prog = statusProgress[status || "pending"] ?? 0
    const idx = Math.floor(prog * (path.length - 1))
    return { lat: path[idx].lat(), lng: path[idx].lng() }
  })()

  const mapCenter = originCoords || BRAZZAVILLE_CENTER

  // No API key configured
  if (!apiKey || apiKey === "your-api-key") {
    return <NoApiKeyFallback originAddress={originAddress} destAddress={destAddress} />
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 rounded-3xl text-red-400 font-bold text-sm">
        Erreur de chargement de la carte
      </div>
    )
  }

  if (!isLoaded || geocoding) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-3xl gap-3">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
          {!isLoaded ? "Chargement de la carte..." : "Géolocalisation en cours..."}
        </p>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={mapCenter}
      zoom={12}
      options={{
        styles: MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {/* Route line */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#2563eb",
              strokeWeight: 5,
              strokeOpacity: 0.85,
            },
          }}
        />
      )}

      {/* Origin marker */}
      {originCoords && (
        <Marker
          position={originCoords}
          icon={{
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="#2563eb" stroke="white" stroke-width="3"/>
                <circle cx="18" cy="18" r="5" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 18),
          }}
          onClick={() => setActiveInfo("origin")}
        />
      )}

      {activeInfo === "origin" && originCoords && (
        <InfoWindow position={originCoords} onCloseClick={() => setActiveInfo(null)}>
          <div style={{ fontFamily: "system-ui", maxWidth: 180 }}>
            <p style={{ fontSize: 10, color: "#6b7280", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Départ</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{originAddress}</p>
          </div>
        </InfoWindow>
      )}

      {/* Destination marker */}
      {destCoords && (
        <Marker
          position={destCoords}
          icon={{
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
                <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 32 20 32S40 35 40 20C40 8.95 31.05 0 20 0z" fill="#f97316"/>
                <circle cx="20" cy="20" r="9" fill="white"/>
                <path d="M20 15l1.5 4.5H26l-3.8 2.8 1.5 4.5L20 24l-3.7 2.8 1.5-4.5L14 19.5h4.5z" fill="#f97316"/>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(40, 52),
            anchor: new google.maps.Point(20, 52),
          }}
          onClick={() => setActiveInfo("dest")}
        />
      )}

      {activeInfo === "dest" && destCoords && (
        <InfoWindow position={destCoords} onCloseClick={() => setActiveInfo(null)}>
          <div style={{ fontFamily: "system-ui", maxWidth: 180 }}>
            <p style={{ fontSize: 10, color: "#6b7280", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Destination</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{destAddress}</p>
          </div>
        </InfoWindow>
      )}

      {/* Animated truck marker */}
      {truckPosition && status !== "pending" && (
        <Marker
          position={truckPosition}
          icon={{
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" fill="#0f172a" stroke="#2563eb" stroke-width="2.5"/>
                <text x="24" y="30" text-anchor="middle" font-size="22">🛵</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(48, 48),
            anchor: new google.maps.Point(24, 24),
          }}
          zIndex={100}
        />
      )}
    </GoogleMap>
  )
}

// ──────────────────────────────────────────────
// Fallback when no API key is set
// ──────────────────────────────────────────────
function NoApiKeyFallback({ originAddress, destAddress }: { originAddress?: string; destAddress?: string }) {
  const query = encodeURIComponent(`${originAddress || ""} to ${destAddress || "Brazzaville"}`)
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(originAddress || "Brazzaville, Congo")}&output=embed&z=13`

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden">
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Carte de suivi"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 text-white text-center text-xs font-bold">
        Configurez NEXT_PUBLIC_GOOGLE_MAPS_API_KEY pour le suivi en temps réel
      </div>
    </div>
  )
}
