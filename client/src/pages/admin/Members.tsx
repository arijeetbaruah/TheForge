import React from 'react';
import { useUsers, useUpdateUserRole } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, Users, ArrowUp, ArrowDown } from 'lucide-react';

export const Members: React.FC = () => {
  const { data: users, isLoading, error } = useUsers();
  const { profile: currentUser } = useAuth();
  const updateRoleMutation = useUpdateUserRole();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-heading text-xl text-primary p-6">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <span className="text-5xl animate-spin">⚙️</span>
          <span>Deciphering Roll of Names...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-card border-2 border-border text-center rounded-sm">
        <h2 className="font-heading text-2xl text-primary mb-4">Roll retrieval failure</h2>
        <p className="italic text-muted-foreground">"The scrolls containing the name lists were locked by a spell."</p>
      </div>
    );
  }

  const handleRoleUpdate = (uid: string, newRole: 'USER' | 'MEMBER' | 'ADMIN') => {
    if (uid === currentUser?.uid) {
      alert('Artisan, thou cannot alter thine own station!');
      return;
    }

    const confirmMsg =
      newRole === 'MEMBER'
        ? 'Promote this traveler to Guild Member, granting them the ability to commission crafts?'
        : 'Demote this member back to basic Traveler, stripping them of crafting privileges?';

    if (window.confirm(confirmMsg)) {
      updateRoleMutation.mutate({ uid, role: newRole });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Header */}
      <div className="mb-10 border-b border-border/30 pb-6">
        <h1 className="font-heading text-3xl font-bold tracking-widest text-[#1a0f00] flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          THE GUILD ROLL OF NAMES
        </h1>
        <p className="text-sm italic text-muted-foreground mt-1">
          "Manage access rights and promotion. Travelers (USER) must be elevated to Members (MEMBER) to commission the forge."
        </p>
      </div>

      {/* Members List Ledger */}
      <div className="bg-card border-2 border-border shadow-[3px_4px_10px_rgba(58,35,12,0.2)] rounded-sm relative overflow-hidden">
        <div className="absolute inset-0.5 border border-dashed border-border/40 pointer-events-none rounded-sm" />

        <div className="divide-y divide-border/30 relative z-10">
          {(users || []).map((user) => {
            const isSelf = user.uid === currentUser?.uid;
            const isTargetAdmin = user.role === 'ADMIN';

            return (
              <div
                key={user.uid}
                className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-[#e8d09a]/10 transition-colors"
              >
                {/* User info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-12 h-12 rounded-full border border-border shadow-[1px_2px_4px_rgba(0,0,0,0.2)]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#2c1a0e] text-[#e8d09a] flex items-center justify-center font-heading font-bold border border-border">
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                      {user.username}
                      {isSelf && (
                        <span className="text-[9px] font-heading tracking-widest uppercase bg-accent text-accent-foreground px-1.5 py-0.5 rounded-sm">
                          THOU
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground italic">
                      Discord UID: {user.discordId}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Joined Ledger: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Role Badge and Actions */}
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                      Guild Status
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-sm font-heading tracking-widest uppercase border ${
                        user.role === 'ADMIN'
                          ? 'bg-[#faecd0] text-[#865d1a] border-[#ebd4a2] font-bold'
                          : user.role === 'MEMBER'
                          ? 'bg-[#e2edd3] text-[#4d7225] border-[#c4dba8]'
                          : 'bg-[#ebd3d3] text-[#7d2c2c] border-[#d8aba8]'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* Promotion/Demotion actions */}
                  <div className="flex gap-2">
                    {user.role === 'USER' && (
                      <button
                        onClick={() => handleRoleUpdate(user.uid, 'MEMBER')}
                        disabled={updateRoleMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#e2edd3] text-[#4d7225] border border-[#c4dba8] hover:bg-[#c4dba8] font-heading text-xs tracking-wider rounded-sm transition-all shadow-[1px_2px_4px_rgba(0,0,0,0.1)] cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        PROMOTE
                      </button>
                    )}

                    {user.role === 'MEMBER' && (
                      <button
                        onClick={() => handleRoleUpdate(user.uid, 'USER')}
                        disabled={updateRoleMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#ebd3d3] text-[#7d2c2c] border border-[#d8aba8] hover:bg-[#d8aba8] font-heading text-xs tracking-wider rounded-sm transition-all shadow-[1px_2px_4px_rgba(0,0,0,0.1)] cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                        DEMOTE
                      </button>
                    )}

                    {isTargetAdmin && (
                      <span className="text-xs italic text-muted-foreground flex items-center gap-1 py-1.5 px-3">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        Elder Artisan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Members;
