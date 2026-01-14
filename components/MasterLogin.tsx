
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';

const MasterLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  const addLog = (msg: string) => setLogs(p => [msg, ...p]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    addLog(`🔒 Authenticating: ${email}`);

    let success = false;
    let method = "Unknown";

    // LAYER 1: DB Exact Match
    const dbUser = dbService.validateUser(email, password);
    if (dbUser && dbUser.role === 'admin') {
        success = true;
        method = "LAYER 1 (DB Match)";
    }

    // LAYER 2: DB Admin Email Check
    if (!success) {
        const adminUser = dbService.getAdminByEmail(email);
        if (adminUser && password === 'master123') { // Fallback pass check
             success = true;
             method = "LAYER 2 (Email Match)";
        }
    }

    // LAYER 3: Hardcoded Fallback
    if (!success) {
        if (email === 'master@gylphcircle.com' && password === 'master123') {
            success = true;
            method = "LAYER 3 (Hardcoded String)";
        }
    }

    if (success) {
        addLog(`✅ SUCCESS via ${method}`);
        localStorage.setItem('glyph_admin_session', JSON.stringify({ user: email, role: 'admin', method }));
        setTimeout(() => navigate('/admin/dashboard'), 500);
    } else {
        addLog("❌ FAILED: Invalid credentials");
    }
  };

  const handleNuclearReset = () => {
      if(confirm("💥 RESET DATABASE? This wipes all users except admins.")) {
          dbService.nuclearReset();
          addLog("💥 DB RESET COMPLETED. Admins restored.");
      }
  };

  const fillCreds = (user: string, pass: string) => {
      setEmail(user);
      setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg border-2 border-green-700 bg-gray-900 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center border-b border-green-900 pb-2">
           🛡️ FAILSAFE ADMIN ACCESS
        </h1>
        
        <div className="mb-4 bg-black/40 p-3 rounded border border-green-900/50 text-xs">
            <p className="mb-2 font-bold text-green-400">AVAILABLE ACCOUNTS:</p>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => fillCreds('master@gylphcircle.com', 'master123')}
                    className="text-left hover:bg-green-900/20 p-1 rounded"
                >
                    1. master@gylphcircle.com
                    <br/><span className="opacity-50">Pass: master123</span>
                </button>
                <button 
                    onClick={() => fillCreds('admin@gylphcircle.com', 'admin123')}
                    className="text-left hover:bg-green-900/20 p-1 rounded"
                >
                    2. admin@gylphcircle.com
                    <br/><span className="opacity-50">Pass: admin123</span>
                </button>
            </div>
        </div>

        {/* DEBUG CONTROLS */}
        <div className="grid grid-cols-2 gap-2 mb-6">
            <button onClick={handleNuclearReset} className="bg-red-900 text-white p-2 text-xs font-bold hover:bg-red-700">
                💥 NUCLEAR DB RESET
            </button>
            <button onClick={() => {
                const users = dbService.getAllUsers();
                addLog(`📊 DB Contains ${users.length} users:`);
                users.forEach(u => addLog(` - ${u.email} [${u.role}]`));
            }} className="bg-blue-900 text-white p-2 text-xs font-bold hover:bg-blue-700">
                🔍 CHECK DB USERS
            </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <input 
                className="w-full bg-black border border-green-800 p-3 text-white focus:border-green-400 outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter Admin Email"
            />
            <input 
                type="password"
                className="w-full bg-black border border-green-800 p-3 text-white focus:border-green-400 outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter Password"
            />
            <button className="w-full bg-green-700 hover:bg-green-600 text-black font-bold py-3 uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                Authenticate
            </button>
        </form>

        <div className="mt-6 bg-black border border-gray-700 p-2 h-40 overflow-y-auto text-[10px]">
            {logs.length === 0 && <span className="text-gray-600">System Ready...</span>}
            {logs.map((log, i) => <div key={i} className="mb-1 border-b border-gray-900 pb-1">{log}</div>)}
        </div>
      </div>
    </div>
  );
};

export default MasterLogin;
