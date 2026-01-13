
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from './shared/Card';
import Button from './shared/Button';
import ShareButton from './ShareButton';
import { Link } from 'react-router-dom';

const ReferralProgram: React.FC = () => {
  const { user } = useAuth();
  
  // Generate a deterministic but fake code for demo if not present
  const referralCode = user?.name 
    ? `${user.name.split(' ')[0].toUpperCase()}${user.id.substring(0,3)}` 
    : 'MYSTIC123';

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
  const shareText = `🌟 Uncover your destiny with Glyph Circle! Use my code ${referralCode} to get ₹10 free credits for your first reading.`;

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
             <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Sanctuary
            </Link>

            <Card className="bg-gradient-to-b from-gray-900 to-black border-amber-500/30 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                        <span className="text-4xl">🎁</span>
                    </div>

                    <h2 className="text-3xl font-cinzel font-bold text-amber-100 mb-2">Invite Friends, Get Rewards</h2>
                    <p className="text-amber-200/70 font-lora mb-8">
                        Share the mystic path. When a friend joins, you <strong className="text-amber-400">both get ₹10</strong> in credits for readings.
                    </p>

                    {/* Code Box */}
                    <div className="bg-gray-800/50 border border-amber-500/30 rounded-xl p-6 mb-8 relative group">
                        <p className="text-xs text-amber-200/50 uppercase tracking-widest mb-2">Your Unique Code</p>
                        <div className="text-3xl font-mono font-bold text-amber-400 tracking-wider select-all" onClick={() => {
                            navigator.clipboard.writeText(referralCode);
                            alert("Code copied!");
                        }}>
                            {referralCode}
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-amber-500">
                            Click to Copy
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                            <div className="text-2xl font-bold text-white">0</div>
                            <div className="text-xs text-gray-400">Friends Invited</div>
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                            <div className="text-2xl font-bold text-green-400">₹0</div>
                            <div className="text-xs text-gray-400">Credits Earned</div>
                        </div>
                    </div>

                    <ShareButton 
                        title="Join Glyph Circle" 
                        text={shareText} 
                        url={referralLink} 
                        className="w-full"
                    />

                    <p className="mt-6 text-xs text-gray-500">
                        Credits are applied automatically when your friend completes their first reading.
                        <br/>Max reward limit: ₹500 per month.
                    </p>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default ReferralProgram;
