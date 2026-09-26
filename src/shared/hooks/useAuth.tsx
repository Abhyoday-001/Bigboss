import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team } from '../state-machine/types';
import { MOCK_TEAMS } from '../mocks/mockData';

interface AuthContextType {
  team: Team | null;
  role: 'PARTICIPANT' | 'ADMIN' | 'ANONYMOUS';
  isAuthenticated: boolean;
  hasSeenIntro: boolean;
  loginTeam: (teamId: string, passcode: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (passcode: string) => Promise<{ success: boolean; error?: string }>;
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

  const loginTeam = async (teamId: string, passcode: string): Promise<{ success: boolean; error?: string }> => {
    // Artificial small latency for realistic cyber feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Accepted demo credentials: any team id (e.g. 'team-01') and passcode 'devhouse' or team-01
    const cleanId = teamId.trim().toLowerCase();
    const matchedTeam = MOCK_TEAMS.find(
      (t) => t.id.toLowerCase() === cleanId || t.teamName.toLowerCase() === cleanId
    );

    if (!matchedTeam) {
      return { success: false, error: 'Invalid Team ID. Please consult the host desk in Seminar Hall 002.' };
    }

    if (passcode.trim() !== 'devhouse' && passcode.trim() !== matchedTeam.id) {
      return { success: false, error: 'Incorrect authorization passcode. Access denied by The Eye.' };
    }

    setTeam(matchedTeam);
    setRole('PARTICIPANT');
    localStorage.setItem(STORAGE_KEYS.TEAM_ID, matchedTeam.id);
    localStorage.setItem(STORAGE_KEYS.ROLE, 'PARTICIPANT');
    return { success: true };
  };

  const loginAdmin = async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (passcode.trim() === 'admin2026' || passcode.trim() === 'cognito') {
      setRole('ADMIN');
      localStorage.setItem(STORAGE_KEYS.ROLE, 'ADMIN');
      return { success: true };
    }
    return { success: false, error: 'Control room access denied. Unauthorized personnel.' };
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
