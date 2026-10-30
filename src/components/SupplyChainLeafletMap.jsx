import React, { useEffect, useRef, useState } from 'react';
import { Layers, AlertTriangle, Truck, Warehouse, Building2, ShoppingBag, CheckCircle2, RefreshCw } from 'lucide-react';

const NODES = [
  {
    id: 'supplier-basel',
    name: 'Novartis Pharma AG',
    role: 'Tier-1 Supplier',
    city: 'Basel, Switzerland',
    coords: [47.5596, 7.5886],
    type: 'supplier',
    color: '#06b6d4', // Cyan
    status: 'Operational',
    details: 'Dispatched 500 vials MED-INSULIN-100 on schedule.'
  },
  {
    id: 'disruption-antwerp',
    name: 'Port of Antwerp (Customs Inspection)',
    role: 'Active Disruption Node',
    city: 'Antwerp, Belgium',
    coords: [51.2194, 4.4025],
    type: 'disruption',
    color: '#ef4444', // Red pulse
    status: 'Delayed (+48.0h)',
    details: 'Reefer container #TRK-APX-8801 flagged for cold-chain sensor calibration audit.'
  },
  {
    id: 'hub-frankfurt',
    name: 'Frankfurt Central DC',
    role: 'Destination Warehouse',
    city: 'Frankfurt, Germany',
    coords: [50.1109, 8.6821],
    type: 'warehouse',
    color: '#dcf836', // Lime
    status: 'Stock Depleted',
    details: 'Usable stock: 0 units. Promised customer commitments: 250 units.'
  },
  {
    id: 'hub-milan',
    name: 'Milan Southern DC',
    role: 'Alternative Sourcing Node',
    city: 'Milan, Italy',
    coords: [45.4642, 9.1900],
    type: 'alternative_warehouse',
    color: '#10b981', // Emerald
    status: 'Surplus Buffer (220 Units)',
    details: 'Available for immediate temperature-controlled stock transfer (14h transit).'
  },
  {
    id: 'customer-zurich',
    name: 'University Hospital Zurich',
    role: 'Critical Destination (Order #ORD-2026-901)',
    city: 'Zurich, Switzerland',
    coords: [47.3769, 8.5417],
    type: 'customer',
    color: '#f43f5e', // Rose
    status: 'At Risk (Penalty ₹4,15,000/day)',
    details: 'ICU pediatric insulin supply runs out in 18 hours.'
  },
  {
    id: 'customer-berlin',
    name: 'Charité Purchasing Berlin',
    role: 'Priority Customer (Order #ORD-2026-902)',
    city: 'Berlin, Germany',
    coords: [52.5200, 13.4050],
    type: 'customer',
    color: '#f59e0b', // Amber
    status: 'At Risk (Delivery Window 36h)',
    details: 'Surgical center replenishment delayed due to upstream transit hold.'
  }
];

