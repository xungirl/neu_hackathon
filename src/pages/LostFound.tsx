import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertCircle, X, ChevronRight, MapPin, Clock, Navigation, Camera, Loader2 } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mockMapMarkers } from '../services/mockData';
import { reportsService, Report } from '../api/services/reports';
import LostPetMatcher from '../components/ai/LostPetMatcher';
import { MatchLostDogResult } from '../types/ai';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [panelOpen, setPanelOpen] = useState(true);
  const [showMatcher, setShowMatcher] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchLostDogResult | null>(null);
  const [showStray, setShowStray] = useState(true);
  const [showLost, setShowLost] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const [reporting, setReporting] = useState(false);
  const [reportStep, setReportStep] = useState<'locate' | 'form'>('locate');
  const [reportPin, setReportPin] = useState<{ lat: number; lng: number } | null>(null);
  const [reportData, setReportData] = useState<ReportData>(defaultReport);
  const [apiReports, setApiReports] = useState<Report[]>([]);
  const [locating, setLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const reportMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Load reports
  useEffect(() => {
    reportsService.getReports({ limit: 100 })
      .then((res: any) => setApiReports(res.data?.items || []))
      .catch(() => {});
  }, []);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [-122.3321, 47.6362],
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'imperial' }), 'bottom-left');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    map.on('load', () => setMapReady(true));

    // Click to pin report
    map.on('click', (e) => {
      const el = document.getElementById('report-locate-active');
      if (el) {
        const { lng, lat } = e.lngLat;
        window.dispatchEvent(new CustomEvent('map-click', { detail: { lat, lng } }));
      }
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Listen for map clicks during reporting
  useEffect(() => {
    const handler = (e: Event) => {
      const { lat, lng } = (e as CustomEvent).detail;
      setReportPin({ lat, lng });
      setReportData(prev => ({ ...prev, lat, lng }));
      setReportStep('form');
    };
    window.addEventListener('map-click', handler);
    return () => window.removeEventListener('map-click', handler);
  }, []);

  // Update report pin marker
  useEffect(() => {
    if (reportMarkerRef.current) { reportMarkerRef.current.remove(); reportMarkerRef.current = null; }
    if (reportPin && mapRef.current) {
      const el = document.createElement('div');
      el.innerHTML = '<div style="width:28px;height:28px;border-radius:50%;background:#EF4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>';
      reportMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([reportPin.lng, reportPin.lat]).addTo(mapRef.current);
      mapRef.current.flyTo({ center: [reportPin.lng, reportPin.lat], zoom: 15, duration: 800 });
    }
  }, [reportPin]);

  // Render markers
  const filteredMarkers = mockMapMarkers.filter(m => {
    if (m.type === 'stray' && !showStray) return false;
    if (m.type === 'lost' && !showLost) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (m.petName || '').toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const addMarker = (lat: number, lng: number, type: 'lost' | 'stray', image: string, name: string, desc: string, time: string, extra?: { color?: string; size?: string }) => {
      const el = document.createElement('div');
      el.style.cssText = 'width:42px;height:42px;cursor:pointer;';
      el.innerHTML = `<div style="width:42px;height:42px;border-radius:50%;border:3px solid ${type === 'lost' ? '#3B82F6' : '#F97316'};overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);background:#fff;">
        <img src="${image}" style="width:100%;height:100%;object-fit:cover;" />
      </div>`;

      const popup = new maplibregl.Popup({ offset: 25, maxWidth: '260px' }).setHTML(`
        <div style="font-family:system-ui,-apple-system,sans-serif;">
          <img src="${image}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;color:white;background:${type === 'lost' ? '#3B82F6' : '#F97316'}">${type === 'lost' ? 'Lost' : 'Stray'}</span>
            <span style="font-size:11px;color:#9CA3AF;">${time}</span>
          </div>
          <h3 style="font-weight:700;font-size:14px;color:#111827;margin:0 0 4px;">${name}</h3>
          <p style="font-size:12px;color:#6B7280;margin:0 0 6px;line-height:1.4;">${desc}</p>
          ${extra?.color || extra?.size ? `<div style="display:flex;gap:4px;margin-bottom:8px;">${extra.color ? `<span style="font-size:10px;background:#F3F4F6;padding:2px 6px;border-radius:4px;">${extra.color}</span>` : ''}${extra.size ? `<span style="font-size:10px;background:#F3F4F6;padding:2px 6px;border-radius:4px;">${extra.size}</span>` : ''}</div>` : ''}
          <a href="mailto:report@goodle.pet?subject=${encodeURIComponent(`[Goodle] ${type === 'lost' ? 'Lost' : 'Stray'}: ${name}`)}&body=${encodeURIComponent(`Hi,\n\nI saw your report about "${name}" on Goodle.\n\n"${desc}"\n\nI'd like to help!\n\nName:\nPhone:\n`)}"
            style="display:block;text-align:center;background:#F97316;color:white;font-size:12px;font-weight:700;padding:6px;border-radius:6px;text-decoration:none;">
            Contact Reporter
          </a>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).setPopup(popup).addTo(mapRef.current!);
      markersRef.current.push(marker);
    };

    // Mock markers
    filteredMarkers.forEach(m => addMarker(m.lat, m.lng, m.type, m.image, m.petName || 'Unknown Pet', m.description, m.timeAgo));

    // API reports
    apiReports.filter(r => r.lat && r.lng).forEach(r =>
      addMarker(r.lat!, r.lng!, r.type, r.photo_url || 'https://cdn.pixabay.com/photo/2016/02/19/15/46/dog-1210559_640.jpg',
        r.pet_name || 'Stray sighting', r.description || '', new Date(r.created_at).toLocaleDateString(),
        { color: r.color || undefined, size: r.size || undefined })
    );
  }, [filteredMarkers.length, apiReports, showStray, showLost, searchQuery, mapReady]);

  const handleMatchFound = (result: MatchLostDogResult) => { setMatchResult(result); setShowMatcher(false); };
  const startReport = () => { setReporting(true); setReportStep('locate'); setReportPin(null); setSubmitted(false); setPanelOpen(true); };

  const useMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setReportPin({ lat: latitude, lng: longitude });
        setReportData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        setReportStep('form');
        setLocating(false);
      },
      () => { alert('Could not get your location. Click on the map instead.'); setLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReportData(prev => ({ ...prev, photoPreview: URL.createObjectURL(file) }));
  };

  const submitReport = async () => {
    setSubmitError('');
    if (!localStorage.getItem('token')) { setSubmitError('Please login first.'); return; }
    try {
      const res: any = await reportsService.createReport({
        lat: reportData.lat, lng: reportData.lng, type: reportData.type,
        pet_name: reportData.petName || undefined, description: reportData.description,
        color: reportData.color || undefined, size: reportData.size || undefined,
        photo_url: reportData.photoPreview || undefined,
      });
      setApiReports(prev => [res.data, ...prev]);
      setSubmitted(true);
      setTimeout(() => { setReporting(false); setReportPin(null); setReportStep('locate'); setReportData(defaultReport); setSubmitted(false); }, 2000);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed. Please login first.');
    }
  };

  const cancelReport = () => { setReporting(false); setReportPin(null); setReportStep('locate'); setReportData(defaultReport); };

  return (
    <div className="flex-1 relative overflow-hidden h-[calc(100vh-64px)]">
      {/* Loading */}
      {!mapReady && (
        <div className="absolute inset-0 z-[500] bg-gray-50 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary mb-3" size={36} />
          <p className="text-sm text-gray-500 font-medium">Loading map...</p>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Hidden flag for map click handler */}
      {reporting && reportStep === 'locate' && <div id="report-locate-active" className="hidden" />}

      {/* Mobile panel toggle */}
      {!panelOpen && !reporting && (
        <button onClick={() => setPanelOpen(true)} className="absolute top-4 left-4 z-[1000] bg-white shadow-lg rounded-full p-2.5 border border-gray-200 md:hidden">
          <Search size={20} className="text-gray-600" />
        </button>
      )}

      {/* Panel */}
      <div className={`absolute z-[1000] pointer-events-none transition-transform duration-300
        md:top-4 md:left-4 md:w-80 md:translate-y-0
        bottom-0 left-0 right-0 md:right-auto md:bottom-auto
        ${panelOpen || reporting ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
        <div className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200 pointer-events-auto
          md:rounded-xl md:p-4 md:max-h-[calc(100vh-120px)]
          rounded-t-2xl p-4 max-h-[60vh]
          overflow-y-auto hide-scrollbar space-y-4">

          <div className="flex justify-center md:hidden mb-2"><div className="w-10 h-1 bg-gray-300 rounded-full"></div></div>
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
                  <p className="text-sm text-gray-600">Your report is now live on the map!</p>
                </div>
              ) : reportStep === 'locate' ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Choose where you saw the pet:</p>
                  <button onClick={useMyLocation} disabled={locating}
                    className="w-full bg-primary text-white rounded-lg py-2.5 flex items-center justify-center gap-2 font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50">
                    <Navigation size={16} /> {locating ? 'Getting location...' : 'Use My Current Location'}
                  </button>
                  <div className="flex items-center gap-2"><div className="flex-1 h-px bg-gray-200"></div><span className="text-[10px] text-gray-400">or</span><div className="flex-1 h-px bg-gray-200"></div></div>
                  <p className="text-xs text-gray-400 text-center">Tap anywhere on the map</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2 text-xs text-green-700"><MapPin size={14} /> Location pinned</div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Photo <span className="text-gray-400">(optional)</span></label>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    {reportData.photoPreview ? (
                      <div className="relative rounded-lg overflow-hidden h-28">
                        <img src={reportData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button onClick={() => setReportData(p => ({ ...p, photoPreview: '' }))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => photoInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-lg py-4 flex flex-col items-center gap-1 hover:border-primary hover:bg-orange-50/50 transition-colors">
                        <Camera size={20} className="text-gray-400" /><span className="text-xs text-gray-500">Upload photo</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Report Type <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <button onClick={() => setReportData(p => ({ ...p, type: 'lost' }))} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${reportData.type === 'lost' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Lost Pet</button>
                      <button onClick={() => setReportData(p => ({ ...p, type: 'stray' }))} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${reportData.type === 'stray' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Stray Sighting</button>
                    </div>
                  </div>
                  {reportData.type === 'lost' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pet Name</label>
                      <input value={reportData.petName} onChange={e => setReportData(p => ({ ...p, petName: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Buddy" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea value={reportData.description} onChange={e => setReportData(p => ({ ...p, description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-16 resize-none"
                      placeholder="Breed, color, collar, behavior..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color <span className="text-gray-400">(optional)</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c} onClick={() => setReportData(p => ({ ...p, color: p.color === c ? '' : c }))}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${reportData.color === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Size <span className="text-gray-400">(optional)</span></label>
                    <div className="flex gap-2">
                      {SIZE_OPTIONS.map(s => (
                        <button key={s} onClick={() => setReportData(p => ({ ...p, size: p.size === s ? '' : s }))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${reportData.size === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  {submitError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">{submitError}</div>}
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
                  <Search size={14} /> {matchResult.is_match ? 'Potential Match Found!' : 'No Match'}
                </div>
                <p className="text-xs text-orange-700">Similarity: {(matchResult.similarity_score * 100).toFixed(1)}%</p>
              </div>
              {matchResult.matched_report_ids.length > 0 ? (
                <div className="space-y-2">
                  {matchResult.matched_report_ids.map(id => (
                    <div key={id} className="bg-white border border-gray-200 rounded-lg p-2 flex gap-3 hover:border-primary cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img src="https://cdn.pixabay.com/photo/2016/02/19/15/46/dog-1210559_640.jpg" alt="Match" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">Report #{id.substring(0, 8)}</p>
                        <p className="text-[10px] text-gray-500">Nearby</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-400 self-center" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs">
                  <p>No matching reports.</p>
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

      {/* Report Now */}
      {!reporting && (
        <div className="absolute z-[1000] md:bottom-20 md:right-4 bottom-4 right-4">
          <button onClick={startReport}
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
