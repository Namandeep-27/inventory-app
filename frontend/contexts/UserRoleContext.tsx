'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'EMPLOYEE';

interface UserRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
  isEmployee: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'inventory_user_role';

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('EMPLOYEE');

  // Load role from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    if (storedRole === 'ADMIN' || storedRole === 'EMPLOYEE') {
      setRoleState(storedRole);
    } else {
      // Default to EMPLOYEE if no role stored
      setRoleState('EMPLOYEE');
      localStorage.setItem(ROLE_STORAGE_KEY, 'EMPLOYEE');
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  const value: UserRoleContextType = {
    role,
    setRole,
    isAdmin: role === 'ADMIN',
    isEmployee: role === 'EMPLOYEE',
  };

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}
