import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, ExternalLink, Maximize2, Minimize2, MapPin, Compass } from "lucide-react";
import { DispatchRequest } from "@/lib/dispatchStore";
import { cn } from "@/lib/utils";

interface AdminMapProps {
  requests: DispatchRequest[];
  selectedRequest: DispatchRequest | null;
  onSelectRequest: (r: DispatchRequest) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function AdminMap({
  requests,
  selectedRequest,
  onSelectRequest,
  isExpanded = false,
  onToggleExpand,
}: AdminMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Map Mode: "satellite" (default for house & driveway parking zoom), "streets", "dark"
  const [mapMode, setMapMode] = useState<"satellite" | "streets" | "dark">("satellite");

  // 1. Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [37.66, -122.42],
        zoom: 11,
        maxZoom: 19,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Dedicated layer group for hot-swapping map modes (Satellite, Streets, Dark)
      layerGroupRef.current = L.layerGroup().addTo(map);

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
          `<div style="font-family: sans-serif; padding: 6px; color: #161811; font-size: 12px;">
            <strong style="color: #AA8B63;">SOUVA FLEET DISPATCH HUB</strong><br/>
            <span>San Francisco & Peninsula Solar Van Operations</span>
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

  // 2. Hot-Swap Tile Layers Based on mapMode (Satellite, Streets, Dark)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }
    const group = layerGroupRef.current;
    group.clearLayers();

    if (mapMode === "satellite") {
      // High-resolution Esri World Imagery (level 19: houses, roofs, driveways & parked cars visible)
      const sat = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Esri, Maxar, Earthstar Geographics",
          maxZoom: 19,
          maxNativeZoom: 19,
        }
      );
      // Street names & boundaries overlay
      const labels = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          maxNativeZoom: 19,
        }
      );
      sat.addTo(group);
      labels.addTo(group);
    } else if (mapMode === "streets") {
      // Clear daytime street map with building outlines, street numbers, road names
      const streets = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Esri, HERE, Garmin, USGS",
          maxZoom: 19,
          maxNativeZoom: 19,
        }
      );
      streets.addTo(group);
    } else {
      // Dark gray luxury fleet radar
      const darkBase = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Esri, Garmin, © OpenStreetMap",
          maxZoom: 16,
        }
      );
      const darkLabels = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 16,
        }
      );
      darkBase.addTo(group);
      darkLabels.addTo(group);
    }
  }, [mapMode]);

  // 3. Keep map properly sized upon container resize / mobile orientation change
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

  // 4. Invalidate size when isExpanded toggles
  useEffect(() => {
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  }, [isExpanded]);

  // 5. Update Markers on requests change
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
              ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 2.5px solid #FAF0E2; background: rgba(170, 139, 99, 0.4); animation: pulse 1.5s infinite;"></div>`
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
            box-shadow: 0 4px 14px rgba(0,0,0,0.85);
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
            border: 1px solid rgba(250, 240, 226, 0.3);
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-family: monospace;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.7);
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

        marker.bindTooltip(
          `<div style="font-family: monospace; font-size: 11px; padding: 2px;">
            <strong>${req.petName}</strong> (${req.breed})<br/>
            <span>Client: ${req.customerName}</span><br/>
            <span>📍 ${req.address}</span>
          </div>`,
          { direction: "top", offset: [0, -20] }
        );

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

