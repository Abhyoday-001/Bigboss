import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VoterRole, Team } from './types';
import { useAuth as usePrimaryAuth } from '../shared/hooks/useAuth';

interface AuthContextType {
  team: Team | null;
  voterRole: VoterRole;
  setTeam: (team: Team | null) => void;
  setVoterRole: (role: VoterRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  let primaryTeam: any = null;
  try {
    const auth = usePrimaryAuth();
    primaryTeam = auth?.team;
  } catch (e) {
    // In case used outside primary AuthProvider
  }

  const [team, setTeam] = useState<Team | null>(() => {
    if (primaryTeam) {
      return {
        id: primaryTeam.id,
        name: primaryTeam.teamName,
        members: primaryTeam.members?.map((m: any) => m.name) || ['Anjishth', 'Aryan'],
      };
    }
    return {
      id: 'team-1',
      name: 'Cyber Sentinel',
      members: ['Anjishth', 'Aryan'],
    };
  });

  useEffect(() => {
    if (primaryTeam) {
      setTeam({
        id: primaryTeam.id,
        name: primaryTeam.teamName,
        members: primaryTeam.members?.map((m: any) => m.name) || ['Anjishth', 'Aryan'],
      });
    }
  }, [primaryTeam]);

  const [voterRole, setVoterRole] = useState<VoterRole>('PARTICIPANT');

  return (
    <AuthContext.Provider value={{ team, voterRole, setTeam, setVoterRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
