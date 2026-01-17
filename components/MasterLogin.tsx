
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

const MasterLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const addLog = (msg: string) => setLogs(p => [msg, ...p]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    addLog(`🔒 Initiating Secure Login for: ${email}`);

    try {
        // 1. Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            addLog(`❌ Auth Failed: ${error.message}`);
            setIsLoading(false);
            return;
        }

        if (data.user) {
            addLog("✅ Credentials Verified. Checking Permissions...");
            
            // 2. Check User Role in Public Table
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError || !profile) {
                addLog("❌ Profile Access Error. Login Denied.");
                await supabase.auth.signOut();
            } else if (profile.role !== 'admin') {
                addLog("⛔ ACCESS DENIED: User is not an Administrator.");
                await supabase.auth.signOut();
            } else {
                addLog("🚀 Access Granted. Redirecting to Sanctum...");
                // Force auth context refresh to update state
                await refreshUser();
                setTimeout(() => navigate('/admin/dashboard'), 800);
            }
        }
    } catch (err: any) {
        addLog(`❌ Critical Error: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col items-center justify-center select-none">
      <div className="w-full max-w-lg border-2 border-green-700 bg-gray-900 p-6 shadow-[0_0_50px_rgba(0,255,0,0.1)] relative overflow-hidden">
        {/* Scan Line Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 animate-[scan_2s_linear_infinite]"></div>

        <h1 className="text-2xl font-bold mb-4 text-center border-b border-green-900 pb-2">
           🛡️ SECURE ENCLAVE
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
            <input 
                className="w-full bg-black border border-green-800 p-3 text-white focus:border-green-400 outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Admin Identity"
                autoComplete="off"
                disabled={isLoading}
            />
            <input 
                type="password"
                className="w-full bg-black border border-green-800 p-3 text-white focus:border-green-400 outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Passphrase"
                disabled={isLoading}
            />
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-900 hover:bg-green-800 text-green-100 font-bold py-3 uppercase tracking-widest border border-green-700 disabled:opacity-50"
            >
                {isLoading ? "VERIFYING..." : "AUTHENTICATE"}
            </button>
        </form>

        <div className="mt-6 bg-black border border-gray-700 p-2 h-32 overflow-y-auto text-[10px] font-mono">
            {logs.map((log, i) => <div key={i} className="mb-1 border-b border-gray-900 pb-1">{log}</div>)}
        </div>
      </div>
    </div>
  );
};

export default MasterLogin;
