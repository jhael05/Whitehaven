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
  updateUserProfile: (updates: Partial<User>) => AuthResponse;
  changePassword: (oldPassword: string, newPassword: string) => AuthResponse;
  saveDefaultAddress: (address: User['defaultAddress']) => void;
  setUserTheme: (themeId: User['selectedTheme']) => void;
  addLoyaltyStamp: (count?: number) => void;
  setStampsCount: (count: number) => void;
  claimLoyaltyReward: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'white_haven_user_session_clean';
const ACCOUNTS_STORAGE_KEY = 'white_haven_registered_accounts_clean';

// Function to remove any legacy Unsplash URLs so all accounts strictly use body icon by default
const sanitizeAvatar = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.includes('images.unsplash.com') || url.includes('unsplash.com')) {
    return undefined;
  }
  return url;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Registered Accounts Database (Sanitized to ensure no random Unsplash avatars)
  const [registeredAccounts, setRegisteredAccounts] = useState<AccountRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((acc: AccountRecord) => ({
            ...acc,
            avatarUrl: sanitizeAvatar(acc.avatarUrl),
          }));
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  // 2. Active Session (Sanitized to ensure no random Unsplash avatars)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.name && parsed.emailOrContact) {
          return {
            ...parsed,
            avatarUrl: sanitizeAvatar(parsed.avatarUrl),
          };
        }
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
      phoneNumber: found.phoneNumber,
      provider: found.provider,
      avatarUrl: sanitizeAvatar(found.avatarUrl),
      stampsCount: found.stampsCount,
      selectedTheme: found.selectedTheme,
      defaultAddress: found.defaultAddress,
      memberSince: found.createdAt,
    };

    setUser(activeUser);
    return { success: true, user: activeUser };
  };

  // 2. STRICT SIGN UP (Registers new real account with clean body icon default)
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

    const todayDate = new Date().toISOString().split('T')[0];
    const newAccount: AccountRecord = {
      id: `acc_${Date.now()}`,
      name: trimmedName,
      emailOrContact: emailOrContact.trim(),
      password,
      provider,
      avatarUrl: undefined, // Body icon default only! No random pictures.
      stampsCount: 1, // 1 welcome stamp
      createdAt: todayDate,
    };

    setRegisteredAccounts(prev => [newAccount, ...prev]);

    const activeUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      emailOrContact: newAccount.emailOrContact,
      provider: newAccount.provider,
      avatarUrl: undefined,
      stampsCount: newAccount.stampsCount,
      memberSince: todayDate,
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
        phoneNumber: existing.phoneNumber,
        provider,
        avatarUrl: sanitizeAvatar(existing.avatarUrl),
        stampsCount: existing.stampsCount,
        selectedTheme: existing.selectedTheme,
        defaultAddress: existing.defaultAddress,
        memberSince: existing.createdAt,
      };
      setUser(activeUser);
      return { success: true, user: activeUser };
    }

    // Register new real account through social provider
    const todayDate = new Date().toISOString().split('T')[0];
    const newAccount: AccountRecord = {
      id: `acc_${provider}_${Date.now()}`,
      name: trimmedName,
      emailOrContact: emailOrContact.trim(),
      password: `social_auth_${Date.now()}`,
      provider,
      avatarUrl: undefined, // Body icon default only! No random pictures.
      stampsCount: 1,
      createdAt: todayDate,
    };

    setRegisteredAccounts(prev => [newAccount, ...prev]);

    const activeUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      emailOrContact: newAccount.emailOrContact,
      provider: newAccount.provider,
      avatarUrl: undefined,
      stampsCount: newAccount.stampsCount,
      memberSince: todayDate,
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

  const setStampsCount = (count: number) => {
    if (!user) return;
    const clamped = Math.max(0, Math.min(8, count));
    setUser(prev => (prev ? { ...prev, stampsCount: clamped } : null));
    setRegisteredAccounts(prev =>
      prev.map(acc => (acc.id === user.id ? { ...acc, stampsCount: clamped } : acc))
    );
  };

  const updateUserProfile = (updates: Partial<User>): AuthResponse => {
    if (!user) return { success: false, error: 'You must be logged in to update your profile.' };

    const updatedUser: User = {
      ...user,
      ...updates,
      avatarUrl: updates.avatarUrl !== undefined ? sanitizeAvatar(updates.avatarUrl) : user.avatarUrl,
    };

    setUser(updatedUser);
    setRegisteredAccounts(prev =>
      prev.map(acc => {
        if (acc.id === user.id) {
          return {
            ...acc,
            name: updatedUser.name,
            phoneNumber: updatedUser.phoneNumber,
            avatarUrl: updatedUser.avatarUrl,
            selectedTheme: updatedUser.selectedTheme,
            defaultAddress: updatedUser.defaultAddress,
          };
        }
        return acc;
      })
    );

    return { success: true, user: updatedUser };
  };

  const changePassword = (oldPassword: string, newPassword: string): AuthResponse => {
    if (!user) return { success: false, error: 'You must be logged in to change your password.' };

    const account = registeredAccounts.find(acc => acc.id === user.id);
    if (!account) return { success: false, error: 'Account record not found.' };

    // For social accounts that don't have user-set passwords, allow setting if oldPassword matches or starts with social_auth
    const isSocialDefault = account.password.startsWith('social_auth_');
    if (!isSocialDefault && account.password !== oldPassword) {
      return { success: false, error: 'Current password is incorrect. Please try again.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    setRegisteredAccounts(prev =>
      prev.map(acc => (acc.id === user.id ? { ...acc, password: newPassword } : acc))
    );

    return { success: true };
  };

  const saveDefaultAddress = (address: User['defaultAddress']) => {
    if (!user) return;
    setUser(prev => (prev ? { ...prev, defaultAddress: address } : null));
    setRegisteredAccounts(prev =>
      prev.map(acc => (acc.id === user.id ? { ...acc, defaultAddress: address } : acc))
    );
  };

  const setUserTheme = (themeId: User['selectedTheme']) => {
    if (!user) return;
    setUser(prev => (prev ? { ...prev, selectedTheme: themeId } : null));
    setRegisteredAccounts(prev =>
      prev.map(acc => (acc.id === user.id ? { ...acc, selectedTheme: themeId } : acc))
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
        updateUserProfile,
        changePassword,
        saveDefaultAddress,
        setUserTheme,
        addLoyaltyStamp,
        setStampsCount,
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
