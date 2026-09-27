import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VoterRole, Team } from './types';

interface AuthContextType {
  team: Team | null;
  voterRole: VoterRole;
  setTeam: (team: Team | null) => void;
  setVoterRole: (role: VoterRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [team, setTeam] = useState<Team | null>({
    id: 'team-1',
    name: 'Byte Me',
    members: ['Anjishth', 'Aryan']
  });
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
