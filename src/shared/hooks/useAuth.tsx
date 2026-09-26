import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team } from '../state-machine/types';
import { MOCK_TEAMS } from '../mocks/mockData';

interface AuthContextType {
  team: Team | null;
  role: 'PARTICIPANT' | 'ADMIN' | 'ANONYMOUS';
  isAuthenticated: boolean;
  hasSeenIntro: boolean;
  loginTeam: (teamId: string, passcode?: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (passcode?: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: (teamIdOrAlias?: string) => void;
  logout: () => void;
  setHasSeenIntro: (seen: boolean) => void;
  switchActiveTeam: (teamId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TEAM_ID: 'devhouse_auth_team_id',
  ROLE: 'devhouse_auth_role',
  SEEN_INTRO: 'devhouse_seen_intro',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [role, setRole] = useState<'PARTICIPANT' | 'ADMIN' | 'ANONYMOUS'>('ANONYMOUS');
  const [hasSeenIntro, setHasSeenIntroState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SEEN_INTRO) === 'true';
  });

  useEffect(() => {
    const savedTeamId = localStorage.getItem(STORAGE_KEYS.TEAM_ID);
    const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as 'PARTICIPANT' | 'ADMIN' | null;

    if (savedRole === 'ADMIN') {
      setRole('ADMIN');
    } else if (savedTeamId) {
      const found = MOCK_TEAMS.find((t) => t.id === savedTeamId);
      if (found) {
        setTeam(found);
        setRole('PARTICIPANT');
      }
    }
  }, []);

  const setHasSeenIntro = (seen: boolean) => {
    setHasSeenIntroState(seen);
    localStorage.setItem(STORAGE_KEYS.SEEN_INTRO, String(seen));
  };

  const loginTeam = async (teamId: string, passcode?: string): Promise<{ success: boolean; error?: string }> => {
    // Artificial small latency for realistic cyber feel
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cleanId = (teamId || '').trim().toLowerCase();
    
    // Look up in mock teams by ID, team name, or aliases
    let matchedTeam = MOCK_TEAMS.find(
      (t) =>
        t.id.toLowerCase() === cleanId ||
        t.teamName.toLowerCase() === cleanId ||
        cleanId.includes(t.id.toLowerCase())
    );

    if (!matchedTeam) {
      if (cleanId.includes('alpha') || cleanId === '1' || cleanId.includes('aryan')) {
        matchedTeam = MOCK_TEAMS[0]; // CyberNexus (Aryan Sharma)
      } else if (cleanId.includes('beta') || cleanId === '2' || cleanId.includes('anjishth')) {
        matchedTeam = MOCK_TEAMS[1]; // NullPointers (Anjishth Kumar)
      } else if (cleanId.includes('gamma') || cleanId === '3' || cleanId.includes('dilraj')) {
        matchedTeam = MOCK_TEAMS[2]; // ByteForce (Dilraj Singh)
      } else if (cleanId.includes('delta') || cleanId === '4' || cleanId.includes('spoorthi')) {
        matchedTeam = MOCK_TEAMS[3]; // GlitchHunters (Spoorthi Gowda)
      } else {
        // Fallback default demo team so developer is never blocked
        matchedTeam = {
          ...MOCK_TEAMS[0],
          id: cleanId ? cleanId.replace(/\s+/g, '-') : 'team-01',
          teamName: teamId?.trim() || 'CyberNexus',
        };
      }
    }

    setTeam(matchedTeam);
    setRole('PARTICIPANT');
    localStorage.setItem(STORAGE_KEYS.TEAM_ID, matchedTeam.id);
    localStorage.setItem(STORAGE_KEYS.ROLE, 'PARTICIPANT');
    return { success: true };
  };

  const quickDemoLogin = (teamIdOrAlias: string = 'team-01') => {
    loginTeam(teamIdOrAlias);
  };

  const loginAdmin = async (passcode?: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setRole('ADMIN');
    localStorage.setItem(STORAGE_KEYS.ROLE, 'ADMIN');
    return { success: true };
  };

  const logout = () => {
    setTeam(null);
    setRole('ANONYMOUS');
    localStorage.removeItem(STORAGE_KEYS.TEAM_ID);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
  };

  const switchActiveTeam = (teamId: string) => {
    const found = MOCK_TEAMS.find((t) => t.id === teamId);
    if (found) {
      setTeam(found);
      localStorage.setItem(STORAGE_KEYS.TEAM_ID, found.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        team,
        role,
        isAuthenticated: role !== 'ANONYMOUS',
        hasSeenIntro,
        loginTeam,
        loginAdmin,
        quickDemoLogin,
        logout,
        setHasSeenIntro,
        switchActiveTeam,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
