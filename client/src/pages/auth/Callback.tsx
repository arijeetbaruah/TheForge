import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { ShieldAlert } from 'lucide-react';

export const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('token');

      if (!token) {
        setError('Token was not found in the redirect parameters.');
        return;
      }

      try {
        // Clear hash from URL for security
        window.history.replaceState(null, '', window.location.pathname);
        
        await signInWithCustomToken(auth, token);
        navigate('/');
      } catch (err: any) {
        console.error('Error establishing custom token session:', err);
        setError(err.message || 'Failed to authenticate with the Guild ledger.');
      }
    };

    handleAuth();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="absolute inset-4 border-2 border-border/60 pointer-events-none rounded-sm" />
        <div className="w-full max-w-md bg-card border-2 border-border p-8 rounded-sm shadow-[4px_6px_20px_rgba(58,35,12,0.3)] flex flex-col items-center">
          <ShieldAlert className="w-16 h-16 text-primary mb-4" />
          <h2 className="font-heading text-2xl font-bold mb-2">Guild Auth Error</h2>
          <p className="text-sm italic text-muted-foreground mb-6">
            "{error}"
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 bg-primary text-primary-foreground font-heading tracking-widest text-sm rounded-sm hover:scale-[1.02] hover:bg-primary/95 transition-all shadow-[2px_3px_6px_rgba(0,0,0,0.3)]"
          >
            RETURN TO GUILDHALL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center select-none">
      <div className="absolute inset-4 border-2 border-border/60 pointer-events-none rounded-sm" />
      <div className="animate-pulse flex flex-col items-center gap-4 font-heading text-primary">
        <span className="text-5xl animate-bounce">📜</span>
        <span className="text-xl">Inscribing Guild Seals...</span>
      </div>
    </div>
  );
};

export default Callback;
