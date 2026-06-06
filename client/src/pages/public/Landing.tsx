import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Flame, MessageSquare, ShieldAlert } from 'lucide-react';

export const Landing: React.FC = () => {
  const { user, profile, loading, isMember, isPendingAccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile && isMember) {
      navigate('/orders');
    }
  }, [user, profile, loading, isMember, navigate]);

  const handleLogin = () => {
    window.location.href = '/api/auth/discord';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-heading text-xl text-primary">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <span className="text-5xl animate-bounce">🔥</span>
          <span>Stoking the Forge...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Repeating noise/parchment background filter effect */}
      <div className="absolute inset-0 bg-[#f4e4bc] opacity-90 pointer-events-none" />
      
      {/* Decorative Border Frame */}
      <div className="absolute inset-4 border-2 border-border/60 pointer-events-none rounded-sm" />
      <div className="absolute inset-6 border border-dashed border-border/30 pointer-events-none rounded-sm" />

      {/* Main Card */}
      <div
        className="w-full max-w-lg bg-card text-card-foreground p-8 md:p-12 relative z-10 border-2 border-border shadow-[4px_6px_20px_rgba(58,35,12,0.3)] text-center flex flex-col items-center"
        style={{
          borderRadius: '4px 8px 6px 9px',
        }}
      >
        {/* Decorative corner ornaments */}
        <div className="absolute top-2 left-2 text-border font-heading text-xl">✥</div>
        <div className="absolute top-2 right-2 text-border font-heading text-xl">✥</div>
        <div className="absolute bottom-2 left-2 text-border font-heading text-xl">✥</div>
        <div className="absolute bottom-2 right-2 text-border font-heading text-xl">✥</div>

        <div className="mb-6 relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center shadow-inner">
            <Flame className="w-12 h-12 text-primary fill-primary animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground px-2 py-0.5 text-[10px] tracking-widest font-heading border border-border rounded-sm">
            EST. 2026
          </div>
        </div>

        <h1 className="font-heading text-4xl font-extrabold tracking-widest text-[#1a0f00] mb-2">
          THE FORGE
        </h1>
        <div className="w-32 h-1.5 bg-primary mx-auto mb-6 relative">
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="bg-background w-3 h-3 rotate-45 border border-primary" />
          </div>
        </div>

        {isPendingAccess ? (
          <div className="flex flex-col items-center animate-fade-in w-full">
            <ShieldAlert className="w-12 h-12 text-primary mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2">Awaiting Access</h2>
            <p className="text-sm italic text-muted-foreground mb-6 max-w-sm">
              "Thy name has been inscribed in the ledger, traveler. An Elder Artisan (Admin) must grant thee access before thy request may be forged."
            </p>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-sm text-xs text-muted-foreground w-full mb-6 text-left">
              <span className="font-bold text-foreground">Discord User:</span> {user?.displayName || profile?.username}<br />
              <span className="font-bold text-foreground">ID:</span> {profile?.discordId}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground font-heading tracking-widest text-sm rounded-sm hover:scale-[1.02] hover:bg-primary/95 transition-all shadow-[2px_3px_6px_rgba(0,0,0,0.3)] active:scale-[0.98]"
            >
              REFRESH LEDGER
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <p className="text-md italic text-muted-foreground mb-8 max-w-md">
              "Enter the Guildhall to submit thy requests for weapons, armour, potions, and scroll crafts. Track thy order status from forge to delivery."
            </p>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 px-8 py-3 bg-[#5865F2] text-white hover:bg-[#4752C4] font-heading tracking-widest text-sm rounded-sm transition-all duration-200 transform hover:scale-[1.02] shadow-[2px_3px_8px_rgba(0,0,0,0.35)] active:scale-[0.98]"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              LOGIN WITH DISCORD
            </button>

            <div className="mt-8 text-[11px] text-muted-foreground tracking-wider font-heading border-t border-border/20 pt-4 w-full">
              SECURED VIA DISCORD OAUTH & FIREBASE CUSTOM AUTH
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
