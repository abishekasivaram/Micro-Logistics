import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, MapPin, Navigation, Store, Home, ShieldCheck, 
  Key, Check, AlertCircle, RefreshCw, Plus, Minus, ArrowRight, Eye, Radio, Sparkles
} from 'lucide-react';
import './GoogleRouteMap.css';

// Known coordinates for fast fallback / immediate lookup of Chennai sample stops
const PRESET_COORDINATES = {
  't. nagar': { lat: 13.0418, lng: 80.2341 },
  'velachery': { lat: 12.9815, lng: 80.2180 },
  'anna nagar': { lat: 13.0850, lng: 80.2101 },
  'besant nagar': { lat: 13.0003, lng: 80.2668 },
  'mylapore': { lat: 13.0339, lng: 80.2677 },
  'adyar': { lat: 13.0064, lng: 80.2575 },
  'omr': { lat: 12.9698, lng: 80.2460 },
  'guindy': { lat: 13.0067, lng: 80.2025 },
  'alwarpet': { lat: 13.0334, lng: 80.2519 },
  'nungambakkam': { lat: 13.0569, lng: 80.2425 }
};

const resolveCoordinate = (address, fallbackLat = 13.0418, fallbackLng = 80.2341) => {
  if (!address) return { lat: fallbackLat, lng: fallbackLng };
  const lower = address.toLowerCase();
  for (const [key, coords] of Object.entries(PRESET_COORDINATES)) {
    if (lower.includes(key)) return coords;
  }
  return { lat: fallbackLat, lng: fallbackLng };
};

// Tactical dark map theme (Snazzy Maps style - Deep Navy & Charcoal with Muted Roads)
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0B0F19" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B0F19" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748B" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94A3B8" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0D1B2A" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1E293B" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0F172A" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1E293B" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#CBD5E1" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#161E2E" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748B" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#070A10" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#070A10" }]
  }
];

const GoogleRouteMap = ({
  stops = [],
  pickupLocation = "12 T. Nagar Main Rd, Chennai",
  deliveryLocation = "101 Anna Nagar East, Chennai",
  agentName = "Muthu Vel (DA014)",
  status = "OUT_FOR_DELIVERY",
  estimatedTime = "25 mins"
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const activePolylinesRef = useRef([]);
  const customMarkersRef = useRef([]);
  const animTimerRef = useRef(null);

  // Read API Key from env or localStorage
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || window.GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('MICRO_LOGISTICS_GMAPS_KEY') || envKey);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [routeComputed, setRouteComputed] = useState(false);
  const [routeDistanceText, setRouteDistanceText] = useState('4.9 km');
  const [routeDurationText, setRouteDurationText] = useState(estimatedTime || '25 mins');

  // Derive standard stops if not provided as array
  const activeStops = stops && stops.length > 0 ? stops : [
    { type: 'pickup', address: pickupLocation, title: 'Pickup Stop: Seller Hub' },
    { type: 'drop', address: deliveryLocation, title: 'Delivery Stop: Customer Location' }
  ];

  // Save API Key
  const handleSaveApiKey = (keyToSave) => {
    const cleanKey = keyToSave.trim();
    localStorage.setItem('MICRO_LOGISTICS_GMAPS_KEY', cleanKey);
    setApiKey(cleanKey);
    setShowKeyModal(false);
    setMapError(null);
    window.location.reload();
  };

  // Google Maps Loader
  useEffect(() => {
    if (!apiKey) {
      setIsMapLoaded(false);
      return;
    }

    // Check if already on window
    if (window.google?.maps) {
      setIsMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script-loader';
    let script = document.getElementById(scriptId);

    // Global auth failure handler
    window.gm_authFailure = () => {
      setMapError('Invalid Google Maps API Key or billing not enabled.');
      setIsMapLoaded(false);
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
        setMapError(null);
      };
      script.onerror = () => {
        setMapError('Failed to load Google Maps script. Check network connection or API Key.');
        setIsMapLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      setIsMapLoaded(true);
    }
  }, [apiKey]);

  // Initialize and Render Map
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || !window.google?.maps) return;

    try {
      const centerCoords = resolveCoordinate(activeStops[0]?.address);

      // Create Map
      if (!mapInstanceRef.current) {
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: centerCoords,
          zoom: 13,
          styles: DARK_MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'cooperative',
          backgroundColor: '#0B0F19'
        });
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Directions Service
      const directionsService = new window.google.maps.DirectionsService();

      // Clear previous overlays & renderers
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      activePolylinesRef.current.forEach(p => p.setMap(null));
      activePolylinesRef.current = [];
      customMarkersRef.current.forEach(m => m.setMap && m.setMap(null));
      customMarkersRef.current = [];
      if (animTimerRef.current) clearInterval(animTimerRef.current);

      const originStop = activeStops[0];
      const destStop = activeStops[activeStops.length - 1];
      const intermediateStops = activeStops.slice(1, -1);

      const originCoords = resolveCoordinate(originStop?.address, 13.0418, 80.2341);
      const destCoords = resolveCoordinate(destStop?.address, 13.0850, 80.2101);

      const waypoints = intermediateStops.map((s, idx) => {
        const coords = resolveCoordinate(s.address, 13.0064 + idx * 0.01, 80.2460);
        return {
          location: s.address || new window.google.maps.LatLng(coords.lat, coords.lng),
          stopover: true
        };
      });

      // Directions Request
      const request = {
        origin: originStop.address || new window.google.maps.LatLng(originCoords.lat, originCoords.lng),
        destination: destStop.address || new window.google.maps.LatLng(destCoords.lat, destCoords.lng),
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false
      };

      directionsService.route(request, (result, routeStatus) => {
        if (routeStatus === window.google.maps.DirectionsStatus.OK && result) {
          setRouteComputed(true);

          // Update distance & duration from calculated route
          const route = result.routes[0];
          if (route && route.legs) {
            let totalMeters = 0;
            let totalSeconds = 0;
            route.legs.forEach(leg => {
              totalMeters += leg.distance?.value || 0;
              totalSeconds += leg.duration?.value || 0;
            });
            setRouteDistanceText(`${(totalMeters / 1000).toFixed(1)} km`);
            setRouteDurationText(`${Math.round(totalSeconds / 60)} mins`);
          }

          // DirectionsRenderer (suppressMarkers so we draw custom HTML markers)
          const renderer = new window.google.maps.DirectionsRenderer({
            map: map,
            directions: result,
            suppressMarkers: true,
            preserveViewport: false,
            polylineOptions: {
              strokeColor: '#6366F1',
              strokeOpacity: 0.25,
              strokeWeight: 6
            }
          });
          directionsRendererRef.current = renderer;

          // Multi-segment gradient polyline simulation (#6366F1 -> #10B981)
          const pathPoints = route.overview_path || [];
          if (pathPoints.length > 0) {
            const mid = Math.floor(pathPoints.length / 2);
            const firstHalf = pathPoints.slice(0, mid + 1);
            const secondHalf = pathPoints.slice(mid);

            const poly1 = new window.google.maps.Polyline({
              path: firstHalf,
              map: map,
              strokeColor: '#6366F1',
              strokeOpacity: 0.9,
              strokeWeight: 4
            });

            const poly2 = new window.google.maps.Polyline({
              path: secondHalf,
              map: map,
              strokeColor: '#10B981',
              strokeOpacity: 0.9,
              strokeWeight: 4
            });

            // Animated flow line on top
            const lineSymbol = {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 2.5,
              strokeColor: '#FFFFFF',
              fillColor: '#FFFFFF',
              fillOpacity: 1
            };

            const animPoly = new window.google.maps.Polyline({
              path: pathPoints,
              map: map,
              strokeColor: 'transparent',
              icons: [{
                icon: lineSymbol,
                offset: '0%',
                repeat: '80px'
              }]
            });

            activePolylinesRef.current = [poly1, poly2, animPoly];

            // Flow animation loop
            let count = 0;
            animTimerRef.current = setInterval(() => {
              count = (count + 1) % 200;
              const icons = animPoly.get('icons');
              if (icons && icons[0]) {
                icons[0].offset = (count / 2) + '%';
                animPoly.set('icons', icons);
              }
            }, 50);

            // Fit bounds with generous padding
            const bounds = new window.google.maps.LatLngBounds();
            pathPoints.forEach(p => bounds.extend(p));
            map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

            // Custom HTML Overlays for stops
            createCustomOverlayMarkers(map, result, activeStops, agentName, status, routeDurationText);
          }
        } else {
          // Fallback: draw straight bounds if Directions API is restricted on key
          console.warn('Google Directions request failed:', routeStatus);
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(originCoords);
          bounds.extend(destCoords);
          map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        }
      });
    } catch (err) {
      console.error('Google Maps initialization error:', err);
      setMapError(err.message);
    }

    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, [isMapLoaded, activeStops, agentName, status]);

  // Custom Overlay Helper (OverlayView)
  const createCustomOverlayMarkers = (map, directionsResult, stopsList, driverName, runStatus, etaText) => {
    if (!window.google?.maps?.OverlayView) return;

    class HTMLMarkerOverlay extends window.google.maps.OverlayView {
      constructor(position, contentHtml, className) {
        super();
        this.position = position;
        this.contentHtml = contentHtml;
        this.className = className;
        this.div = null;
      }

      onAdd() {
        this.div = document.createElement('div');
        this.div.className = `gmap-custom-overlay ${this.className || ''}`;
        this.div.innerHTML = this.contentHtml;
        const panes = this.getPanes();
        panes.overlayMouseTarget.appendChild(this.div);
      }

      draw() {
        const overlayProjection = this.getProjection();
        if (!overlayProjection || !this.div) return;
        const point = overlayProjection.fromLatLngToDivPixel(this.position);
        if (point) {
          this.div.style.left = point.x + 'px';
          this.div.style.top = point.y + 'px';
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
          this.div = null;
        }
      }
    }

    const route = directionsResult.routes[0];
    const legs = route?.legs || [];

    // 1. Origin Pickup Marker
    if (legs.length > 0) {
      const originPos = legs[0].start_location;
      const pickupHtml = `
        <div class="gmap-node-pill pickup">
          <div class="gmap-icon-ring seller">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
          </div>
          <div class="gmap-label-tooltip">
            <span class="label-kicker">PICKUP POINT (SELLER)</span>
            <span class="label-address">${stopsList[0]?.address || 'Merchant Location'}</span>
          </div>
        </div>
      `;
      const originOverlay = new HTMLMarkerOverlay(originPos, pickupHtml, 'pickup-marker');
      originOverlay.setMap(map);
      customMarkersRef.current.push(originOverlay);
    }

    // 2. Destination Dropoff Marker
    if (legs.length > 0) {
      const lastLeg = legs[legs.length - 1];
      const destPos = lastLeg.end_location;
      const dropHtml = `
        <div class="gmap-node-pill dropoff">
          <div class="gmap-icon-ring customer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="gmap-label-tooltip">
            <span class="label-kicker">DELIVERY LOCATION</span>
            <span class="label-address">${stopsList[stopsList.length - 1]?.address || 'Customer Residence'}</span>
          </div>
        </div>
      `;
      const destOverlay = new HTMLMarkerOverlay(destPos, dropHtml, 'dropoff-marker');
      destOverlay.setMap(map);
      customMarkersRef.current.push(destOverlay);
    }

    // 3. Live Courier Marker (Positioned along route path ~40%)
    const pathPoints = route.overview_path || [];
    if (pathPoints.length > 3) {
      const courierIndex = Math.floor(pathPoints.length * 0.42);
      const courierPos = pathPoints[courierIndex];
      const courierHtml = `
        <div class="gmap-node-pill courier">
          <div class="gmap-radar-ring"></div>
          <div class="gmap-icon-ring courier-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>
          <div class="gmap-courier-eta-badge">
            <span class="badge-driver">${driverName || 'Field Courier'}</span>
            <span class="badge-eta">ETA: ${etaText || '25 mins'}</span>
          </div>
        </div>
      `;
      const courierOverlay = new HTMLMarkerOverlay(courierPos, courierHtml, 'courier-marker');
      courierOverlay.setMap(map);
      customMarkersRef.current.push(courierOverlay);
    }
  };

  // Custom Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && directionsRendererRef.current) {
      const dir = directionsRendererRef.current.getDirections();
      if (dir) {
        const bounds = new window.google.maps.LatLngBounds();
        dir.routes[0].overview_path.forEach(p => bounds.extend(p));
        mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      }
    }
  };

  return (
    <div className="google-route-map-wrapper">
      {/* Header Bar */}
      <div className="map-command-header">
        <div className="header-meta-group">
          <div className="header-icon-badge">
            <Compass size={17} />
          </div>
          <div>
            <h4 className="map-header-title">Live Dispatch Spatial Mesh</h4>
            <span className="map-header-sub">
              {apiKey ? 'Google Maps Turn-by-Turn Road Route' : 'Vector Corridor Simulation Mode'}
            </span>
          </div>
        </div>

        <div className="header-controls-group">
          <button 
            className="btn-api-key-config"
            title="Configure Google Maps API Key"
            onClick={() => { setTempKeyInput(apiKey); setShowKeyModal(true); }}
          >
            <Key size={13} />
            <span>{apiKey ? 'API Key Configured' : 'Connect Google Maps'}</span>
          </button>
          
          <div className="status-live-beacon">
            <span className="beacon-dot" />
            <span>{routeComputed ? 'GPS ROUTE SYNCD' : 'TELEMETRY READY'}</span>
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="map-viewport-surface">
        {/* Google Map Canvas */}
        <div 
          ref={mapContainerRef} 
          className={`google-map-canvas ${!apiKey || mapError ? 'hidden-canvas' : ''}`}
        />

        {/* Fallback Simulation Canvas (when no API key or on error) */}
        {(!apiKey || mapError) && (
          <div className="fallback-tactical-canvas">
            <div className="tactical-grid-overlay" />
            
            {/* SVG Simulated Vector Corridor */}
            <svg className="tactical-route-svg" viewBox="0 0 600 240">
              <defs>
                <linearGradient id="tacticalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="50%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <path 
                d="M 90 120 C 190 45, 330 195, 510 120" 
                fill="none" 
                stroke="url(#tacticalGradient)" 
                strokeWidth="4" 
                strokeDasharray="8 6"
                className="tactical-dash-anim"
              />
            </svg>

            {/* Simulated Origin Marker */}
            <div className="tactical-node origin" style={{ left: '60px', top: '95px' }}>
              <div className="tactical-icon-pill seller">
                <Store size={16} />
              </div>
              <div className="tactical-tooltip">
                <span className="tooltip-title">Pickup Point (Seller)</span>
                <span className="tooltip-text">{activeStops[0]?.address}</span>
              </div>
            </div>

            {/* Simulated Live Courier */}
            <div className="tactical-node courier-pos" style={{ left: '275px', top: '125px' }}>
              <div className="tactical-radar-ping" />
              <div className="tactical-icon-pill courier">
                <Navigation size={16} />
              </div>
              <div className="tactical-tooltip courier">
                <span className="tooltip-title">{agentName}</span>
                <span className="tooltip-text">ETA: {estimatedTime}</span>
              </div>
            </div>

            {/* Simulated Destination */}
            <div className="tactical-node dest" style={{ left: '480px', top: '95px' }}>
              <div className="tactical-icon-pill customer">
                <Home size={16} />
              </div>
              <div className="tactical-tooltip">
                <span className="tooltip-title">Delivery Location</span>
                <span className="tooltip-text">{activeStops[activeStops.length - 1]?.address}</span>
              </div>
            </div>

            {/* Connect API Key Prompt Overlay */}
            {!apiKey && (
              <div className="api-key-banner-prompt">
                <div className="banner-badge">
                  <Sparkles size={14} />
                  <span>Interactive Google Maps Integration Available</span>
                </div>
                <p>
                  To view live real-world Google Maps road routing with Directions API and turn-by-turn waypoints, add your Google Maps API Key.
                </p>
                <button 
                  className="btn-connect-maps"
                  onClick={() => setShowKeyModal(true)}
                >
                  <Key size={14} /> Enter Google Maps API Key
                </button>
              </div>
            )}
          </div>
        )}

        {/* Minimal Dark Tactical Controls (Overlay on top of map) */}
        {apiKey && !mapError && (
          <div className="custom-map-nav-cluster">
            <button className="nav-btn" title="Zoom in" onClick={handleZoomIn}>
              <Plus size={15} />
            </button>
            <button className="nav-btn" title="Zoom out" onClick={handleZoomOut}>
              <Minus size={15} />
            </button>
            <button className="nav-btn" title="Reset route fit" onClick={handleRecenter}>
              <RefreshCw size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Waypoint Address Ribbon */}
      <div className="map-footer-corridor-bar">
        <div className="corridor-stop-chip">
          <MapPin size={13} className="text-amber" />
          <span className="chip-label">From:</span>
          <span className="chip-address">{activeStops[0]?.address}</span>
        </div>
        <div className="corridor-arrow-divider">
          <ArrowRight size={14} />
        </div>
        <div className="corridor-stop-chip">
          <MapPin size={13} className="text-emerald" />
          <span className="chip-label">To:</span>
          <span className="chip-address">{activeStops[activeStops.length - 1]?.address}</span>
        </div>
        <div className="corridor-stats-chip">
          <span>{routeDistanceText}</span>
          <span className="stat-separator">•</span>
          <span>{routeDurationText}</span>
        </div>
      </div>

      {/* Dedicated API Key Modal Dialog */}
      {showKeyModal && (
        <div className="gmaps-modal-backdrop" onClick={() => setShowKeyModal(false)}>
          <div className="gmaps-modal-card" onClick={e => e.stopPropagation()}>
            <div className="gmaps-modal-header">
              <div className="gmaps-modal-title-wrap">
                <div className="gmaps-modal-icon-badge">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="gmaps-modal-title">Google Maps API Key</h3>
                  <span className="gmaps-modal-subtitle">Enable live road routing & turn-by-turn waypoints</span>
                </div>
              </div>
              <button 
                className="gmaps-modal-close" 
                onClick={() => setShowKeyModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="gmaps-modal-body">
              <p className="gmaps-modal-lead">
                Provide your Google Maps JavaScript API key with <strong>Directions API</strong> and <strong>Maps JavaScript API</strong> enabled in your Google Cloud Console.
              </p>

              <div className="gmaps-input-group">
                <label className="gmaps-input-label">
                  API Key <span className="gmaps-label-hint">(or set VITE_GOOGLE_MAPS_API_KEY in .env)</span>:
                </label>
                <input 
                  type="text"
                  className="gmaps-form-input"
                  placeholder="AIzaSy..."
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="gmaps-api-instructions">
                <span className="gmaps-instructions-title">Required Cloud APIs:</span>
                <ul>
                  <li><strong>Maps JavaScript API</strong> — base vector satellite/street rendering</li>
                  <li><strong>Directions API</strong> — multi-waypoint road route sequencing</li>
                  <li><strong>Geocoding API</strong> — address-to-coordinates translation</li>
                </ul>
              </div>
            </div>

            <div className="gmaps-modal-footer">
              <button 
                type="button"
                className="btn-gmaps-cancel" 
                onClick={() => setShowKeyModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn-gmaps-save"
                onClick={() => handleSaveApiKey(tempKeyInput)}
              >
                Save & Load Google Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleRouteMap;
