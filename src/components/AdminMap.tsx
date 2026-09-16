import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DispatchRequest } from "@/lib/dispatchStore";

interface AdminMapProps {
  requests: DispatchRequest[];
  selectedRequest: DispatchRequest | null;
  onSelectRequest: (r: DispatchRequest) => void;
}

export function AdminMap({
  requests,
  selectedRequest,
  onSelectRequest,
}: AdminMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered around Austin / Central Texas
      const map = L.map(mapContainerRef.current, {
        center: [30.34, -97.71],
        zoom: 11,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Add dark matter carto tiles with SOUVA warm aesthetic
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Central SOUVA Depot marker
      const depotIcon = L.divIcon({
        className: "custom-depot-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
            <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(170, 139, 99, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #AA8B63; border: 2px solid #FAF0E2; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(170, 139, 99, 0.8);">
              <span style="font-size: 14px;">🚐</span>
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      L.marker([30.33, -97.71], { icon: depotIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; padding: 4px; color: #161811;">
            <strong style="color: #59593E;">CENTRAL SOUVA MOBILE SPA</strong><br/>
            <span style="font-size: 11px;">Base de operaciones & esterilización</span>
          </div>`
        );

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Plot customer request markers
    requests.forEach((req) => {
      const isSelected = selectedRequest?.id === req.id;
      const statusColor =
        req.status === "en_route"
          ? "#AA8B63"
          : req.status === "assigned"
          ? "#737554"
          : req.status === "completed"
          ? "#6FA258"
          : req.status === "in_service"
          ? "#D4AF37"
          : "#C2A379";

      const markerHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${
            isSelected
              ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #FAF0E2; background: rgba(170, 139, 99, 0.3); animation: pulse 1.5s infinite;"></div>`
              : ""
          }
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #1C1E16;
            border: 2.5px solid ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.8);
            overflow: hidden;
          ">
            ${
              req.petPhoto
                ? `<img src="${req.petPhoto}" style="width: 100%; height: 100%; object-fit: cover;" />`
                : `<span style="font-size: 14px;">🐾</span>`
            }
          </div>
          <div style="
            margin-top: 3px;
            background: #161811;
            color: #FAF0E2;
            border: 1px solid rgba(250, 240, 226, 0.2);
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-family: monospace;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.6);
          ">
            ${req.petName} · ${req.etaMinutes}m
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `custom-req-marker-${req.id}`,
        html: markerHtml,
        iconSize: [40, 50],
        iconAnchor: [20, 25],
      });

      const marker = L.marker([req.lat, req.lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        onSelectRequest(req);
      });

      markersRef.current[req.id] = marker;
    });
  }, [requests, selectedRequest, onSelectRequest]);

  // When selectedRequest changes, smoothly fly to its coordinates
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRequest) return;
    mapInstanceRef.current.flyTo([selectedRequest.lat, selectedRequest.lng], 13, {
      duration: 1.2,
    });
  }, [selectedRequest]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-[#FAF0E2]/15 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-0" />

      {/* Map Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-[#161811]/85 backdrop-blur-md border border-[#FAF0E2]/15 text-xs font-mono text-[#FAF0E2] flex items-center gap-2 shadow-lg">
        <span className="h-2 w-2 rounded-full bg-[#AA8B63] animate-pulse" />
        <span>MAPA DE DESPACHO EN VIVO · AUSTIN & PFLUGERVILLE</span>
      </div>
    </div>
  );
}
