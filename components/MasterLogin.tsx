
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';

const MasterLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(''); // For feedback/logs
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();

  // --- HARDCODED CREDENTIALS ---
  const ADMIN_1_USER = 'master@gylphcircle.com';
  const ADMIN_1_PASS = 'master123';
  
  const ADMIN_2_USER = 'admin@gylphcircle.com';
  const ADMIN_2_PASS = 'admin123';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setStatus('✅ Credentials Copied to Clipboard!');
    setTimeout(() => setStatus(''), 2000);
  };

  const checkLogin = (isTest: boolean = false) => {
    const e = email; // No trim, exact match
    const p = password; // No trim, exact match

    console.log(`[LOGIN DEBUG] Input Email: '${e}' | Input Pass: '${p}'`);

    let isValid = false;
    let role = '';

    if (e === ADMIN_1_USER && p === ADMIN_1_PASS) {
        isValid = true;
        role = 'Master Admin';
    } else if (e === ADMIN_2_USER && p === ADMIN_2_PASS) {
        isValid = true;
        role = 'Admin';
    }

    console.log(`[LOGIN DEBUG] Result: ${isValid ? 'SUCCESS' : 'FAIL'} (${role})`);

    if (isValid) {
        if (isTest) {
            alert(`✅ MATCH SUCCESS!\nUser: ${role}\nCredentials are correct.`);
        } else {
            // LOGIN SUCCESS ACTION
            localStorage.setItem('glyph_admin_session', JSON.stringify({ user: e, role: role }));
            navigate('/admin/dashboard');
        }
    } else {
        setAttempts(prev => prev + 1);
        setStatus('❌ Invalid Credentials. Check Console.');
        if (isTest) {
            alert(`❌ MATCH FAILED.\nInput: ${e} / ${p}\nExpected: ${ADMIN_1_USER} / ${ADMIN_1_PASS}`);
        }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative font-mono">
      {/* Matrix Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
      
      <Card className="w-full max-w-md bg-gray-900 border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.3)] relative z-10">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-red-500 mb-2 text-center tracking-widest">MASTER ACCESS</h1>
          <p className="text-gray-500 text-xs text-center mb-8">NO DATABASE MODE • HARDCODED ENTRY</p>

          <div className="space-y-4">
            <div>
              <label className="text-red-400 text-xs uppercase">Admin Email (Exact)</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-red-800 text-green-400 p-3 rounded focus:outline-none focus:border-red-500"
                placeholder={ADMIN_1_USER}
              />
            </div>

            <div>
              <label className="text-red-400 text-xs uppercase">Password (Exact)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-red-800 text-green-400 p-3 rounded focus:outline-none focus:border-red-500"
                placeholder="••••••••"
              />
            </div>

            {/* ERROR / STATUS MESSAGE */}
            {status && (
                <div className={`p-2 text-xs text-center font-bold border ${status.includes('✅') ? 'bg-green-900/30 text-green-400 border-green-500' : 'bg-red-900/30 text-red-400 border-red-500'}`}>
                    {status}
                </div>
            )}

            {/* FAIL SAFE */}
            {attempts >= 3 && (
                <div className="bg-yellow-900/20 border border-yellow-600 p-3 rounded text-center">
                    <p className="text-yellow-500 text-xs font-bold mb-2">⚠ AUTHENTICATION FAILURE DETECTED</p>
                    <p className="text-gray-400 text-[10px]">Use Exact Credentials:</p>
                    <div className="mt-2 bg-black p-2 rounded border border-yellow-600/30 select-all cursor-pointer text-green-400 text-xs" onClick={() => copyToClipboard(ADMIN_1_USER)}>
                        {ADMIN_1_USER}
                    </div>
                    <div className="mt-1 bg-black p-2 rounded border border-yellow-600/30 select-all cursor-pointer text-green-400 text-xs" onClick={() => copyToClipboard(ADMIN_1_PASS)}>
                        {ADMIN_1_PASS}
                    </div>
                </div>
            )}

            <Button onClick={() => checkLogin(false)} className="w-full bg-red-700 hover:bg-red-600 border-none rounded-none py-4 text-white font-bold tracking-wider">
                AUTHENTICATE
            </Button>

            {/* DEBUG TOOLS */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-800">
                <button onClick={() => checkLogin(true)} className="text-[10px] text-gray-500 hover:text-white uppercase">
                    🛠️ Test Login (Debug)
                </button>
                <button onClick={() => {
                    setEmail(ADMIN_1_USER);
                    setPassword(ADMIN_1_PASS);
                }} className="text-[10px] text-gray-500 hover:text-white uppercase">
                    📝 Autofill Master
                </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MasterLogin;
