import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Car, Route as RouteIcon, BarChart3, Bell, Settings, 
  ChevronLeft, Download, RefreshCw, AlertTriangle, Settings as Wrench, 
  Calendar, FileText, DollarSign, X, Edit2, Trash2, Plus 
} from 'lucide-react';
import api from '../api/axiosConfig';

const VehicleDetail = () => {
  const { id } = useParams(); // id-ul masinii
  const navigate = useNavigate();
  
  // stocam masina si inregistrarile separat 
  const [vehicle, setVehicle] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [aiPrediction, setAiPrediction] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);
  
  // stari pentru modalul de adaugare/editare mentenanta
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); 
  const [maintenanceForm, setMaintenanceForm] = useState({
    date: '',
    description: '',
    cost: ''
  });

  // Aducem datele mașinii si istoricul de mentenanta
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Folosim Promise.all pentru a face ambele request-uri în același timp (mai rapid!)
      const [vehicleRes, maintenanceRes] = await Promise.all([
        api.get(`/vehicles/${id}`),
        api.get(`/maintenance/vehicle/${id}`)
      ]);
      
      setVehicle(vehicleRes.data);
      setMaintenanceRecords(maintenanceRes.data);

      if (vehicleRes.data.latestPrediction) {
        setAiPrediction(vehicleRes.data.latestPrediction);
      }
    } catch (error) {
      console.error("Eroare la încărcarea datelor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      // request-ul cerand format binar (blob)
      const response = await api.get(`/vehicles/${id}/export`, {
        responseType: 'blob', 
      });

      //creem URL virtual temporar pentru fisierul primit
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      //creem un link <a> invizibil
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Vehicle_Report_${vehicle.licensePlate}.xlsx`); // numele fisierului cand se descarca
      document.body.appendChild(link);
      link.click();
      
      // curatam resursele folosite
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Eroare la exportul Excel-ului:", error);
      alert("Nu am putut genera raportul. Incearca din nou.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRunAIDiagnostics = async () => {
    setIsAILoading(true);
    try {
      const response = await api.post(`/ai/predict/${id}`);
      setAiPrediction(response.data); 
      fetchData();
    } catch (error) {
      console.error("Eroare la generarea predicției AI:", error);
      alert("Sistemul AI nu a putut procesa telemetria în acest moment.");
    } finally {
      setIsAILoading(false);
    }
  };

  // Salvăm sau modificăm o înregistrare de service
  const handleSaveMaintenance = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        // patch
        const patchPayload = {
          serviceDate: maintenanceForm.date,
          description: maintenanceForm.description,
          cost: parseFloat(maintenanceForm.cost) || 0
        };
        await api.patch(`/maintenance/${editingRecord.id}`, patchPayload);
      } else {
        // post
        const postPayload = {
          vehicleId: parseInt(id), 
          serviceDate: maintenanceForm.date,
          description: maintenanceForm.description,
          cost: parseFloat(maintenanceForm.cost) || 0
        };
        await api.post(`/maintenance`, postPayload);
      }

      
      setIsMaintenanceModalOpen(false);
      setEditingRecord(null);
      setMaintenanceForm({ date: '', description: '', cost: '' });
      
      
      fetchData(); 
    } catch (error) {
      console.error("Eroare la salvarea mentenanței:", error);
      alert("Nu s-a putut salva înregistrarea. Verificați consola.");
    }
  };

  // stergem o inregistrare
  const handleDeleteMaintenance = async (recordId) => {
    if (window.confirm("Ștergi definitiv această înregistrare de service?")) {
      try {
        await api.delete(`/maintenance/${recordId}`);
        fetchData(); 
      } catch (error) {
        console.error("Eroare la ștergere:", error);
      }
    }
  };

  const openAddModal = (prefilledDescription = '') => {
    setEditingRecord(null);
    setMaintenanceForm({ 
      date: new Date().toISOString().split('T')[0], 
      description: prefilledDescription, 
      cost: '' 
    });
    setIsMaintenanceModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setMaintenanceForm({ 
      date: record.serviceDate, 
      description: record.description, 
      cost: record.cost 
    });
    setIsMaintenanceModalOpen(true);
  };

  if (isLoading) return <div className="min-h-screen bg-neon-dark text-neon-cyan flex items-center justify-center font-mono">INITIALIZING_TELEMETRY...</div>;
  if (!vehicle) return <div className="min-h-screen bg-neon-dark text-red-500 flex items-center justify-center font-mono">VEHICLE_NOT_FOUND</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-gray-800 flex flex-col z-20 shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-neon-pink flex items-center gap-2 tracking-wider font-mono"><Car className="w-6 h-6" />AutoFleet AI</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 font-mono">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-gray-900 rounded uppercase text-xs tracking-wider transition-colors"><LayoutDashboard className="w-4 h-4" /> Dashboard</button>
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-neon-pink/10 text-neon-pink border-l-2 border-neon-pink rounded-r uppercase text-xs tracking-wider font-bold"><Car className="w-4 h-4" /> Fleet Status</a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* HEADER TOP NAV */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0a0a0f]/90 sticky top-0 z-10">
          <div className="flex items-center gap-4 text-xs font-mono tracking-widest text-gray-500 uppercase">
            <button onClick={() => navigate('/dashboard')} className="hover:text-neon-cyan transition-colors flex items-center"><ChevronLeft className="w-4 h-4 mr-1"/> Fleet</button>
            <span>/</span><span>Diagnostics</span><span>/</span><span className="text-neon-cyan">Vehicle Detail</span>
          </div>
          <div className="flex items-center gap-4 border-l border-gray-800 pl-6">
            <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan font-bold text-xs">AD</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          
          {/* VEHICLE TITLE HEADER */}
          <div className="flex justify-between items-end mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-900 border border-neon-cyan/30 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,204,0.1)]">
                <Car className="w-12 h-12 text-neon-cyan" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{vehicle.manufacturer} <span className="text-neon-pink">{vehicle.model}</span></h1>
                <div className="flex gap-4 font-mono text-xs tracking-widest uppercase">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded border border-gray-700">{vehicle.licensePlate}</span>
                  <span className="flex items-center text-gray-400"><RouteIcon className="w-3 h-3 mr-2 text-gray-500"/> {vehicle.mileage?.toLocaleString()} KM</span>
                  <span className="flex items-center text-neon-cyan"><div className="w-2 h-2 rounded-full bg-neon-cyan mr-2 shadow-[0_0_5px_#00ffcc]"></div> 92% Status</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleExportReport} 
                className="flex items-center gap-2 border border-gray-700 text-gray-400 px-4 py-2 rounded hover:bg-gray-800 hover:text-white transition-colors text-xs tracking-widest uppercase font-mono"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
              <button className="flex items-center gap-2 border border-neon-pink text-neon-pink px-4 py-2 rounded hover:bg-neon-pink/10 shadow-[0_0_10px_rgba(255,0,85,0.1)] transition-colors text-xs tracking-widest uppercase font-mono font-bold">
                <RefreshCw className="w-4 h-4" /> Sync Telemetry
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: AI & VITALS */}
            <div className="space-y-6">
              
              {/* AI PREDICTION CARD */}
              {/* AI PREDICTION CARD */}
              <div className="bg-[#12131c] border border-neon-pink/50 rounded-xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(255,0,85,0.05)] min-h-[300px] flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/10 blur-[50px] rounded-full pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-neon-pink text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">AI Prediction</span>
                  
                  {/* Arătăm butoane diferite în funcție de stare */}
                  {!isAILoading && (
                    <button 
                      onClick={handleRunAIDiagnostics}
                      className="text-neon-cyan text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-Scan
                    </button>
                  )}
                </div>

                {isAILoading ? (
                  /* STAREA 1: SE ÎNCARCĂ */
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-neon-pink animate-spin" />
                    <div>
                      <p className="text-neon-pink font-mono text-sm tracking-widest uppercase mb-1">Processing Telemetry</p>
                      <p className="text-xs text-gray-500 font-mono">Neural network analyzing {vehicle.maintenanceHistory?.length || 0} service records...</p>
                    </div>
                  </div>
                ) : aiPrediction ? (
                  /* STAREA 2: AVEM DATE DE LA AI */
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-white leading-tight">{aiPrediction.predictedComponent || aiPrediction.predictedComponent}</h3>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                        aiPrediction.urgency === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                        aiPrediction.urgency === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                        'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30'
                      }`}>
                        {aiPrediction.urgency}
                      </span>
                    </div>

                    <div className="mb-4">
                       <p className="text-xs text-gray-400 font-mono">Failure Probability: <span className="text-neon-pink font-bold text-sm">{aiPrediction.failureProbability}%</span></p>
                    </div>

                    <div className="bg-black/30 border-l-2 border-neon-pink p-4 rounded text-xs text-gray-400 mb-6 flex gap-3 items-start flex-1 overflow-y-auto max-h-[150px] custom-scrollbar">
                      <Wrench className="w-4 h-4 text-neon-pink shrink-0 mt-0.5" />
                      <p><strong className="text-gray-300">Reasoning Engine:</strong> {aiPrediction.reasoning}</p>
                    </div>

                    <button 
                        onClick={() => openAddModal(`AI Diagnostic: Recomandare inspectie/inlocuire pentru ${aiPrediction.predictedComponent}.`)}
                        className="w-full mt-auto bg-neon-pink text-black font-bold py-3 rounded uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(255,0,85,0.4)] transition-all"
                        >
                        Schedule Service Now
                    </button>
                  </div>
                ) : (
                  /* STAREA 3: FĂRĂ PREDICȚIE ÎNCĂ */
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <BarChart3 className="w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-gray-400 text-sm mb-6">No diagnostic data generated yet. Run the AI engine to analyze current vehicle telemetry.</p>
                    <button 
                      onClick={handleRunAIDiagnostics}
                      className="w-full bg-neon-pink/10 border border-neon-pink text-neon-pink font-bold py-3 rounded uppercase tracking-widest text-sm hover:bg-neon-pink hover:text-black transition-all"
                    >
                      Run AI Diagnostics
                    </button>
                  </div>
                )}
              </div>

              {/* VITALS WIDGETS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#12131c] border border-gray-800 p-5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Fuel / Energy Eff</p>
                  <h4 className="text-3xl font-bold text-neon-cyan flex items-end gap-1">6.2 <span className="text-sm text-gray-400 font-normal mb-1">{vehicle.fuelType === 'Electric' ? 'kWh/km' : 'L/100km'}</span></h4>
                  <div className="w-full bg-gray-800 h-1 mt-4 rounded"><div className="bg-neon-cyan h-1 w-3/4 rounded shadow-[0_0_5px_#00ffcc]"></div></div>
                </div>
                <div className="bg-[#12131c] border border-gray-800 p-5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Engine Temp</p>
                  <h4 className="text-3xl font-bold text-yellow-400 flex items-end gap-1">92 <span className="text-sm text-gray-400 font-normal mb-1">°C</span></h4>
                  <div className="w-full bg-gray-800 h-1 mt-4 rounded"><div className="bg-yellow-400 h-1 w-1/2 rounded shadow-[0_0_5px_#facc15]"></div></div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MAINTENANCE HISTORY (Folosește state-ul separat) */}
            <div className="lg:col-span-2">
              <div className="bg-[#12131c] border border-gray-800 rounded-xl h-full flex flex-col">
                
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><RefreshCw className="w-5 h-5 text-neon-cyan"/> Maintenance History</h3>
                  <button onClick={openAddModal} className="flex items-center gap-2 border border-neon-cyan text-neon-cyan px-3 py-1.5 rounded hover:bg-neon-cyan/10 transition-colors text-[10px] tracking-widest uppercase font-mono font-bold">
                    <Plus className="w-3 h-3" /> Add Record
                  </button>
                </div>

                <div className="flex-1 overflow-x-auto p-2">
                  <table className="w-full text-left text-sm font-sans">
                    <thead className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                      <tr>
                        <th className="p-4 font-medium border-b border-gray-800/50">Date</th>
                        <th className="p-4 font-medium border-b border-gray-800/50">Description</th>
                        <th className="p-4 font-medium border-b border-gray-800/50 text-right">Cost ($)</th>
                        <th className="p-4 font-medium border-b border-gray-800/50 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {maintenanceRecords && maintenanceRecords.length > 0 ? (
                        maintenanceRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-800/20 transition-colors group">
                            <td className="p-4 text-gray-400 font-mono text-xs tracking-wider">{record.serviceDate}</td>
                            <td className="p-4 text-white font-medium flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center border border-gray-700">
                                <Wrench className="w-4 h-4 text-neon-cyan" />
                              </div>
                              {record.description}
                            </td>
                            <td className="p-4 text-neon-cyan font-mono text-right font-bold">${record.cost?.toFixed(2)}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(record)} className="text-gray-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteMaintenance(record.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="text-center p-12 text-gray-600 font-mono text-xs uppercase tracking-widest">No Maintenance Records Found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER INFO BAR */}
          <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-4 gap-4 font-mono text-xs">
            <div>
              <p className="text-gray-600 tracking-widest uppercase mb-1">VIN</p>
              <p className="text-gray-300">{vehicle.vin || '1NX-BR32E-7-FZ109283'}</p>
            </div>
            <div>
              <p className="text-gray-600 tracking-widest uppercase mb-1">Engine Type</p>
              <p className="text-gray-300">{vehicle.engineSummary || `${vehicle.vehicleType}`}</p>
            </div>
            <div>
              <p className="text-gray-600 tracking-widest uppercase mb-1">Last Sync</p>
              <p className="text-gray-300">2 mins ago via Satellite Link</p>
            </div>
            <div>
              <p className="text-gray-600 tracking-widest uppercase mb-1">Warranty</p>
              <p className="text-neon-cyan">Active (until 2027)</p>
            </div>
          </div>
        </div>
      </main>

      {isMaintenanceModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#12131c] border border-neon-pink/30 rounded-lg shadow-[0_0_40px_rgba(255,0,85,0.15)] w-full max-w-md overflow-hidden">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-mono">Vehicle: {vehicle.licensePlate}</p>
              </div>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="p-6 space-y-6 font-mono">
              
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">Service Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="date" required
                    value={maintenanceForm.date}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, date: e.target.value})}
                    className="w-full bg-[#1c1e29] border border-gray-700 rounded pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neon-pink text-white [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <textarea 
                    required rows="3"
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                    placeholder="Enter maintenance details..."
                    className="w-full bg-[#1c1e29] border border-gray-700 rounded pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neon-pink text-white resize-none"
                  ></textarea>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">Estimated Cost ($)</label>
                <div className="relative flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 border-r border-gray-700 bg-gray-900 rounded-l">
                    <span className="text-neon-cyan font-bold">$</span>
                  </div>
                  <input 
                    type="number" step="0.01" required
                    value={maintenanceForm.cost}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, cost: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-[#1c1e29] border border-gray-700 rounded pl-14 pr-12 py-3 text-sm focus:outline-none focus:border-neon-pink text-white font-bold tracking-wider"
                  />
                  <span className="absolute right-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">USD</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 border border-neon-pink text-neon-pink px-4 py-3 rounded hover:bg-neon-pink hover:text-black transition-all text-xs tracking-widest uppercase font-bold shadow-[0_0_10px_rgba(255,0,85,0.1)]">
                  <Wrench className="w-3 h-3" /> {editingRecord ? 'UPDATE SYSTEM' : 'ADD RECORD'}
                </button>
                <button type="button" onClick={() => setIsMaintenanceModalOpen(false)} className="px-6 py-3 text-gray-500 hover:text-white transition-colors text-xs tracking-widest uppercase font-bold">
                  Cancel
                </button>
              </div>
            </form>
            
            <div className="bg-gray-900 border-t border-gray-800 p-2 flex justify-center gap-6 text-[8px] font-mono tracking-[0.2em] uppercase text-gray-600">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Network Secure</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-neon-cyan"></div> AI Validation Active</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleDetail;