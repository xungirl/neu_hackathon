import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Search, AlertCircle, X, ChevronRight, MapPin, Clock, Navigation, Camera, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
// leaflet CSS preloaded in index.html
import { mockMapMarkers } from '../services/mockData';
import { reportsService, Report } from '../api/services/reports';
import LostPetMatcher from '../components/ai/LostPetMatcher';
import { MatchLostDogResult } from '../types/ai';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const markerIconCache = new Map<string, L.DivIcon>();
const createMarkerIcon = (type: 'lost' | 'stray', image: string) => {
  const key = `${type}-${image}`;
  if (markerIconCache.has(key)) return markerIconCache.get(key)!;
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:40px;height:40px;border-radius:50%;border:3px solid ${type === 'lost' ? '#3B82F6' : '#F97316'};overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.25);background:#fff;">
      <img src="${image}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
    </div>`,
    iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -24],
  });
  markerIconCache.set(key, icon);
  return icon;
};

const newReportIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#EF4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  </div>`,
  iconSize: [32, 32], iconAnchor: [16, 16],
});

const FlyTo = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 15, { duration: 1 }); }, [center]);
  return null;
};

const MapClickHandler = ({ onMapClick, active }: { onMapClick: (lat: number, lng: number) => void; active: boolean }) => {
  useMapEvents({ click(e) { if (active) onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
};

interface ReportData {
  lat: number; lng: number;
  type: 'lost' | 'stray';
  petName: string; description: string;
  color: string; size: string;
  photoPreview: string;
}

const defaultReport: ReportData = { lat: 0, lng: 0, type: 'lost', petName: '', description: '', color: '', size: '', photoPreview: '' };

const COLOR_OPTIONS = ['White', 'Black', 'Brown', 'Golden', 'Gray', 'Mixed'];
const SIZE_OPTIONS = ['Small', 'Medium', 'Large'];

const LostFound = () => {
  const [panelOpen, setPanelOpen] = useState(true);
  const [showMatcher, setShowMatcher] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchLostDogResult | null>(null);
  const [showStray, setShowStray] = useState(true);
  const [showLost, setShowLost] = useState(true);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [reporting, setReporting] = useState(false);
  const [reportStep, setReportStep] = useState<'locate' | 'form'>('locate');
  const [reportPin, setReportPin] = useState<{ lat: number; lng: number } | null>(null);
  const [reportData, setReportData] = useState<ReportData>(defaultReport);
  const [apiReports, setApiReports] = useState<Report[]>([]);
  const [locating, setLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Load reports from backend
  useEffect(() => {
    reportsService.getReports({ limit: 100 })
      .then((res: any) => {
        setApiReports(res.data?.items || []);
      })
      .catch(() => {});
  }, []);

  const filteredMarkers = mockMapMarkers.filter(m => {
    if (m.type === 'stray' && !showStray) return false;
    if (m.type === 'lost' && !showLost) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (m.petName || '').toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleMatchFound = (result: MatchLostDogResult) => { setMatchResult(result); setShowMatcher(false); };

  const startReport = () => { setReporting(true); setReportStep('locate'); setReportPin(null); setSubmitted(false); };

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
      () => { alert('Could not get your location. Please click on the map instead.'); setLocating(false); },
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReportData(prev => ({ ...prev, photoPreview: url }));
    }
  };

  const submitReport = async () => {
    setSubmitError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('Please login first to submit a report.');
      return;
    }
    try {
      const res: any = await reportsService.createReport({
        lat: reportData.lat,
        lng: reportData.lng,
        type: reportData.type,
        pet_name: reportData.petName || undefined,
        description: reportData.description,
        color: reportData.color || undefined,
        size: reportData.size || undefined,
        photo_url: reportData.photoPreview || undefined,
      });
      setApiReports(prev => [res.data, ...prev]);
      setSubmitted(true);
      setTimeout(() => {
        setReporting(false);
        setReportPin(null);
        setReportStep('locate');
        setReportData(defaultReport);
        setSubmitted(false);
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit. Please login first.';
      setSubmitError(msg);
    }
  };

  const cancelReport = () => { setReporting(false); setReportPin(null); setReportStep('locate'); setReportData(defaultReport); };

  const [mapReady, setMapReady] = useState(false);
  const center: [number, number] = [47.6362, -122.3321];

  return (
    <div className="flex-1 relative overflow-hidden h-[calc(100vh-64px)]">
      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 z-[500] bg-gray-100 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary mb-3" size={36} />
          <p className="text-sm text-gray-500 font-medium">Loading map...</p>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
        minZoom={10}
        maxZoom={18}
        preferCanvas={true}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
          keepBuffer={4}
          updateWhenZooming={false}
          updateWhenIdle={true}
          tileSize={256}
        />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={true} metric={true} />
        <FlyTo center={flyTarget} />
        <MapClickHandler onMapClick={handleMapClick} active={reporting && reportStep === 'locate'} />

        {filteredMarkers.map(marker => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={createMarkerIcon(marker.type, marker.image)}>
            <Popup>
              <div className="w-48 sm:w-56">
                <img src={marker.image} alt={marker.petName || 'Pet'} className="w-full h-32 object-cover rounded-lg mb-2" loading="lazy" />
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${marker.type === 'lost' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                    {marker.type === 'lost' ? 'Lost' : 'Stray'}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} />{marker.timeAgo}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{marker.petName || 'Unknown Pet'}</h3>
                <p className="text-xs text-gray-600 mt-1">{marker.description}</p>
                <a
                  href={`mailto:report@goodle.pet?subject=${encodeURIComponent(`[Goodle] ${marker.type === 'lost' ? 'Lost Pet' : 'Stray'}: ${marker.petName || 'Unknown'}`)}&body=${encodeURIComponent(`Hi,\n\nI saw your report on Goodle about "${marker.petName || 'a stray pet'}".\n\n"${marker.description}"\n\nI'd like to help! Here are my details:\n\nName: \nPhone: \nLocation: \n\nBest regards`)}`}
                  className="mt-2 w-full bg-primary text-white text-xs font-bold py-1.5 rounded-md hover:bg-orange-600 transition-colors block text-center"
                >
                  Contact Reporter
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {apiReports.filter(r => r.lat && r.lng).map(report => (
          <Marker
            key={report.id}
            position={[report.lat!, report.lng!]}
            icon={createMarkerIcon(report.type, report.photo_url || 'https://cdn.pixabay.com/photo/2016/02/19/15/46/dog-1210559_640.jpg')}
          >
            <Popup>
              <div className="w-48 sm:w-56">
                {report.photo_url && <img src={report.photo_url} alt="Report" className="w-full h-32 object-cover rounded-lg mb-2" />}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${report.type === 'lost' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                    {report.type === 'lost' ? 'Lost' : 'Stray'}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{report.pet_name || 'Stray sighting'}</h3>
                <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                <div className="flex gap-1 mt-1">
                  {report.color && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{report.color}</span>}
                  {report.size && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{report.size}</span>}
                </div>
                <a href={`mailto:report@goodle.pet?subject=${encodeURIComponent(`[Goodle] ${report.type === 'lost' ? 'Lost' : 'Stray'}: ${report.pet_name || 'Unknown'}`)}&body=${encodeURIComponent(`Hi, I saw your report on Goodle.\n\n"${report.description}"\n\nI'd like to help!\n\nName:\nPhone:\n`)}`}
                  className="mt-2 w-full bg-primary text-white text-xs font-bold py-1.5 rounded-md hover:bg-orange-600 transition-colors block text-center">
                  Contact Reporter
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {reportPin && (
          <Marker position={[reportPin.lat, reportPin.lng]} icon={newReportIcon}>
            <Popup>New report location</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Panel toggle button (mobile) */}
      {!panelOpen && !reporting && (
        <button onClick={() => setPanelOpen(true)}
          className="absolute top-4 left-4 z-[1000] bg-white shadow-lg rounded-full p-2.5 border border-gray-200 md:hidden">
          <Search size={20} className="text-gray-600" />
        </button>
      )}

      {/* Left Panel (desktop) / Bottom Sheet (mobile) */}
      <div className={`absolute z-[1000] pointer-events-none transition-transform duration-300
        md:top-4 md:left-4 md:w-80 md:translate-y-0
        bottom-0 left-0 right-0 md:right-auto md:bottom-auto
        ${panelOpen || reporting ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
      `}>
        <div className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200 pointer-events-auto
          md:rounded-xl md:p-4 md:max-h-[calc(100vh-120px)]
          rounded-t-2xl p-4 max-h-[60vh]
          overflow-y-auto hide-scrollbar space-y-4">
          {/* Mobile drag handle */}
          <div className="flex justify-center md:hidden mb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
          {/* Mobile close */}
          <button onClick={() => setPanelOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 md:hidden"><X size={18} /></button>

          {!reporting && !matchResult ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search location or breed..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button onClick={() => setShowMatcher(true)}
                className="w-full bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-colors">
                <Search size={16} /> Find by Photo (AI)
              </button>
              <div className="space-y-1 pt-2 border-t border-gray-100">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Show On Map</label>
                <label className="flex items-center space-x-3 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" checked={showStray} onChange={() => setShowStray(!showStray)} className="rounded border-gray-300 h-3.5 w-3.5 accent-orange-500" />
                  <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                  <span className="text-sm text-gray-700">Stray Reports</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" checked={showLost} onChange={() => setShowLost(!showLost)} className="rounded border-gray-300 h-3.5 w-3.5 accent-blue-500" />
                  <span className="w-2.5 h-2.5 bg-secondary rounded-full"></span>
                  <span className="text-sm text-gray-700">Lost Pets</span>
                </label>
              </div>
              <p className="text-[10px] text-gray-400 text-center">{filteredMarkers.length + apiReports.length} reports on map</p>
            </>
          ) : reporting ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900 text-sm">{submitted ? 'Report Submitted!' : reportStep === 'locate' ? 'Pin Location' : 'Report Details'}</h3>
                {!submitted && <button onClick={cancelReport} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>}
              </div>

              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-sm text-gray-600">Thank you! Your report has been posted on the map.</p>
                </div>
              ) : reportStep === 'locate' ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Choose where you saw the pet:</p>
                  <button onClick={useMyLocation} disabled={locating}
                    className="w-full bg-primary text-white rounded-lg py-2.5 flex items-center justify-center gap-2 font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50">
                    <Navigation size={16} />
                    {locating ? 'Getting location...' : 'Use My Current Location'}
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-[10px] text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <p className="text-xs text-gray-400 text-center">Tap anywhere on the map</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Location confirmed */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2 text-xs text-green-700">
                    <MapPin size={14} /> Location pinned
                  </div>

                  {/* Photo upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Photo <span className="text-gray-400">(optional)</span></label>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    {reportData.photoPreview ? (
                      <div className="relative rounded-lg overflow-hidden h-28">
                        <img src={reportData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button onClick={() => setReportData(p => ({ ...p, photoPreview: '' }))}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => photoInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-200 rounded-lg py-4 flex flex-col items-center gap-1 hover:border-primary hover:bg-orange-50/50 transition-colors">
                        <Camera size={20} className="text-gray-400" />
                        <span className="text-xs text-gray-500">Upload photo</span>
                      </button>
                    )}
                  </div>

                  {/* Report type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Report Type <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <button onClick={() => setReportData(p => ({ ...p, type: 'lost' }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${reportData.type === 'lost' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        Lost Pet
                      </button>
                      <button onClick={() => setReportData(p => ({ ...p, type: 'stray' }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${reportData.type === 'stray' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        Stray Sighting
                      </button>
                    </div>
                  </div>

                  {/* Pet name (for lost) */}
                  {reportData.type === 'lost' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pet Name</label>
                      <input value={reportData.petName} onChange={e => setReportData(p => ({ ...p, petName: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Buddy" />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea value={reportData.description} onChange={e => setReportData(p => ({ ...p, description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-16 resize-none"
                      placeholder="Breed, color, collar, behavior..." />
                  </div>

                  {/* Color - optional */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color <span className="text-gray-400">(optional)</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c} onClick={() => setReportData(p => ({ ...p, color: p.color === c ? '' : c }))}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${reportData.color === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size - optional */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Size <span className="text-gray-400">(optional)</span></label>
                    <div className="flex gap-2">
                      {SIZE_OPTIONS.map(s => (
                        <button key={s} onClick={() => setReportData(p => ({ ...p, size: p.size === s ? '' : s }))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${reportData.size === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">{submitError}</div>
                  )}
                  {/* Submit */}
                  <button onClick={submitReport} disabled={!reportData.description}
                    className="w-full bg-red-500 text-white rounded-lg py-2.5 font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                    <AlertCircle size={16} /> Submit Report
                  </button>
                </div>
              )}
            </div>
          ) : matchResult ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-sm">AI Search Results</h3>
                <button onClick={() => setMatchResult(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-orange-800 font-medium text-sm mb-1">
                  <Search size={14} />
                  {matchResult.is_match ? 'Potential Match Found!' : 'No High Confidence Match'}
                </div>
                <p className="text-xs text-orange-700">Similarity: {(matchResult.similarity_score * 100).toFixed(1)}%</p>
              </div>
              {matchResult.matched_report_ids.length > 0 ? (
                <div className="space-y-2">
                  {matchResult.matched_report_ids.map(id => (
                    <div key={id} className="bg-white border border-gray-200 rounded-lg p-2 flex gap-3 hover:border-primary cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img src="https://images.unsplash.com/photo-1544175287-e467232a3f14?auto=format&fit=crop&q=80&w=100" alt="Match" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">Report #{id.substring(0, 8)}</p>
                        <p className="text-[10px] text-gray-500">Nearby - 2h ago</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-400 self-center" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs">
                  <p>No matching reports found.</p>
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
            <button onClick={() => setShowMatcher(false)} className="absolute -top-12 right-0 text-white hover:text-gray-200"><X size={24} /></button>
            <LostPetMatcher onMatchFound={handleMatchFound} />
          </div>
        </div>
      )}

      {/* Report Now button */}
      {!reporting && (
        <div className="absolute z-[1000] md:bottom-20 md:right-4 bottom-4 right-4">
          <button onClick={() => { startReport(); setPanelOpen(true); }}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm font-bold">
            <AlertCircle size={16} /> Report
          </button>
        </div>
      )}

      {/* Reporting banner */}
      {reporting && reportStep === 'locate' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-500 text-white px-3 py-2 rounded-full shadow-lg font-bold text-[10px] sm:text-xs flex items-center gap-1.5 whitespace-nowrap">
          <MapPin size={12} className="animate-bounce" /> Tap map or use location
        </div>
      )}
    </div>
  );
};

export default LostFound;