  // 6. Fly to selected request
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRequest) return;
    const sLat = Number(selectedRequest.lat) || 37.7749;
    const sLng = Number(selectedRequest.lng) || -122.4194;
    try {
      // Zoom to comfortable neighborhood level by default
      mapInstanceRef.current.flyTo([sLat, sLng], 14, { duration: 1.2 });
    } catch {}
  }, [selectedRequest]);

  // Helper: Zoom straight into house & driveway (level 18-19)
  const handleZoomToDriveway = () => {
    if (!mapInstanceRef.current || !selectedRequest) return;
    const lat = Number(selectedRequest.lat) || 37.7749;
    const lng = Number(selectedRequest.lng) || -122.4194;
    mapInstanceRef.current.flyTo([lat, lng], 18, { duration: 1.0 });
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[#FAF0E2]/15 shadow-2xl flex flex-col">
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[320px] z-0" />

      {/* ── TOP OPERATIONAL OVERLAY CONTROL BAR ── */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#161811]/90 backdrop-blur-md border border-[#FAF0E2]/15 shadow-2xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#202517] border border-[#AA8B63]/30 text-[10.5px] font-mono text-[#FAF0E2] font-bold">
            <span className="h-2 w-2 rounded-full bg-[#AA8B63] animate-pulse" />
            <span className="hidden sm:inline">RADAR ·</span>
            <span>SF & PENINSULA</span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/10 text-[10px] font-mono font-bold">
            <button
              type="button"
              onClick={() => setMapMode("satellite")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1",
                mapMode === "satellite"
                  ? "bg-[#AA8B63] text-[#161811] shadow-sm font-black"
                  : "text-[#A4AA93] hover:text-[#FAF0E2]"
              )}
              title="Ultra-high-resolution aerial photography for inspecting house, driveway, and curb parking"
            >
              <span>🛰️ Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode("streets")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1",
                mapMode === "streets"
                  ? "bg-[#AA8B63] text-[#161811] shadow-sm font-black"
                  : "text-[#A4AA93] hover:text-[#FAF0E2]"
              )}
              title="Daytime street navigation with road numbers and building footprints"
            >
              <span>🗺️ Streets</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode("dark")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1",
                mapMode === "dark"
                  ? "bg-[#AA8B63] text-[#161811] shadow-sm font-black"
                  : "text-[#A4AA93] hover:text-[#FAF0E2]"
              )}
              title="SOUVA Dark night fleet radar mode"
            >
              <span>🌙 Dark</span>
            </button>
          </div>
        </div>

        {/* Right side shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Driveway Zoom Button */}
          {selectedRequest && (
            <button
              type="button"
              onClick={handleZoomToDriveway}
              className="px-2.5 py-1 rounded-xl bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] text-[10.5px] font-mono font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Zoom in maximum (Level 18) onto client house and driveway to check parking space"
            >
              <Search className="h-3 w-3 stroke-[2.5]" />
              <span>Driveway Zoom</span>
            </button>
          )}

          {/* Google Street View 360 link */}
          {selectedRequest && (
            <a
              href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedRequest.lat},${selectedRequest.lng}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex px-2.5 py-1 rounded-xl bg-[#22271A] hover:bg-[#25D366] hover:text-[#161811] text-[#FAF0E2] text-[10.5px] font-mono font-bold items-center gap-1.5 transition-colors cursor-pointer border border-[#FAF0E2]/15 shadow-sm"
              title="Open Google Street View 360 to see the house front, curb, and driveway"
            >
              <ExternalLink className="h-3 w-3 text-emerald-400" />
              <span>360° Street View</span>
            </a>
          )}

          {/* Center Hub */}
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([37.66, -122.42], 11);
                mapInstanceRef.current.invalidateSize();
              }
            }}
            className="px-2.5 py-1 rounded-xl bg-[#22271A] hover:bg-[#AA8B63] hover:text-[#161811] text-[#FAF0E2] transition-colors cursor-pointer text-[10px] font-mono font-bold border border-[#FAF0E2]/15"
            title="Reset view to SOUVA Central Bay Area Depot"
          >
            Center Hub
          </button>

          {/* Toggle Expand / Theater Height */}
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1.5 rounded-xl bg-[#22271A] hover:bg-[#AA8B63] hover:text-[#161811] text-[#FAF0E2] transition-colors cursor-pointer border border-[#FAF0E2]/15"
              title={isExpanded ? "Collapse map height" : "Expand map height"}
            >
              {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
