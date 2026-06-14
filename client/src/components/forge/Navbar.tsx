import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Flame, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { profile, logout, isAdmin } = useAuth();
  const location = useLocation();

  const handleLogin = () => {
    window.location.href = '/api/auth/discord';
  };

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-accent border-accent'
      : 'text-[#e8d09a] border-transparent hover:text-white hover:border-[#e8d09a]/50';
  };

  return (
    <nav className="bg-[#2c1a0e] text-[#e8d09a] border-b-4 border-[#c9952a] px-4 md:px-8 py-3 shadow-[0_4px_10px_rgba(0,0,0,0.5)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-xl md:text-2xl font-bold tracking-widest text-[#e8d09a] hover:text-[#c9952a] transition-colors"
        >
          <Flame className="w-6 h-6 text-accent fill-accent animate-pulse" />
          <span>THE FORGE</span>
        </Link>

        {profile ? (
          /* Logged In View */
          <>
            {/* Links */}
            <div className="flex flex-wrap justify-center gap-1 md:gap-4 font-heading text-xs md:text-sm tracking-widest">
              <Link
                to="/orders"
                className={`px-3 py-1 border-b-2 transition-all duration-200 ${isActive('/orders')}`}
              >
                MY ORDERS
              </Link>
              <Link
                to="/"
                className={`px-3 py-1 border-b-2 transition-all duration-200 ${isActive('/')}`}
              >
                SUBMIT REQUEST
              </Link>
              
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-1 border-b-2 transition-all duration-200 ${isActive('/admin')}`}
                  >
                    ADMIN DASHBOARD
                  </Link>
                  <Link
                      to="/admin/members"
                      className={`px-3 py-1 border-b-2 transition-all duration-200 ${isActive('/admin/members')}`}
                  >
                    Members
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`px-3 py-1 border-b-2 transition-all duration-200 ${isActive('/admin/users')}`}
                  >
                    Users
                  </Link>
                </>
              )}
            </div>

            {/* Profile / Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#1c0f07] py-1 px-3 border border-[#c9952a]/30 rounded-sm">
                {profile.avatar && (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-6 h-6 rounded-full border border-accent"
                  />
                )}
                <span className="text-xs font-semibold tracking-wider">{profile.username}</span>
                <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-widest">
                  {profile.role}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1 font-heading text-xs tracking-widest text-[#e8d09a] hover:text-primary transition-colors hover:scale-[1.02] active:scale-[0.98] bg-transparent border-none cursor-pointer"
                title="Log Out of the Guild"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">LEAVE</span>
              </button>
            </div>
          </>
        ) : (
          /* Guest View */
          <div className="flex items-center gap-3">
            <span className="text-xs italic text-[#e8d09a]/70 font-body hidden sm:inline">
              "Sign in to track thy ledger commissions"
            </span>
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#c9952a] text-[#1a0f00] font-heading text-xs tracking-widest font-bold rounded-sm hover:scale-[1.02] hover:bg-white transition-all shadow-[1px_2px_4px_rgba(0,0,0,0.3)] cursor-pointer border-none"
            >
              <LogIn className="w-3.5 h-3.5" />
              LOGIN WITH DISCORD
            </button>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
