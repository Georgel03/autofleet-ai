import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, BarChart3, LogOut, Bell, Settings, Server, BrainCircuit, Satellite, Wrench, ShieldAlert, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axiosConfig'; 

const Analytics = () => {
  const navigate = useNavigate();
  
  // Starea care va ține datele reale de la Spring Boot
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        setData(response.data);
      } catch (error) {
        console.error("Eroare la aducerea datelor analitice:", error);
        if (error.response?.status === 403) handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0f] border border-neon-pink p-3 rounded-lg shadow-[0_0_15px_rgba(255,0,85,0.3)]">
          <p className="text-neon-cyan font-bold font-mono uppercase tracking-widest text-[10px] mb-1">{label} CYCLE</p>
          <p className="text-white font-bold text-lg">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-neon-cyan font-mono animate-pulse">AGGREGATING_TELEMETRY_DATA...</div>;
  }

  // --- CALCULE PENTRU BARELE VIZUALE ---
  // Găsim cea mai scumpă mașină pentru a seta lățimea barei albastre (la 100%)
  const maxVehicleCost = data?.topVehicles.length > 0 ? Math.max(...data.topVehicles.map(v => v.value)) : 1;
  
  // Extragem valorile pentru motorizări și calculăm maximul pentru a scala înălțimea barelor
  const getAvgCost = (type) => data?.powertrainCosts.find(p => p.type === type)?.avgCost || 0;
  const thermalCost = getAvgCost("Thermal");
  const hybridCost = getAvgCost("Hybrid");
  const electricCost = getAvgCost("Electric");
  const maxPowertrainCost = Math.max(thermalCost, hybridCost, electricCost, 1);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300 flex font-mono">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-gray-800 bg-[#0a0a0f] flex flex-col z-20 shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-neon-pink flex items-center gap-2 tracking-wider">
            <Car className="w-6 h-6" /> AutoFleet AI
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Terminal 01</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-gray-900 rounded uppercase text-xs tracking-wider transition-colors text-left">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-gray-900 rounded uppercase text-xs tracking-wider transition-colors text-left">
            <Car className="w-4 h-4" /> Fleet Status
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-neon-pink/10 text-neon-pink border-l-2 border-neon-pink rounded-r uppercase text-xs tracking-wider font-bold text-left">
            <BarChart3 className="w-4 h-4" /> Analytics
          </button>
        </nav>

        <div className="p-6">
          <button className="w-full border border-neon-pink text-neon-pink py-3 rounded text-xs tracking-widest uppercase hover:bg-neon-pink hover:text-black transition-colors font-bold shadow-[0_0_10px_rgba(255,0,85,0.1)]">
            Generate Report
          </button>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-neon-pink transition-colors text-xs uppercase tracking-wider w-full">
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]">
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0a0a0f]/90 backdrop-blur z-10">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors">Registry</button>
            <h2 className="text-neon-pink text-xs tracking-widest uppercase font-bold border-b-2 border-neon-pink pb-1">Maintenance Analytics</h2>
            <button className="text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors">AI Health Predictions</button>
          </div>
          <div className="flex items-center gap-6">
            <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <Settings className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan font-bold text-xs shadow-[0_0_10px_rgba(0,255,204,0.2)]">AD</div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1 max-w-7xl mx-auto w-full space-y-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white tracking-wider flex items-center gap-4">
              FLEET EXPENDITURE 
              <div className="h-1.5 w-24 bg-neon-pink rounded shadow-[0_0_10px_#ff0055]"></div>
            </h1>
            <p className="text-neon-cyan text-xs tracking-widest uppercase mt-2 font-bold">Sector 7 — Historical Maintenance Costs & Predictions</p>
          </div>

          {/* MAIN GRAPH (Recharts AREA CHART) conectat la DB */}
          <div className="bg-[#12131c] border border-gray-800 rounded-xl p-6 relative">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2"><Wrench className="w-5 h-5 text-neon-pink"/> Maintenance Expenditure Over Time</h3>
                <p className="text-[10px] text-gray-500 tracking-widest uppercase">Aggregated Repair Costs (USD) per Month</p>
              </div>
              <span className="bg-neon-pink/10 border border-neon-pink text-neon-pink text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded flex items-center gap-2">
                <Activity className="w-3 h-3 animate-pulse" /> Live Aggregation
              </span>
            </div>
            
            <div className="h-[280px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyCosts || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff0055" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ff0055" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} dy={10} />
                  <Area type="monotone" dataKey="cost" stroke="#ff0055" strokeWidth={4} fillOpacity={1} fill="url(#colorCost)" activeDot={{ r: 6, fill: '#00ffcc', stroke: '#00ffcc', strokeWidth: 2, shadow: '0 0 10px #00ffcc' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 pointer-events-none z-0 flex flex-col justify-between pt-24 pb-12 px-6">
              <div className="border-b border-gray-800/50 w-full"></div>
              <div className="border-b border-gray-800/50 w-full"></div>
              <div className="border-b border-gray-800/50 w-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            
            {/* TOP 5 EXPENSIVE VEHICLES conectat la DB */}
            <div className="bg-[#12131c] border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-neon-cyan/50 transition-colors">
              <h3 className="text-white font-bold text-lg flex items-center gap-2"><Car className="w-5 h-5 text-neon-cyan"/> Highest Maintenance Cost</h3>
              <p className="text-[10px] text-neon-cyan tracking-widest uppercase mb-8">Performance Index: Lifetime Cost (USD)</p>
              
              <div className="space-y-5">
                {data?.topVehicles.length === 0 && <p className="text-gray-500 text-xs">NO MAINTENANCE RECORDS FOUND</p>}
                {data?.topVehicles.map((vehicle, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-[10px] tracking-widest uppercase mb-1.5 font-bold">
                      <span className="text-gray-400 group-hover:text-white transition-colors">{vehicle.name}</span>
                      <span className="text-neon-cyan">${vehicle.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-900 rounded overflow-hidden border border-gray-800">
                      {/* Lățimea calculată dinamic în procente */}
                      <div className="h-full bg-neon-cyan shadow-[0_0_8px_#00ffcc]" style={{ width: `${(vehicle.value / maxVehicleCost) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AVG COST BY ENGINE TYPE conectat la DB */}
            <div className="bg-[#12131c] border border-gray-800 rounded-xl p-6 relative overflow-hidden flex flex-col group hover:border-yellow-400/50 transition-colors">
              <ShieldAlert className="absolute -right-6 -top-6 w-48 h-48 text-gray-800/10 -rotate-12 group-hover:text-yellow-400/5 transition-colors" />
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400"/> Cost by Powertrain</h3>
                <p className="text-[10px] text-yellow-400 tracking-widest uppercase mb-12">Average Repair Cost per Architecture</p>
              </div>

              <div className="flex-1 flex items-end gap-6 pb-8 z-10 h-40">
                {/* THERMAL */}
                <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                  <span className="text-xs font-bold text-white">${thermalCost.toLocaleString()}</span>
                  <div className="w-full bg-yellow-400 rounded-t shadow-[0_0_10px_rgba(250,204,21,0.4)] transition-all" 
                       style={{ height: `${Math.max((thermalCost / maxPowertrainCost) * 100, 5)}%` }}></div>
                  <span className="text-[10px] text-gray-500 tracking-widest uppercase font-bold">Thermal</span>
                </div>
                {/* HYBRID */}
                <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                  <span className="text-xs font-bold text-white">${hybridCost.toLocaleString()}</span>
                  <div className="w-full bg-yellow-400/70 rounded-t shadow-[0_0_10px_rgba(250,204,21,0.2)] transition-all" 
                       style={{ height: `${Math.max((hybridCost / maxPowertrainCost) * 100, 5)}%` }}></div>
                  <span className="text-[10px] text-gray-500 tracking-widest uppercase font-bold">Hybrid</span>
                </div>
                {/* ELECTRIC */}
                <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                  <span className="text-xs font-bold text-neon-cyan">${electricCost.toLocaleString()}</span>
                  <div className="w-full bg-neon-cyan rounded-t shadow-[0_0_10px_rgba(0,255,204,0.4)] transition-all" 
                       style={{ height: `${Math.max((electricCost / maxPowertrainCost) * 100, 5)}%` }}></div>
                  <span className="text-[10px] text-neon-cyan tracking-widest uppercase font-bold">Electric</span>
                </div>
              </div>

              <div className="mt-auto z-10 border-t border-gray-800 pt-4">
                <p className="text-gray-400 text-[10px] tracking-widest font-mono uppercase flex items-center justify-between">
                  <span>Insight Generated:</span>
                  <span className="text-neon-cyan">{(thermalCost > electricCost && electricCost > 0) ? `EVs cost ${Math.round(((thermalCost - electricCost) / thermalCost) * 100)}% less to maintain` : 'Analyzing Data...'}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#12131c] border border-gray-800 rounded-xl p-6 flex items-center justify-between mt-4">
            <div>
              <h3 className="text-white font-bold text-xl flex items-center gap-3">
                REAL-TIME SYSTEM STATUS
                <div className="w-2.5 h-2.5 bg-neon-cyan rounded-full shadow-[0_0_10px_#00ffcc] animate-pulse"></div>
              </h3>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-1">Global Fleet Intelligence Network</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-black/30 border border-gray-800 p-4 rounded-lg flex items-center gap-4 w-48">
                <Server className="text-neon-cyan w-8 h-8" />
                <div>
                  <p className="text-[9px] text-gray-500 tracking-widest uppercase">Database Load</p>
                  <p className="text-xl font-bold text-white">12%</p>
                </div>
              </div>
              <div className="bg-black/30 border border-gray-800 p-4 rounded-lg flex items-center gap-4 w-48">
                <BrainCircuit className="text-neon-pink w-8 h-8" />
                <div>
                  <p className="text-[9px] text-gray-500 tracking-widest uppercase">AI Data Sync</p>
                  <p className="text-xl font-bold text-white">99.9%</p>
                </div>
              </div>
              <div className="bg-black/30 border border-yellow-400/30 p-4 rounded-lg flex items-center gap-4 w-48 shadow-[0_0_15px_rgba(250,204,21,0.05)]">
                <Satellite className="text-yellow-400 w-8 h-8" />
                <div>
                  <p className="text-[9px] text-gray-500 tracking-widest uppercase">Telemetry Link</p>
                  <p className="text-xl font-bold text-yellow-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;