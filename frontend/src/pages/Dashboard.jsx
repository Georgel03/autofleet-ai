import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, Route as RouteIcon, BarChart3, Search, Plus, Bell, Settings, X, MoreVertical, LogOut, Zap, Fuel, Leaf, Edit2, AlertTriangle, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../api/axiosConfig'; 

const Dashboard = () => {
  const navigate = useNavigate();
  
  // --- STĂRI PENTRU PAGINARE, SORTARE, CĂUTARE ---
  const [vehicles, setVehicles] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('id'); 
  const [sortDir, setSortDir] = useState('DESC'); 
  
  // --- STARE PENTRU STATISTICI (Total KM și Mașini Critice) ---
  const [fleetStats, setFleetStats] = useState({totalCars: 0,  totalMileage: 0, criticalCount: 0 });

  const [isLoading, setIsLoading] = useState(true);

  // Stări pentru Modale și Meniuri
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);

  // Formular Adăugare
  const [newVehicle, setNewVehicle] = useState({
    manufacturer: '', model: '', licensePlate: '', mileage: '', engineType: 'THERMAL', 
    horsePower: '', batteryCapacity: '', maxRange: '', displacement: '', cylinders: '', fuelType: 'Gasoline'
  });

  // Funcția principală de FETCH Mașini
  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/vehicles', {
        params: {
          page: currentPage,
          size: 10,
          sortBy: sortBy,
          sortDir: sortDir,
          keyword: searchQuery
        }
      });
      setVehicles(response.data.content); 
      setTotalPages(response.data.totalPages);
      fetchStats();
    } catch (error) {
      console.error("Eroare la aducerea mașinilor:", error);
      if (error.response?.status === 403) handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  // NOU: Funcția de FETCH Statistici
  const fetchStats = async () => {
    try {
      const response = await api.get('/vehicles/stats');
      setFleetStats(response.data);
    } catch (error) {
      console.error("Eroare la aducerea statisticilor:", error);
    }
  };

  // Reîncărcăm datele la schimbarea paginii/sortării
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, sortBy, sortDir, searchQuery]);

  // Aducem statisticile globale o singură dată la încărcarea paginii
  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortDir('ASC');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return sortDir === 'ASC' ? <ChevronUp className="inline w-3 h-3 ml-1 text-neon-pink" /> : <ChevronDown className="inline w-3 h-3 ml-1 text-neon-pink" />;
  };

  // --- ACȚIUNI CRUD ---
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        manufacturer: newVehicle.manufacturer,
        model: newVehicle.model,
        licensePlate: newVehicle.licensePlate,
        mileage: parseInt(newVehicle.mileage) || 0,
        engineType: newVehicle.engineType,
        horsePower: parseInt(newVehicle.horsePower) || null,
      };

      if (newVehicle.engineType === 'THERMAL') {
        payload.displacement = parseInt(newVehicle.displacement) || null;
        payload.cylinders = parseInt(newVehicle.cylinders) || null;
        payload.fuelType = newVehicle.fuelType;
      } else if (newVehicle.engineType === 'HYBRID') {
        payload.displacement = parseInt(newVehicle.displacement) || null;
        payload.cylinders = parseInt(newVehicle.cylinders) || null;
        payload.batteryCapacity = parseInt(newVehicle.batteryCapacity) || null;
        payload.fuelType = newVehicle.fuelType;
      } else if (newVehicle.engineType === 'ELECTRIC') {
        payload.batteryCapacity = parseInt(newVehicle.batteryCapacity) || null;
        payload.maxRange = parseInt(newVehicle.maxRange) || null;
      }

      await api.post('/vehicles', payload);
      setIsAddModalOpen(false);
      setNewVehicle({ manufacturer: '', model: '', licensePlate: '', mileage: '', engineType: 'THERMAL', horsePower: '', batteryCapacity: '', maxRange: '', displacement: '', cylinders: '', fuelType: 'Gasoline' });
      fetchVehicles(); 
      fetchStats(); // Actualizăm totalul de km după adăugare
    } catch (error) {
      console.error("Eroare la adăugarea mașinii:", error);
      alert("Nu s-a putut adăuga mașina. Verifică setările CSRF din Spring Security.");
    }
  };

  const confirmDeleteVehicle = async () => {
    if(!vehicleToDelete) return;
    try {
      await api.delete(`/vehicles/${vehicleToDelete.id}`);
      setVehicleToDelete(null);
      if (vehicles.length === 1 && currentPage > 0) setCurrentPage(currentPage - 1);
      else fetchVehicles(); 
      fetchStats(); // Actualizăm totalul de km după ștergere
    } catch (error) {
      console.error("Eroare la ștergere:", error);
    }
  };

  const handleModifyVehicle = async (e) => {
    e.preventDefault();
    if(!vehicleToEdit) return;
    try {
      const payload = {
        manufacturer: vehicleToEdit.manufacturer,
        model: vehicleToEdit.model,
        licensePlate: vehicleToEdit.licensePlate,
        mileage: parseInt(vehicleToEdit.mileage) || 0,
      };
      await api.patch(`/vehicles/${vehicleToEdit.id}`, payload);
      setVehicleToEdit(null);
      fetchVehicles(); 
      fetchStats(); // Actualizăm totalul de km după modificare
    } catch (error) {
      console.error("Eroare la modificare:", error);
      alert("Eroare la salvarea modificărilor.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  const toggleMenu = (id) => {
    if (activeMenuId === id) setActiveMenuId(null);
    else setActiveMenuId(id);
  };

  return (
    <div className="min-h-screen bg-neon-dark text-gray-300 flex font-mono" onClick={() => activeMenuId && setActiveMenuId(null)}>
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-gray-800 bg-[#0a0a0f] flex flex-col z-20 shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-neon-pink flex items-center gap-2 tracking-wider">
            <Car className="w-6 h-6" /> AutoFleet AI
          </h1>
          <p className="text-[10px] text-neon-cyan mt-2 uppercase tracking-widest">Sector 7-G Operational</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-neon-pink/10 text-neon-pink border-l-2 border-neon-pink rounded-r uppercase text-xs tracking-wider font-bold">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-gray-900 rounded uppercase text-xs tracking-wider transition-colors">
            <Car className="w-4 h-4" /> Fleet Status
          </a>
          <button onClick={() => navigate('/analytics')} className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-gray-900 rounded uppercase text-xs tracking-wider transition-colors w-full text-left">
            <BarChart3 className="w-4 h-4" /> Analytics
          </button> 
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-neon-pink transition-colors text-xs uppercase tracking-wider w-full">
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0a0a0f]/50 backdrop-blur z-10">
          <div className="flex items-center gap-8">
            <h2 className="text-white text-lg font-bold border-b-2 border-neon-pink pb-1">Fleet Overview</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search manufacturer, model, plates..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-gray-900 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 text-white w-72 transition-all placeholder-gray-600"
              />
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 border border-neon-pink text-neon-pink px-4 py-2 rounded hover:bg-neon-pink/10 transition-colors text-xs tracking-widest uppercase font-bold"
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
            
            <div className="flex items-center gap-4 border-l border-gray-800 pl-6">
              <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Settings className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan font-bold">AD</div>
            </div>
          </div>
        </header>

        {/* DASHBOARD WIDGETS */}
        <div className="p-8 overflow-y-auto flex-1 bg-neon-dark">
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-neon-panel border border-gray-800 p-6 rounded-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/30">
                  <Car className="text-neon-cyan w-5 h-5" />
                </div>
                <span className="text-neon-cyan text-[10px] tracking-widest uppercase">System Ready</span>
              </div>
              <p className="text-gray-500 text-xs tracking-wider uppercase mb-1">Total Vehicles</p>
              <h3 className="text-4xl font-bold text-white">{fleetStats.totalCars || 0}</h3>
            </div>

            <div className="bg-neon-panel border border-red-900/50 p-6 rounded-lg relative overflow-hidden shadow-[0_0_15px_rgba(255,0,0,0.05)]">
               <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center border border-red-500/30">
                  <span className="text-red-500 font-bold">!</span>
                </div>
                <span className="text-red-500 text-[10px] tracking-widest uppercase">Critical Status</span>
              </div>
              <p className="text-gray-500 text-xs tracking-wider uppercase mb-1">Maintenance Required</p>
              {/* DATE REALE DIN DB */}
              <h3 className="text-4xl font-bold text-red-500">{fleetStats.criticalCount || 0}</h3>
            </div>

             <div className="bg-neon-panel border border-gray-800 p-6 rounded-lg">
               <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-neon-pink/10 flex items-center justify-center border border-neon-pink/30">
                  <BarChart3 className="text-neon-pink w-5 h-5" />
                </div>
                <span className="text-neon-pink text-[10px] tracking-widest uppercase">Fleet Performance</span>
              </div>
              <p className="text-gray-500 text-xs tracking-wider uppercase mb-1">Total Fleet Mileage</p>
              <h3 className="text-4xl font-bold text-white flex items-end gap-2">
                {/* DATE REALE DIN DB */}
                {(fleetStats.totalMileage || 0).toLocaleString()} <span className="text-sm text-gray-500 font-normal mb-1">km</span>
              </h3>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-neon-panel border border-gray-800 rounded-lg flex flex-col mb-16">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-lg">Active Fleet Registry</h3>
                <p className="text-xs text-gray-500 tracking-wider">Real-time status monitoring for all registered units</p>
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-900/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800 select-none">
                  <tr>
                    <th className="p-4 pl-6 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('id')}>
                      ID <SortIcon column="id" />
                    </th>
                    <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('manufacturer')}>
                      Manufacturer / Model <SortIcon column="manufacturer" />
                    </th>
                    <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('licensePlate')}>
                      License Plate <SortIcon column="licensePlate" />
                    </th>
                    <th className="p-4 font-medium">
                      Engine / Specs
                    </th>
                    <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('mileage')}>
                      Mileage / Status <SortIcon column="mileage" />
                    </th>
                    <th className="p-4 pr-6 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {isLoading ? (
                    <tr><td colSpan="6" className="text-center p-12 text-neon-cyan">SCANNING_REGISTRY...</td></tr>
                  ) : vehicles.length === 0 ? (
                    <tr><td colSpan="6" className="text-center p-12 text-gray-500">NO UNITS FOUND MATCHING QUERY</td></tr>
                  ) : (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="p-4 pl-6 text-neon-cyan font-bold">#VEH-{vehicle.id}</td>
                        <td className="p-4">
                          <div className="text-white font-bold">{vehicle.manufacturer}</div>
                          <div className="text-xs text-gray-500">{vehicle.model}</div>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                            className="bg-gray-800 text-neon-cyan hover:bg-neon-cyan/20 hover:text-white px-3 py-1 rounded border border-gray-700 hover:border-neon-cyan font-mono text-xs tracking-widest transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,204,0)] hover:shadow-[0_0_10px_rgba(0,255,204,0.3)]"
                          >
                            {vehicle.licensePlate}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 text-xs flex items-center gap-1">
                            {vehicle.vehicleType === 'ELECTRIC' ? <Zap className="w-3 h-3 text-neon-cyan"/> : 
                             vehicle.vehicleType === 'HYBRID' ? <Leaf className="w-3 h-3 text-green-400"/> : 
                             <Fuel className="w-3 h-3 text-gray-400"/>}
                            {vehicle.engineSummary || vehicle.vehicleType}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-[11px] text-gray-300 uppercase tracking-widest font-mono mb-1">
                            {vehicle.mileage?.toLocaleString()} KM
                          </div>
                          <span className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${
                            vehicle.status === 'MAINTENANCE_REQUIRED' ? 'text-red-500' : 
                            vehicle.status === 'WARNING' ? 'text-yellow-400' : 
                            'text-neon-cyan'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              vehicle.status === 'MAINTENANCE_REQUIRED' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 
                              vehicle.status === 'WARNING' ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' : 
                              'bg-neon-cyan shadow-[0_0_8px_#00ffcc]'
                            }`}></span> 
                            {/* Afișăm textul frumos, înlocuind underscore-ul cu spațiu pentru UI */}
                            {vehicle.status ? vehicle.status.replace('_', ' ') : 'OK'}
                          </span>
                        </td>
                        
                        <td className="p-4 pr-6 text-right relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleMenu(vehicle.id); }} 
                            className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
                          >
                            <MoreVertical className="w-5 h-5 inline" />
                          </button>
                          
                          {activeMenuId === vehicle.id && (
                            <div className="absolute right-8 top-10 w-40 bg-[#12131c] border border-gray-700 rounded shadow-lg z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                              <button onClick={() => { setVehicleToEdit(vehicle); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-[10px] tracking-widest uppercase hover:bg-gray-800 text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                <Edit2 className="w-3 h-3" /> Edit Details
                              </button>
                              <div className="border-t border-gray-800"></div>
                              <button onClick={() => { setVehicleToDelete(vehicle); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-[10px] tracking-widest uppercase hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2">
                                <Trash2 className="w-3 h-3" /> Decommission
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* PAGINARE (SUBSOL TABEL) */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/20 flex justify-between items-center text-[10px] tracking-widest font-mono uppercase text-gray-500">
              <div>
                SHOWING {vehicles.length > 0 ? currentPage * 10 + 1 : 0} - {Math.min((currentPage + 1) * 10, fleetStats.totalCars || 0)} OF {fleetStats.totalCars || 0} UNITS
              </div>
              <div className="flex gap-2 items-center">
                <button 
                  disabled={currentPage === 0} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  className="px-2 py-1 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                >
                  Prev
                </button>
                
                {totalPages > 0 && [...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPage(i)} 
                    className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                      currentPage === i ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/50 font-bold" : "hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={currentPage >= totalPages - 1 || totalPages === 0} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  className="px-2 py-1 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* MODAL ADĂUGARE VEHICUL */}
        {isAddModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-[#12131c] border border-neon-pink/40 rounded-lg shadow-[0_0_30px_rgba(255,0,85,0.15)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-[#12131c] z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-wide shadow-neon-pink drop-shadow-md">Add New Vehicle</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Registry Entry: AUTO-F-{Math.floor(Math.random() * 9000) + 1000}</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleAddVehicle} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neon-cyan uppercase tracking-widest mb-2">Manufacturer</label>
                    <input type="text" required value={newVehicle.manufacturer} onChange={(e) => setNewVehicle({...newVehicle, manufacturer: e.target.value})} placeholder="e.g. Tesla" className="w-full bg-[#1c1e29] border border-gray-700 rounded p-3 text-sm focus:outline-none focus:border-neon-cyan text-white placeholder-gray-600" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neon-cyan uppercase tracking-widest mb-2">Model Class</label>
                    <input type="text" required value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})} placeholder="e.g. Model S" className="w-full bg-[#1c1e29] border border-gray-700 rounded p-3 text-sm focus:outline-none focus:border-neon-cyan text-white placeholder-gray-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neon-cyan uppercase tracking-widest mb-2">License Plate</label>
                    <input type="text" required value={newVehicle.licensePlate} onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})} placeholder="B-99-NEO" className="w-full bg-[#1c1e29] border border-gray-700 rounded p-3 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-neon-cyan text-white placeholder-gray-600 uppercase" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neon-cyan uppercase tracking-widest mb-2">Current Mileage</label>
                    <div className="relative">
                      <input type="number" required value={newVehicle.mileage} onChange={(e) => setNewVehicle({...newVehicle, mileage: e.target.value})} placeholder="0" className="w-full bg-[#1c1e29] border border-gray-700 rounded p-3 text-sm focus:outline-none focus:border-neon-cyan text-white placeholder-gray-600" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 uppercase tracking-widest">KM</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-6">
                  <label className="block text-[10px] font-bold text-neon-pink uppercase tracking-widest mb-3">Power Unit Architecture</label>
                  <div className="flex bg-gray-900 rounded border border-gray-800 p-1 gap-1">
                    {['THERMAL', 'HYBRID', 'ELECTRIC'].map(type => (
                      <button key={type} type="button" onClick={() => setNewVehicle({...newVehicle, engineType: type})} className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded transition-all duration-300 ${newVehicle.engineType === type ? 'bg-neon-pink text-black shadow-[0_0_10px_rgba(255,0,85,0.5)]' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                        {type === 'THERMAL' && <Fuel className="w-4 h-4 inline mr-2 -mt-1"/>}
                        {type === 'HYBRID' && <Leaf className="w-4 h-4 inline mr-2 -mt-1"/>}
                        {type === 'ELECTRIC' && <Zap className="w-4 h-4 inline mr-2 -mt-1"/>}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded border border-gray-800">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Horsepower (HP)</label>
                    <input type="number" value={newVehicle.horsePower} onChange={(e) => setNewVehicle({...newVehicle, horsePower: e.target.value})} placeholder="e.g. 670" className="w-full bg-[#1c1e29] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-gray-500 text-white placeholder-gray-600" />
                  </div>
                  {(newVehicle.engineType === 'ELECTRIC' || newVehicle.engineType === 'HYBRID') && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Battery Capacity (kWh)</label>
                      <input type="number" required={newVehicle.engineType === 'ELECTRIC'} value={newVehicle.batteryCapacity} onChange={(e) => setNewVehicle({...newVehicle, batteryCapacity: e.target.value})} placeholder="e.g. 100" className="w-full bg-[#1c1e29] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-gray-500 text-white placeholder-gray-600" />
                    </div>
                  )}
                  {newVehicle.engineType === 'ELECTRIC' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Max Range (KM)</label>
                      <input type="number" value={newVehicle.maxRange} onChange={(e) => setNewVehicle({...newVehicle, maxRange: e.target.value})} placeholder="e.g. 600" className="w-full bg-[#1c1e29] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-gray-500 text-white placeholder-gray-600" />
                    </div>
                  )}
                  {(newVehicle.engineType === 'THERMAL' || newVehicle.engineType === 'HYBRID') && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Displacement (CC)</label>
                        <input type="number" value={newVehicle.displacement} onChange={(e) => setNewVehicle({...newVehicle, displacement: e.target.value})} placeholder="e.g. 4332" className="w-full bg-[#1c1e29] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-gray-500 text-white placeholder-gray-600" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cylinders</label>
                        <input type="number" value={newVehicle.cylinders} onChange={(e) => setNewVehicle({...newVehicle, cylinders: e.target.value})} placeholder="e.g. 10" className="w-full bg-[#1c1e29] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-gray-500 text-white placeholder-gray-600" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Fuel Type</label>
                        <select value={newVehicle.fuelType} onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})} className="w-full bg-[#1c1e29] border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-gray-500 text-white">
                          <option value="Gasoline">Gasoline (Petrol)</option>
                          <option value="Diesel">Diesel</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between pt-4 mt-6 border-t border-gray-800">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 border border-gray-700 text-gray-400 rounded hover:bg-gray-800 hover:text-white transition-colors text-xs tracking-widest uppercase">Cancel</button>
                  <button type="submit" className="px-6 py-3 border border-neon-pink text-neon-pink rounded hover:bg-neon-pink/10 hover:shadow-[0_0_15px_rgba(255,0,85,0.3)] transition-all text-xs tracking-widest uppercase font-bold">Inject to Registry</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* MODAL EDITARE VEHICUL */}
        {vehicleToEdit && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#12131c] border border-neon-pink/30 rounded-lg shadow-[0_0_40px_rgba(255,0,85,0.1)] w-full max-w-lg overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="bg-neon-pink text-black p-1 rounded"><Edit2 className="w-4 h-4"/></span> Edit Vehicle Details
                </h2>
                <button onClick={() => setVehicleToEdit(null)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleModifyVehicle} className="p-6 space-y-6">
                <div className="bg-neon-pink/5 border border-neon-pink/20 rounded p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-pink shadow-[0_0_10px_#ff0055]"></div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">System Identification</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">{vehicleToEdit.manufacturer} {vehicleToEdit.model}</span>
                    <span className="text-neon-pink font-mono text-sm tracking-widest">{vehicleToEdit.licensePlate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Manufacturer</label>
                    <input type="text" value={vehicleToEdit.manufacturer} onChange={(e) => setVehicleToEdit({...vehicleToEdit, manufacturer: e.target.value})} className="w-full bg-[#151720] border border-gray-700 rounded p-2.5 text-sm focus:outline-none focus:border-neon-pink text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Model Class</label>
                    <input type="text" value={vehicleToEdit.model} onChange={(e) => setVehicleToEdit({...vehicleToEdit, model: e.target.value})} className="w-full bg-[#151720] border border-gray-700 rounded p-2.5 text-sm focus:outline-none focus:border-neon-pink text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">License Plate</label>
                    <input type="text" value={vehicleToEdit.licensePlate} onChange={(e) => setVehicleToEdit({...vehicleToEdit, licensePlate: e.target.value})} className="w-full bg-[#151720] border border-gray-700 rounded p-2.5 text-sm focus:outline-none focus:border-neon-pink text-white font-mono uppercase tracking-widest" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Mileage (KM)</label>
                    <input type="number" value={vehicleToEdit.mileage} onChange={(e) => setVehicleToEdit({...vehicleToEdit, mileage: e.target.value})} className="w-full bg-[#151720] border border-gray-700 rounded p-2.5 text-sm focus:outline-none focus:border-neon-pink text-white" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">System Priority Level</span>
                    <span className="text-[10px] text-neon-cyan uppercase tracking-widest font-bold">Optimal Status</span>
                  </div>
                  <div className="h-1 w-full bg-gray-800 rounded overflow-hidden flex">
                    <div className="h-full bg-neon-cyan w-3/4 shadow-[0_0_10px_#00ffcc]"></div>
                  </div>
                </div>

                <div className="flex justify-center gap-6 pt-4 mt-2">
                  <button type="button" onClick={() => setVehicleToEdit(null)} className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors text-xs tracking-widest uppercase">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 border border-neon-pink text-neon-pink rounded hover:bg-neon-pink/10 transition-colors text-xs tracking-widest uppercase font-bold shadow-[0_0_10px_rgba(255,0,85,0.2)]">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* MODAL ȘTERGERE VEHICUL */}
        {vehicleToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neon-panel border border-red-900 rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.15)] w-full max-w-md overflow-hidden">
              <div className="p-6 text-center border-b border-gray-800 relative">
                <button onClick={() => setVehicleToDelete(null)} className="absolute right-4 top-4 text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 rounded bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-red-500 w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] tracking-wide">Decommission Vehicle?</h2>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-gray-300 text-center leading-relaxed">
                  Are you sure you want to remove <span className="text-neon-cyan font-bold">{vehicleToDelete.manufacturer} {vehicleToDelete.model}</span> <span className="text-neon-cyan font-mono text-xs tracking-wider">({vehicleToDelete.licensePlate})</span> from the active fleet?
                </p>

                <div className="bg-red-950/30 border-l-2 border-red-500 p-4 rounded text-sm text-red-200">
                  <span className="font-bold text-red-500 mr-2">!</span> 
                  This action is permanent and will archive all maintenance records. The vehicle will no longer be available for AI dispatch routines.
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-yellow-400 font-bold text-sm tracking-wide">Active Service</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Distance</p>
                    <p className="text-white font-bold text-sm tracking-wide">{vehicleToDelete.mileage?.toLocaleString()} KM</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button onClick={confirmDeleteVehicle} className="flex-1 py-3 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-black transition-all text-xs tracking-widest uppercase font-bold shadow-[0_0_15px_rgba(255,0,0,0.2)]">Delete</button>
                  <button onClick={() => setVehicleToDelete(null)} className="flex-1 py-3 bg-[#1c1e29] border border-gray-700 text-gray-300 rounded hover:bg-gray-800 transition-colors text-xs tracking-widest uppercase font-bold">Keep Vehicle</button>
                </div>
                <p className="text-center text-[9px] text-gray-600 uppercase tracking-widest mt-4">Auth: Sysadmin-level override required</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;