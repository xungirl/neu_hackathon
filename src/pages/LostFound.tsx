import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertCircle, X, ChevronRight, MapPin, Clock, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockMapMarkers } from '../services/mockData';
import LostPetMatcher from '../components/ai/LostPetMatcher';
import { MatchLostDogResult } from '../types/ai';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createMarkerIcon = (type: 'lost' | 'stray', image: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:44px;height:44px;">
        <div style="position:absolute;inset:-6px;border-radius:50%;background:${type === 'lost' ? 'rgba(59,130,246,0.3)' : 'rgba(249,115,22,0.3)'};animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="width:44px;height:44px;border-radius:50%;border:3px solid ${type === 'lost' ? '#3B82F6' : '#F97316'};overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);background:#fff;">
          <img src="${image}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  });
};

const newReportIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="width:32px;height:32px;border-radius:50%;background:#EF4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to fly to location
const FlyTo = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1 });
  }, [center]);
  return null;
};

// Component to handle map clicks for report
const MapClickHandler = ({ onMapClick, active }: { onMapClick: (lat: number, lng: number) => void; active: boolean }) => {
  useMapEvents({
    click(e) {
      if (active) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface ReportData {
  lat: number;
  lng: number;
  type: 'lost' | 'stray';
  petName: string;
  description: string;
}

const LostFound = () => {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [showMatcher, setShowMatcher] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchLostDogResult | null>(null);
  const [showStray, setShowStray] = useState(true);
  const [showLost, setShowLost] = useState(true);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Report state
  const [reporting, setReporting] = useState(false);
  const [reportStep, setReportStep] = useState<'locate' | 'form'>('locate');
  const [reportPin, setReportPin] = useState<{ lat: number; lng: number } | null>(null);
  const [reportData, setReportData] = useState<ReportData>({ lat: 0, lng: 0, type: 'lost', petName: '', description: '' });
  const [userReports, setUserReports] = useState<(ReportData & { id: string; timeAgo: string; image: string })[]>([]);
  const [locating, setLocating] = useState(false);

  const filteredMarkers = mockMapMarkers.filter(m => {
    if (m.type === 'stray' && !showStray) return false;
    if (m.type === 'lost' && !showLost) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (m.petName || '').toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleMatchFound = (result: MatchLostDogResult) => {
    setMatchResult(result);
    setShowMatcher(false);
  };

  const startReport = () => {
    setReporting(true);
    setReportStep('locate');
    setReportPin(null);
  };

  const useMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setReportPin({ lat: latitude, lng: longitude });
        setFlyTarget([latitude, longitude]);
        setReportStep('form');
        setReportData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        setLocating(false);
      },
      () => {
        alert('Could not get your location. Please click on the map instead.');
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (reporting && reportStep === 'locate') {
      setReportPin({ lat, lng });
      setReportData(prev => ({ ...prev, lat, lng }));
      setReportStep('form');
    }
  };

  const submitReport = () => {
    const newReport = {
      ...reportData,
      id: `user-${Date.now()}`,
      timeAgo: 'Just now',
      image: reportData.type === 'lost'
        ? 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    };
    setUserReports(prev => [...prev, newReport]);
    setReporting(false);
    setReportPin(null);
    setReportStep('locate');
    setReportData({ lat: 0, lng: 0, type: 'lost', petName: '', description: '' });
  };

  const cancelReport = () => {
    setReporting(false);
    setReportPin(null);
    setReportStep('locate');
  };

  // Seattle center
  const center: [number, number] = [47.6362, -122.3321];

  return (
    <div className="flex-1 relative overflow-hidden h-[calc(100vh-64px)]">
      {/* Real Map */}
      <MapContainer center={center} zoom={12} className="w-full h-full z-0" zoomControl={false} minZoom={10} maxZoom={18}>
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          maxZoom={20}
        />
        <ZoomControl position="bottomright" />
        <FlyTo center={flyTarget} />
        <MapClickHandler onMapClick={handleMapClick} active={reporting && reportStep === 'locate'} />

        {/* Mock markers */}
        {filteredMarkers.map(marker => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createMarkerIcon(marker.type, marker.image)}
            eventHandlers={{ click: () => setSelectedMarker(marker.id) }}
          >
            <Popup>
              <div className="w-56">
                <img src={marker.image} alt={marker.petName || 'Pet'} className="w-full h-32 object-cover rounded-lg mb-2" />
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${marker.type === 'lost' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                    {marker.type === 'lost' ? 'Lost' : 'Stray'}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} />{marker.timeAgo}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{marker.petName || 'Unknown Pet'}</h3>
                <p className="text-xs text-gray-600 mt-1">{marker.description}</p>
                <button className="mt-2 w-full bg-primary text-white text-xs font-bold py-1.5 rounded-md hover:bg-orange-600 transition-colors">
                  Contact Reporter
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User-submitted reports */}
        {userReports.map(report => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={createMarkerIcon(report.type, report.image)}
          >
            <Popup>
              <div className="w-56">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${report.type === 'lost' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                    {report.type === 'lost' ? 'Lost' : 'Stray'}
                  </span>
                  <span className="text-xs text-gray-500">{report.timeAgo}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{report.petName || 'Stray sighting'}</h3>
                <p className="text-xs text-gray-600 mt-1">{report.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Report pin */}
        {reportPin && (
          <Marker position={[reportPin.lat, reportPin.lng]} icon={newReportIcon}>
            <Popup>New report location</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Left Panel */}
      <div className="absolute top-6 left-6 z-[1000] w-80 max-w-[calc(100vw-3rem)] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-4 space-y-4 pointer-events-auto">
          {!reporting && !matchResult ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search location or breed..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowMatcher(true)}
                  className="w-full bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  <Search size={18} /> Find by Photo (AI)
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Show On Map</label>
                <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" checked={showStray} onChange={() => setShowStray(!showStray)} className="text-primary rounded border-gray-300 focus:ring-primary h-4 w-4" />
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-primary rounded-full"></span>
                    <span className="text-sm font-medium text-gray-700">Stray Reports</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" checked={showLost} onChange={() => setShowLost(!showLost)} className="text-secondary rounded border-gray-300 focus:ring-secondary h-4 w-4" />
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-secondary rounded-full"></span>
                    <span className="text-sm font-medium text-gray-700">Lost Pet Announcements</span>
                  </div>
                </label>
              </div>

              <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                {filteredMarkers.length + userReports.length} reports on map
              </div>
            </>
          ) : reporting ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">New Report</h3>
                <button onClick={cancelReport} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>

              {reportStep === 'locate' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Choose the location where you saw the pet:</p>
                  <button
                    onClick={useMyLocation}
                    disabled={locating}
                    className="w-full bg-primary text-white rounded-lg py-3 flex items-center justify-center gap-2 font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    <Navigation size={18} />
                    {locating ? 'Getting location...' : 'Use My Location'}
                  </button>
                  <p className="text-xs text-gray-400 text-center">or click anywhere on the map</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2 text-sm text-green-700">
                    <MapPin size={16} />
                    Location set ({reportData.lat.toFixed(4)}, {reportData.lng.toFixed(4)})
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Report Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReportData(p => ({ ...p, type: 'lost' }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${reportData.type === 'lost' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >Lost Pet</button>
                      <button
                        onClick={() => setReportData(p => ({ ...p, type: 'stray' }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${reportData.type === 'stray' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >Stray Sighting</button>
                    </div>
                  </div>
                  {reportData.type === 'lost' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pet Name</label>
                      <input
                        value={reportData.petName}
                        onChange={e => setReportData(p => ({ ...p, petName: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Buddy"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={reportData.description}
                      onChange={e => setReportData(p => ({ ...p, description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                      placeholder="Describe the pet, breed, color, collar..."
                    />
                  </div>
                  <button
                    onClick={submitReport}
                    disabled={!reportData.description}
                    className="w-full bg-primary text-white rounded-lg py-3 font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    Submit Report
                  </button>
                </div>
              )}
            </div>
          ) : matchResult ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">AI Search Results</h3>
                <button onClick={() => setMatchResult(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-orange-800 font-medium mb-1">
                  <Search size={16} />
                  {matchResult.is_match ? 'Potential Match Found!' : 'No High Confidence Match'}
                </div>
                <p className="text-xs text-orange-700">
                  Similarity Score: {(matchResult.similarity_score * 100).toFixed(1)}%
                </p>
              </div>
              {matchResult.matched_report_ids.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-medium uppercase">Matched Reports</p>
                  {matchResult.matched_report_ids.map(id => (
                    <div key={id} className="bg-white border border-gray-200 rounded-lg p-2 flex gap-3 hover:border-primary cursor-pointer transition-colors">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1544175287-e467232a3f14?auto=format&fit=crop&q=80&w=150" alt="Match" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Report #{id.substring(0, 8)}</p>
                        <p className="text-xs text-gray-500">Nearby - 2h ago</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 self-center" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <p>No matching stray reports found yet.</p>
                  <button className="mt-2 text-primary hover:underline" onClick={() => setMatchResult(null)}>Try another photo</button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* AI Matcher Modal */}
      {showMatcher && (
        <div className="absolute inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg relative">
            <button onClick={() => setShowMatcher(false)} className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors">
              <X size={24} />
            </button>
            <LostPetMatcher onMatchFound={handleMatchFound} />
          </div>
        </div>
      )}

      {/* Bottom Right Controls */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-end space-y-4">
        <button
          onClick={startReport}
          className={`group flex items-center space-x-2 ${reporting ? 'bg-gray-500' : 'bg-primary hover:bg-orange-600'} text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200`}
          disabled={reporting}
        >
          <AlertCircle size={20} />
          <span className="font-bold text-lg">{reporting ? 'Reporting...' : 'Report Now'}</span>
        </button>
      </div>

      {/* Reporting banner */}
      {reporting && reportStep === 'locate' && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-500 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2">
          <MapPin size={16} className="animate-bounce" />
          Click on map or use your location to pin the report
        </div>
      )}
    </div>
  );
};

export default LostFound;
