
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { hashData, MASTER_HASH } from '../services/security';

const MasterLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  const addLog = (msg: string) => setLogs(p => [msg, ...p]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    addLog(`🔑 Authenticating ${email}...`);

    let success = false;
    let method = '';

    // 1. CHECK DB (Preferred)
    const user = await dbService.validateUser(email, password);
    if (user && user.role === 'admin') {
        success = true;
        method = 'Database';
    }

    // 2. CHECK HARDCODED FALLBACK (If DB fails)
    if (!success) {
        const hash = await hashData(password);
        if (email === 'master@gylphcircle.com' && hash === MASTER_HASH) {
            success = true;
            method = 'Hardcoded Hash';
            addLog('⚠️ DB Check Failed. Used Hash Fallback.');
        }
    }

    // 3. FORCE STRING MATCH (Emergency Only)
    if (!success) {
        if (email === 'master@gylphcircle.com' && password === 'master123') {
            success = true;
            method = 'Emergency String Match';
            addLog('⚠️⚠️ HASH Check Failed. Used String Match.');
        }
    }

    if (success) {
        addLog(`✅ LOGIN SUCCESS via ${method}`);
        localStorage.setItem('glyph_admin_session', JSON.stringify({ 
            user: email, 
            role: 'admin',
            method 
        }));
        setTimeout(() => navigate('/admin/dashboard'), 500);
    } else {
        addLog('❌ All Authentication Methods Failed');
        alert("Login Failed");
    }
  };

  // --- EMERGENCY FORCE LOGIN ---
  const forceBypass = () => {
      if(!confirm("⚠️ FORCE ADMIN ACCESS?\n\nUse this only if everything else fails.")) return;
      
      localStorage.setItem('glyph_admin_session', JSON.stringify({ 
          user: 'force@admin.com', 
          role: 'admin',
          method: 'FORCE_BYPASS' 
      }));
      navigate('/admin/dashboard');
  };

  const checkDb = () => {
      const admins = dbService.getAllUsers().filter(u => u.role === 'admin');
      addLog(`📊 Found ${admins.length} Admins in DB`);
      admins.forEach(a => addLog(`User: ${a.email}`));
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg border-2 border-green-700 bg-gray-900 p-6 shadow-2xl">
            <h1 className="text-xl font-bold mb-4 text-center border-b border-green-900 pb-2">
                🛡️ TRIPLE-FALLBACK AUTH
            </h1>
            
            <div className="flex gap-2 mb-6 justify-center">
                <button onClick={checkDb} className="bg-blue-900 px-3 py-1 text-xs border border-blue-500 text-blue-200">
                    🔍 CHECK DB
                </button>
                <button onClick={forceBypass} className="bg-red-900 px-3 py-1 text-xs border border-red-500 text-red-200">
                    ⚡ FORCE LOGIN
                </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <input 
                    className="w-full bg-black border border-green-800 p-3 text-white focus:border-green-400 outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="master@gylphcircle.com"
                />
                <input 
                    type="password"
                    className="w-full bg-black border border-green-800 p-3 text-white focus:border-green-400 outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="master123"
                />
                <button className="w-full bg-green-700 hover:bg-green-600 text-black font-bold py-3">
                    AUTHENTICATE
                </button>
            </form>

            <div className="mt-6 bg-black border border-gray-700 p-2 h-32 overflow-y-auto text-[10px]">
                {logs.length === 0 && <span className="text-gray-600">Waiting...</span>}
                {logs.map((log, i) => <div key={i} className="mb-1 border-b border-gray-900 pb-1">{log}</div>)}
            </div>
        </div>
    </div>
  );
};

export default MasterLogin;
