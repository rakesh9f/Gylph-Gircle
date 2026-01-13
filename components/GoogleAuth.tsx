
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useAuth } from '../context/AuthContext';

const GoogleAuth: React.FC = () => {
  const { googleLogin } = useAuth();

  const handleSuccess = (credentialResponse: any) => {
    try {
        if (credentialResponse.credential) {
            const decoded: any = jwtDecode(credentialResponse.credential);
            console.log("Google Login Success:", decoded);
            googleLogin(decoded.email, decoded.name, decoded.sub);
        }
    } catch (error) {
        console.error("Google Auth Error:", error);
    }
  };

  const handleError = () => {
    console.log('Google Login Failed');
    alert('Google Login Failed. Please try again or use the simulation button.');
  };

  // Simulation mode for Preview environments where real Google Client ID might not be valid
  const simulateGoogleLogin = () => {
      // Simulate Rakesh login (Admin) or generic user
      const isRakesh = confirm("Simulate 'rakesh9f@gmail.com' (Admin)? Cancel for generic user.");
      const email = isRakesh ? 'rakesh9f@gmail.com' : 'test.user@gmail.com';
      const name = isRakesh ? 'Rakesh F' : 'Test Google User';
      const sub = 'google-mock-id-' + Date.now();
      
      console.log(`[DEV] Simulating Google Login for ${email}`);
      googleLogin(email, name, sub);
  };

  return (
    <div className="w-full flex flex-col gap-2 items-center justify-center">
        <div className="w-full flex justify-center overflow-hidden rounded-lg">
             <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="filled_black"
                shape="pill"
                width="300" 
             />
        </div>
        
        {/* Developer / Preview Fallback */}
        <button 
            type="button"
            onClick={simulateGoogleLogin}
            className="text-xs text-amber-500/50 hover:text-amber-500 underline mt-1"
        >
            (Dev) Simulate Google Login
        </button>
    </div>
  );
};

export default GoogleAuth;
