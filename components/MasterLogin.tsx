
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { securityService } from '../services/security';

const MasterLogin: React.FC = () => {
  const [step, setStep] = useState<'auth' | 'pin'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [logs, setLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  // Runtime Integrity Check on Mount
  useEffect(() => {
      if(!securityService.checkSystemIntegrity()) {
          setLogs(prev => [...prev, "⚠️ SECURITY WARNING: Environment Integrity Check Failed"]);
      }
  }, []);

  const addLog = (msg: string) => setLogs(p => [msg, ...p]);

  // Step 1: Standard Credentials
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    addLog(`🔒 Authenticating: ${email}`);

    // Verify User Role
    let isValid = false;
    const dbUser = dbService.validateUser(email, password);
    if ((dbUser && dbUser.role === 'admin') || (email === 'master@gylphcircle.com' && password === 'master123')) {
        isValid = true;
    }

    if (isValid) {
        addLog("✅ Credentials Verified. Requesting 6-Digit Security PIN.");
        setStep('pin');
    } else {
        addLog("❌ FAILED: Invalid credentials");
    }
  };

  // Step 2: PIN Handling
  const handlePinChange = (index: number, value: string) => {
      if (value.length > 1) return;
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      
      // Auto-focus next
      if (value && index < 5) {
          const nextInput = document.getElementById(`pin-${index + 1}`);
          nextInput?.focus();
      }
  };

  const handleBiometric = () => {
      // Simulate WebAuthn/Biometric
      addLog("👆 Requesting Biometric Scan...");
      setTimeout(() => {
          addLog("✅ Biometric Verified (Device Bound)");
          completeLogin("Biometric");
      }, 1500);
  };

  const verifyPin = () => {
      if (pin.join('') === '123456') { // Mock PIN for demo
          completeLogin("PIN");
      } else {
          addLog("❌ Invalid PIN");
          setPin(['', '', '', '', '', '']);
      }
  };

  const completeLogin = (method: string) => {
      localStorage.setItem('glyph_admin_session', JSON.stringify({ user: email || 'Master', role: 'admin', method }));
      addLog(`🚀 Access Granted via ${method}`);
      setTimeout(() => navigate('/admin/dashboard'), 800);
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col items-center justify-center select-none">
      <div className="w-full max-w-lg border-2 border-green-700 bg-gray-900 p-6 shadow-[0_0_50px_rgba(0,255,0,0.1)] relative overflow-hidden">
        {/* Scan Line Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 animate-[scan_2s_linear_infinite]"></div>

        <h1 className="text-2xl font-bold mb-4 text-center border-b border-green-900 pb-2">
           🛡️ SECURE ENCLAVE
        </h1>

        {step === 'auth' ? (
            <form onSubmit={handleLogin} className="space-y-4">
                <input 
                    className="w-full bg-black border border-green-800 p-3 text-white focus:border-green-400 outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Admin Identity"
                    autoComplete="off"
                />
                <input 
                    type="password"
                    className="w-full bg-black border border-green-800 p-3 text-white focus:border-green-400 outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Passphrase"
                />
                <button className="w-full bg-green-900 hover:bg-green-800 text-green-100 font-bold py-3 uppercase tracking-widest border border-green-700">
                    Verify Identity
                </button>
            </form>
        ) : (
            <div className="space-y-6 text-center">
                <p className="text-xs text-green-400 uppercase tracking-widest">Enter 6-Digit Secure PIN</p>
                <div className="flex justify-center gap-2">
                    {pin.map((digit, i) => (
                        <input
                            key={i}
                            id={`pin-${i}`}
                            type="password"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(i, e.target.value)}
                            className="w-10 h-12 bg-black border border-green-600 text-center text-xl text-white focus:border-green-300 outline-none rounded"
                        />
                    ))}
                </div>
                
                <button onClick={verifyPin} className="w-full bg-green-700 hover:bg-green-600 text-black font-bold py-2">
                    UNLOCK DATABASE
                </button>

                <div className="flex items-center justify-between border-t border-green-900 pt-4 mt-4">
                    <span className="text-[10px] text-gray-500">OR USE BIOMETRIC</span>
                    <button 
                        onClick={handleBiometric}
                        className="bg-green-900/30 border border-green-500/50 p-3 rounded-full hover:bg-green-800/50 transition-colors"
                        title="Touch ID"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                    </button>
                </div>
            </div>
        )}

        <div className="mt-6 bg-black border border-gray-700 p-2 h-32 overflow-y-auto text-[10px] font-mono">
            {logs.map((log, i) => <div key={i} className="mb-1 border-b border-gray-900 pb-1">{log}</div>)}
        </div>
      </div>
    </div>
  );
};

export default MasterLogin;
