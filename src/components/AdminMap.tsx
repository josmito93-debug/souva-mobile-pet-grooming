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

  // 1. Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Reset container if previously initialized to avoid Leaflet error
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [37.66, -122.42],
        zoom: 11,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Esri World Dark Gray Base (100% Free, No API key, No watermark)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Esri, Garmin, © OpenStreetMap",
          maxZoom: 16,
        }
      ).addTo(map);

      // Esri World Dark Gray Reference Labels (streets & city labels)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 16,
        }
      ).addTo(map);

      // Central SOUVA Bay Area Hub marker
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

      L.marker([37.75, -122.44], { icon: depotIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; padding: 4px; color: #161811;">
            <strong style="color: #59593E;">SOUVA FLEET DISPATCH HUB</strong><br/>
            <span style="font-size: 11px;">San Francisco & Peninsula Solar Van Operations</span>
          </div>`
        );

      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    } catch (e) {
      console.warn("Leaflet map init warning:", e);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Keep map properly sized upon container resize
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    ro.observe(mapContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // 3. Update Markers on requests change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => {
      try {
        m.remove();
      } catch {}
    });
    markersRef.current = {};

    const coordCounts = new Map<string, number>();

    requests.forEach((req) => {
      let lat = Number(req.lat);
      let lng = Number(req.lng);

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        lat = 37.7749;
        lng = -122.4194;
      }

      // Fan out overlapping coordinates so all customer pins in the same neighborhood are distinctly visible
      const coordKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      const indexAtCoord = coordCounts.get(coordKey) || 0;
      coordCounts.set(coordKey, indexAtCoord + 1);

      if (indexAtCoord > 0) {
        const angle = indexAtCoord * 1.375; // golden angle spread
        const radius = 0.003 * Math.sqrt(indexAtCoord);
        lat += radius * Math.cos(angle);
        lng += radius * Math.sin(angle);
      }

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

      try {
        const customIcon = L.divIcon({
          className: `custom-req-marker-${req.id}`,
          html: markerHtml,
          iconSize: [40, 50],
          iconAnchor: [20, 25],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        if (isSelected) {
          marker.setZIndexOffset(1000);
        }

        marker.on("click", () => {
          onSelectRequest(req);
        });

        markersRef.current[req.id] = marker;
      } catch (err) {
        console.warn("Marker plot error:", err);
      }
    });

    if (requests.length > 0 && !selectedRequest) {
      const validPoints = requests
        .map((r) => [Number(r.lat), Number(r.lng)])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0);
      if (validPoints.length > 0) {
        try {
          const bounds = L.latLngBounds(validPoints as [number, number][]);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        } catch {}
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [requests, selectedRequest, onSelectRequest]);

  // 4. Fly to selected request
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRequest) return;
    const sLat = Number(selectedRequest.lat) || 37.7749;
    const sLng = Number(selectedRequest.lng) || -122.4194;
    try {
      mapInstanceRef.current.flyTo([sLat, sLng], 13, { duration: 1.2 });
    } catch {}
  }, [selectedRequest]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-[#FAF0E2]/15 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-0" />

      {/* Map Overlay Badge */}
      <div className="absolute top-4 left-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-[#161811]/90 backdrop-blur-md border border-[#FAF0E2]/15 text-xs font-mono text-[#FAF0E2] flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#AA8B63] animate-pulse" />
          <span className="font-bold text-[11px] sm:text-xs">LIVE FLEET RADAR · SF & PENINSULA</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([37.66, -122.42], 11);
              mapInstanceRef.current.invalidateSize();
            }
          }}
          className="px-2.5 py-0.5 rounded-lg bg-[#22271A] hover:bg-[#AA8B63] hover:text-[#161811] text-[#FAF0E2] transition-colors cursor-pointer text-[10px] font-mono font-bold"
        >
          Center Hub
        </button>
      </div>
    </div>
  );
}
