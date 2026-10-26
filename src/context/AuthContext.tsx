import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AccountRecord } from '../types/cafe';

interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  registeredAccounts: AccountRecord[];
  loginWithCredentials: (emailOrContact: string, password: string) => AuthResponse;
  registerAccount: (name: string, emailOrContact: string, password: string, provider?: AccountRecord['provider']) => AuthResponse;
  loginWithSocialAccount: (
    provider: 'google' | 'facebook' | 'instagram' | 'tiktok',
    emailOrContact: string,
    name: string
  ) => AuthResponse;
  logout: () => void;
  requestPasswordResetOtp: (emailOrContact: string) => { success: boolean; otp?: string; error?: string };
  resetPasswordWithOtp: (emailOrContact: string, enteredOtp: string, expectedOtp: string, newPassword: string) => AuthResponse;
  addLoyaltyStamp: (count?: number) => void;
  claimLoyaltyReward: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'white_haven_user_session_clean';
const ACCOUNTS_STORAGE_KEY = 'white_haven_registered_accounts_clean';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Registered Accounts Database (Starts strictly empty or from user's actual past registrations)
  const [registeredAccounts, setRegisteredAccounts] = useState<AccountRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    // Absolutely blank - no hardcoded names or mock accounts!
    return [];
  });

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  // 2. Active Session (Starts strictly null - no one logged in by default)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.name && parsed.emailOrContact) return parsed;
      }
    } catch {
      // fallback
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [user]);

  // Normalize email/phone
  const normalizeIdentifier = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.includes('@')) {
      return trimmed.toLowerCase();
    }
    return trimmed.replace(/[\s\-()]/g, '');
  };

  // 1. STRICT LOGIN WITH CREDENTIALS
  const loginWithCredentials = (emailOrContact: string, password: string): AuthResponse => {
    const normId = normalizeIdentifier(emailOrContact);
    if (!normId) {
      return { success: false, error: 'Please enter your registered email address or contact number.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const found = registeredAccounts.find(
      acc => normalizeIdentifier(acc.emailOrContact) === normId
    );

    if (!found) {
      return {
        success: false,
        error: `No account found for "${emailOrContact}". Please register your real account under SIGN UP first.`,
      };
    }

    if (found.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your password or use Forgot Password.',
      };
    }

    // Exact credentials match
    const activeUser: User = {
      id: found.id,
      name: found.name,
      emailOrContact: found.emailOrContact,
      provider: found.provider,
      avatarUrl: found.avatarUrl,
      stampsCount: found.stampsCount,
    };

    setUser(activeUser);
    return { success: true, user: activeUser };
  };

  // 2. STRICT SIGN UP (Registers new real account)
  const registerAccount = (
    name: string,
    emailOrContact: string,
    password: string,
    provider: AccountRecord['provider'] = 'email'
  ): AuthResponse => {
    const trimmedName = name.trim();
    const normId = normalizeIdentifier(emailOrContact);

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Please enter your complete real name.' };
    }
    if (!normId) {
      return { success: false, error: 'Please enter a valid email address or contact number.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const existing = registeredAccounts.find(
      acc => normalizeIdentifier(acc.emailOrContact) === normId
    );

    if (existing) {
      return {
        success: false,
        error: `An account with "${emailOrContact}" already exists. Please Log In instead.`,
      };
    }

    const newAccount: AccountRecord = {
      id: `acc_${Date.now()}`,
      name: trimmedName,
      emailOrContact: emailOrContact.trim(),
      password,
      provider,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      stampsCount: 1, // 1 welcome stamp
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRegisteredAccounts(prev => [newAccount, ...prev]);

    const activeUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      emailOrContact: newAccount.emailOrContact,
      provider: newAccount.provider,
      avatarUrl: newAccount.avatarUrl,
      stampsCount: newAccount.stampsCount,
    };

    setUser(activeUser);
    return { success: true, user: activeUser };
  };

  // 3. SOCIAL ACCOUNT AUTHENTICATION (Google, Facebook, Instagram, TikTok)
  const loginWithSocialAccount = (
    provider: 'google' | 'facebook' | 'instagram' | 'tiktok',
    emailOrContact: string,
    name: string
  ): AuthResponse => {
    const normId = normalizeIdentifier(emailOrContact);
    const trimmedName = name.trim();

    if (!normId) {
      return { success: false, error: `Please enter your ${provider.toUpperCase()} email or handle.` };
    }
    if (!trimmedName) {
      return { success: false, error: 'Please enter your account name.' };
    }

    const existing = registeredAccounts.find(
      acc => normalizeIdentifier(acc.emailOrContact) === normId
    );

    if (existing) {
      // Log into existing account
      const activeUser: User = {
        id: existing.id,
        name: existing.name,
        emailOrContact: existing.emailOrContact,
        provider,
        avatarUrl: existing.avatarUrl,
        stampsCount: existing.stampsCount,
      };
      setUser(activeUser);
      return { success: true, user: activeUser };
    }

    // Register new real account through social provider
    const newAccount: AccountRecord = {
      id: `acc_${provider}_${Date.now()}`,
      name: trimmedName,
      emailOrContact: emailOrContact.trim(),
      password: `social_auth_${Date.now()}`,
      provider,
      avatarUrl: provider === 'google'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      stampsCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRegisteredAccounts(prev => [newAccount, ...prev]);

    const activeUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      emailOrContact: newAccount.emailOrContact,
      provider: newAccount.provider,
      avatarUrl: newAccount.avatarUrl,
      stampsCount: newAccount.stampsCount,
    };

    setUser(activeUser);
    return { success: true, user: activeUser };
  };

  // 4. FORGOT PASSWORD OTP
  const requestPasswordResetOtp = (emailOrContact: string) => {
    const normId = normalizeIdentifier(emailOrContact);
    if (!normId) {
      return { success: false, error: 'Please enter your registered email address or contact number.' };
    }

    const found = registeredAccounts.find(
      acc => normalizeIdentifier(acc.emailOrContact) === normId
    );

    if (!found) {
      return {
        success: false,
        error: `No registered account found for "${emailOrContact}". You must be a registered member.`,
      };
    }

    // Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    return { success: true, otp: generatedOtp };
  };

  // 5. RESET PASSWORD
  const resetPasswordWithOtp = (
    emailOrContact: string,
    enteredOtp: string,
    expectedOtp: string,
    newPassword: string
  ): AuthResponse => {
    if (!enteredOtp || enteredOtp.trim() !== expectedOtp.trim()) {
      return { success: false, error: 'Invalid OTP code! Verification failed. Please enter the correct code.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const normId = normalizeIdentifier(emailOrContact);
    let updatedUser: User | null = null;
    let found = false;

    setRegisteredAccounts(prev =>
      prev.map(acc => {
        if (normalizeIdentifier(acc.emailOrContact) === normId) {
          found = true;
          const updated = { ...acc, password: newPassword };
          updatedUser = {
            id: updated.id,
            name: updated.name,
            emailOrContact: updated.emailOrContact,
            provider: updated.provider,
            avatarUrl: updated.avatarUrl,
            stampsCount: updated.stampsCount,
          };
          return updated;
        }
        return acc;
      })
    );

    if (!found) {
      return { success: false, error: 'Account not found in database.' };
    }

    if (updatedUser) {
      setUser(updatedUser);
    }

    return { success: true, user: updatedUser || undefined };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const addLoyaltyStamp = (count = 1) => {
    if (!user) return;
    const newCount = Math.min(8, (user.stampsCount || 0) + count);
    setUser(prev => (prev ? { ...prev, stampsCount: newCount } : null));
    setRegisteredAccounts(prev =>
      prev.map(acc => (acc.id === user.id ? { ...acc, stampsCount: newCount } : acc))
    );
  };

  const claimLoyaltyReward = () => {
    if (!user || user.stampsCount < 8) return false;
    setUser(prev => (prev ? { ...prev, stampsCount: 0 } : null));
    setRegisteredAccounts(prev =>
      prev.map(acc => (acc.id === user.id ? { ...acc, stampsCount: 0 } : acc))
    );
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        registeredAccounts,
        loginWithCredentials,
        registerAccount,
        loginWithSocialAccount,
        logout,
        requestPasswordResetOtp,
        resetPasswordWithOtp,
        addLoyaltyStamp,
        claimLoyaltyReward,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