export function SupplyChainLeafletMap({ showRecoveryRoute = true, onSelectNode, activeDisruption }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(NODES[1]); // Antwerp initially
  const [showAlternative, setShowAlternative] = useState(showRecoveryRoute);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Check if Leaflet is globally available from CDN
    const L = window.L;
    if (!L || !mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [49.8, 9.5],
        zoom: 6,
        zoomControl: true,
        attributionControl: false
      });

      // Standard Public OpenStreetMap (100% free, no API key required, zero watermarks)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // 1. Draw Primary Inbound Route (Basel -> Antwerp -> Frankfurt)
      const delayedRouteCoords = [
        [47.5596, 7.5886], // Basel
        [51.2194, 4.4025], // Antwerp
        [50.1109, 8.6821]  // Frankfurt
      ];
      L.polyline(delayedRouteCoords, {
        color: '#ef4444',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);

      // 2. Draw Outbound Customer Routes (Frankfurt -> Zurich, Frankfurt -> Berlin)
      L.polyline([[50.1109, 8.6821], [47.3769, 8.5417]], {
        color: '#f43f5e',
        weight: 2.5,
        opacity: 0.7,
        dashArray: '4, 4'
      }).addTo(map);

      L.polyline([[50.1109, 8.6821], [52.5200, 13.4050]], {
        color: '#f59e0b',
        weight: 2.5,
        opacity: 0.7,
        dashArray: '4, 4'
      }).addTo(map);

      // 3. Draw Proposed Recovery Route (Milan -> Frankfurt)
      if (showAlternative) {
        L.polyline([[45.4642, 9.1900], [50.1109, 8.6821]], {
          color: '#dcf836',
          weight: 4,
          opacity: 0.95
        }).addTo(map);
      }

      // 4. Add Interactive Custom Markers
      NODES.forEach((node) => {
        const isDisrupted = node.type === 'disruption';
        const isTarget = node.type === 'warehouse';
        const isRecovery = node.type === 'alternative_warehouse';

        const markerHtml = `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
          ">
            ${isDisrupted ? `
              <div style="
                position: absolute;
                inset: -6px;
                border-radius: 9999px;
                background-color: #ef4444;
                opacity: 0.6;
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
            ` : ''}
            ${isRecovery ? `
              <div style="
                position: absolute;
                inset: -4px;
                border-radius: 9999px;
                background-color: #10b981;
                opacity: 0.5;
                animation: pulse 2s infinite;
              "></div>
            ` : ''}
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 9999px;
              background-color: ${node.color};
              border: 3px solid #0b0f17;
              box-shadow: 0 0 12px ${node.color};
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'custom-map-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker(node.coords, { icon }).addTo(map);
        marker.on('click', () => {
          setSelectedNode(node);
          if (onSelectNode) onSelectNode(node);
        });

        // Popup
        marker.bindPopup(`
          <div style="
            background: #111726;
            color: #ffffff;
            font-family: Inter, sans-serif;
            padding: 8px 12px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            min-width: 180px;
          ">
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">${node.role}</div>
            <div style="font-size: 13px; font-weight: 800; margin-top: 2px;">${node.name}</div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">${node.city}</div>
            <div style="font-size: 11px; font-weight: 700; color: ${node.color}; margin-top: 6px;">Status: ${node.status}</div>
          </div>
        `);
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    } catch (e) {
      console.warn('Leaflet initialization warning:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showAlternative]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/[0.08] bg-obsidian-900 shadow-2xl">
      {/* Map Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-obsidian-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/[0.1] shadow-xl pointer-events-auto flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
            Live OpenStreetMap Transit Telemetry
          </span>
          <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-full font-mono">
            Antwerp Chokepoint Active
          </span>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => setShowAlternative(!showAlternative)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg ${
              showAlternative
                ? 'bg-lime text-obsidian-950 shadow-lime/20'
                : 'bg-obsidian-900 text-slate-300 border border-white/[0.1]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{showAlternative ? 'Hide' : 'Show'} Milan Recovery Line</span>
          </button>
        </div>
      </div>

      {/* Actual Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[460px] bg-obsidian-950" 
        style={{ minHeight: '460px' }}
      >
        {/* Fallback if Leaflet is loading or blocked by environment */}
        {!mapLoaded && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 text-lime animate-spin mb-3" />
            <p className="text-xs font-mono font-bold text-slate-300">Synchronizing European Transport Cartography...</p>
            <p className="text-[11px] text-slate-500 mt-1">Rendering real OpenStreetMap vectors for Basel, Antwerp, Frankfurt & Milan</p>
          </div>
        )}
      </div>

      {/* Bottom Floating Telemetry Card for Selected Node */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-[500] bg-obsidian-950/95 backdrop-blur-md border border-white/[0.12] rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ backgroundColor: `${selectedNode.color}22`, border: `1.5px solid ${selectedNode.color}` }}
            >
              {selectedNode.type === 'supplier' && <Building2 className="w-5 h-5 text-cyan-400" />}
              {selectedNode.type === 'disruption' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
              {selectedNode.type === 'warehouse' && <Warehouse className="w-5 h-5 text-lime" />}
              {selectedNode.type === 'alternative_warehouse' && <Truck className="w-5 h-5 text-emerald-400" />}
              {selectedNode.type === 'customer' && <ShoppingBag className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider font-mono text-slate-400">
                  {selectedNode.role}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white/[0.06] text-slate-300">
                  {selectedNode.city}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white mt-0.5">{selectedNode.name}</h4>
              <p className="text-xs text-slate-300 mt-1">{selectedNode.details}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono block">Node Status</span>
              <span className="text-xs font-bold font-mono" style={{ color: selectedNode.color }}>
                {selectedNode.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
