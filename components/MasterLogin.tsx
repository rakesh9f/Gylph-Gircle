
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

    // LAYER 2: DB Admin Email Check (Pass bypass if strictly needed, here we stick to verifying role)
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

  // LAYER 4: Nuclear Reset
  const handleNuclearReset = () => {
      if(confirm("💥 RESET DATABASE? This wipes all users except admins.")) {
          dbService.nuclearReset();
          addLog("💥 DB RESET COMPLETED. Admins restored.");
      }
  };

  // LAYER 5: Force Bypass
  const handleForceLogin = () => {
      if(confirm("⚡ FORCE LOGIN? Bypassing all checks.")) {
          localStorage.setItem('glyph_admin_session', JSON.stringify({ user: 'force@admin.com', role: 'admin', method: 'LAYER 5 (Force)' }));
          navigate('/admin/dashboard');
      }
  };

  const checkDb = () => {
      const users = dbService.getAllUsers();
      addLog(`📊 DB Contains ${users.length} users:`);
      users.forEach(u => addLog(` - ${u.email} [${u.role}] pass:${u.password}`));
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg border-2 border-green-700 bg-gray-900 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center border-b border-green-900 pb-2">
           🛡️ FAILSAFE ADMIN ACCESS
        </h1>

        {/* DEBUG CONTROLS */}
        <div className="grid grid-cols-2 gap-2 mb-6">
            <button onClick={handleNuclearReset} className="bg-red-900 text-white p-2 text-xs font-bold hover:bg-red-700">
                💥 NUCLEAR DB RESET
            </button>
            <button onClick={checkDb} className="bg-blue-900 text-white p-2 text-xs font-bold hover:bg-blue-700">
                🔍 CHECK DB USERS
            </button>
            <button onClick={() => { setEmail('master@gylphcircle.com'); setPassword('master123'); }} className="bg-yellow-900 text-white p-2 text-xs font-bold hover:bg-yellow-700">
                🔑 FILL CREDS
            </button>
            <button onClick={handleForceLogin} className="bg-purple-900 text-white p-2 text-xs font-bold hover:bg-purple-700 animate-pulse">
                ⚡ FORCE ADMIN LOGIN
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
                AUTHENTICATE (LAYER 1-3)
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
