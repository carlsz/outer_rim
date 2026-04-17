"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";
import { TacoSpot } from "@/lib/types";

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0a0b0d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0b0d" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1c2028" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#12151a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2c3140" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#05070a" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#1c2028" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
];

// SVG pin: gold for active, dim for completed
function makePinSvg(active: boolean) {
  const color = active ? "#c9a84c" : "#6b7280";
  const glow = active
    ? `filter: drop-shadow(0 0 6px rgba(201,168,76,0.8));`
    : "";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32" style="${glow}">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="${active ? '#0a0b0d' : '#0a0b0d'}"/>
    </svg>
  `;
}

interface HuntMapProps {
  spots: TacoSpot[];
  activeSpotId: string | null;
}

export function HuntMap({ spots, activeSpotId }: HuntMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current || spots.length === 0) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["marker"],
    });

    loader.importLibrary("maps").then(async ({ Map }) => {
      await loader.importLibrary("marker");

      const center =
        spots.length > 0
          ? { lat: spots[0].lat, lng: spots[0].lng }
          : { lat: 35.28, lng: -120.66 };

      if (!mapRef.current && containerRef.current) {
        mapRef.current = new Map(containerRef.current, {
          center,
          zoom: 15,
          styles: DARK_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          mapId: "outer-rim-hunt",
        });
      }

      const map = mapRef.current!;

      // Clear old markers
      markersRef.current.forEach((m) => (m.map = null));
      markersRef.current = [];
      polylineRef.current?.setMap(null);

      const path: google.maps.LatLngLiteral[] = [];

      for (const spot of spots) {
        const isActive = spot.id === activeSpotId;
        const el = document.createElement("div");
        el.innerHTML = makePinSvg(isActive);

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: spot.lat, lng: spot.lng },
          content: el,
          title: spot.swAlias,
        });

        markersRef.current.push(marker);
        path.push({ lat: spot.lat, lng: spot.lng });
      }

      // Draw route polyline
      polylineRef.current = new google.maps.Polyline({
        path,
        geodesic: false,
        strokeColor: "#c9a84c",
        strokeOpacity: 0,
        icons: [
          {
            icon: {
              path: "M 0,-1 0,1",
              strokeOpacity: 0.7,
              scale: 3,
              strokeColor: "#c9a84c",
            },
            offset: "0",
            repeat: "16px",
          },
        ],
        map,
      });

      // Pan to active stop
      const active = spots.find((s) => s.id === activeSpotId);
      if (active) {
        map.panTo({ lat: active.lat, lng: active.lng });
      }
    });
  }, [spots, activeSpotId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: "220px" }}
    />
  );
}
