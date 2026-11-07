import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { CafeThemeId, UserSavedAddress } from '../types/cafe';
import {
  X,
  User as UserIcon,
  Upload,
  Trash2,
  Award,
  Palette,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Coffee,
  Check,
  Phone,
  Mail,
  Lock,
  ChevronRight,
  ExternalLink,
  Gift,
  Heart,
  Zap,
} from 'lucide-react';

interface MyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onOpenOrdersHistory: () => void;
  onOpenFreeDrinkClaim?: () => void;
}

type AccountTab = 'profile' | 'usuals' | 'stamps' | 'theme' | 'address' | 'security';

export const MyAccountModal: React.FC<MyAccountModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onOpenOrdersHistory,
  onOpenFreeDrinkClaim,
}) => {
  const { user, updateUserProfile, changePassword, saveDefaultAddress, logout } = useAuth();
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const { orders, usualDrinks, orderUsual, removeUsualDrink } = useCart();

  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Address Form State
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>(
    user?.defaultAddress?.label || 'Home'
  );
  const [houseNumber, setHouseNumber] = useState(user?.defaultAddress?.houseNumber || '');
  const [street, setStreet] = useState(user?.defaultAddress?.street || '');
  const [barangay, setBarangay] = useState(user?.defaultAddress?.barangay || 'Gulod');
  const [city, setCity] = useState(user?.defaultAddress?.city || 'Quezon City');
  const [landmark, setLandmark] = useState(user?.defaultAddress?.landmark || '');
  const [riderNotes, setRiderNotes] = useState(user?.defaultAddress?.riderNotes || '');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Synchronize with active user when modal opens or user updates
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      if (user.defaultAddress) {
        setAddressLabel(user.defaultAddress.label);
        setHouseNumber(user.defaultAddress.houseNumber);
        setStreet(user.defaultAddress.street);
        setBarangay(user.defaultAddress.barangay);
        setCity(user.defaultAddress.city);
        setLandmark(user.defaultAddress.landmark || '');
        setRiderNotes(user.defaultAddress.riderNotes || '');
      }
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Handle Profile Photo Upload via Device File
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      onShowToast('Image size should be less than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        updateUserProfile({ avatarUrl: dataUrl });
        onShowToast('Profile photo updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Revert back strictly to clean body icon
  const handleRemovePhoto = () => {
    updateUserProfile({ avatarUrl: undefined });
    onShowToast('Photo removed. Using clean body silhouette icon.');
  };

  // Save Profile Text Details
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      onShowToast('Please enter your full name.');
      return;
    }

    setIsSavingProfile(true);
    const res = updateUserProfile({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
    });
    setIsSavingProfile(false);

    if (res.success) {
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3500);
      onShowToast('Profile details updated successfully.');
    } else {
      onShowToast(res.error || 'Failed to update profile.');
    }
  };

  // Save Default Address
  const handleSaveAddress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!houseNumber.trim() || !street.trim()) {
      onShowToast('Please provide your house/unit number and street.');
      return;
    }

    setIsSavingAddress(true);
    const formatted: UserSavedAddress = {
      label: addressLabel,
      houseNumber: houseNumber.trim(),
      street: street.trim(),
      barangay: barangay.trim(),
      city: city.trim(),
      landmark: landmark.trim() || undefined,
      riderNotes: riderNotes.trim() || undefined,
    };

    saveDefaultAddress(formatted);
    setIsSavingAddress(false);
    setAddressSuccessMsg(true);
    setTimeout(() => setAddressSuccessMsg(false), 3500);
    onShowToast('Default delivery address saved!');
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    const res = changePassword(currentPassword, newPassword);
    if (!res.success) {
      setPasswordError(res.error || 'Failed to change password.');
    } else {
      setPasswordSuccess('Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('Password changed successfully.');
    }
  };

  const stampsCount = user?.stampsCount || 0;
  const isRewardUnlocked = stampsCount >= 8;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#DECDBE] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Luxury Header Banner */}
        <div className="bg-[#3D2517] text-[#FAF7F2] px-6 py-5 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C29B63]/50 to-transparent" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              {/* Profile Avatar or Pure Body Silhouette Icon */}
              <div className="relative group">
                <div className="w-13 h-13 rounded-full overflow-hidden bg-[#2C1810] border-2 border-[#C29B63] flex items-center justify-center shadow-md">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-7 h-7 text-[#FAF7F2]" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1 bg-[#8C5332] text-white rounded-full hover:bg-amber-700 transition shadow-xs cursor-pointer"
                  title="Upload / Change Photo"
                >
                  <Upload className="w-3 h-3" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-cafe text-xl font-bold tracking-tight text-[#FAF7F2]">
                    {user.name}
                  </h3>
                </div>
                <p className="text-xs text-[#DECDBE] mt-0.5 flex items-center gap-2">
                  <span>{user.emailOrContact}</span>
                  {user.memberSince && (
                    <>
                      <span>•</span>
                      <span className="text-[11px] text-amber-200/80">Member since {user.memberSince}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[#DECDBE] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tab Bar */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-[#FAF7F2] text-[#3D2517] font-bold shadow-sm'
                  : 'text-[#DECDBE] hover:text-white hover:bg-white/10'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Profile & Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('usuals')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'usuals'
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-[#DECDBE] hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
              <span>Usual Drinks ({usualDrinks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stamps')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'stamps'
                  ? 'bg-[#FAF7F2] text-[#3D2517] font-bold shadow-sm'
                  : 'text-[#DECDBE] hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Loyalty Stamps ({stampsCount}/8)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'theme'
                  ? 'bg-[#FAF7F2] text-[#3D2517] font-bold shadow-sm'
                  : 'text-[#DECDBE] hover:text-white hover:bg-white/10'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              <span>Café Palette Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('address')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'address'
                  ? 'bg-[#FAF7F2] text-[#3D2517] font-bold shadow-sm'
                  : 'text-[#DECDBE] hover:text-white hover:bg-white/10'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Saved Delivery Address</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-[#FAF7F2] text-[#3D2517] font-bold shadow-sm'
                  : 'text-[#DECDBE] hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Account Security</span>
            </button>
          </div>
        </div>

        {/* Hidden File Input for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FAF7F2]">
          
          {/* TAB 1: PROFILE & PHOTO */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#F4ECE3] border border-[#DECDBE] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-[#2C1810] border-3 border-[#8C5332] shadow-inner flex items-center justify-center shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-10 h-10 text-[#FAF7F2]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C1810] text-sm">
                      {user.avatarUrl ? 'Custom Profile Picture' : 'Standard Body Silhouette Icon'}
                    </h4>
                    <p className="text-xs text-[#7C6656] mt-0.5 max-w-sm">
                      {user.avatarUrl
                        ? 'Your custom photo is active across White Haven Café. You can change or remove it anytime.'
                        : 'No random photo is assigned. You can upload your own photo or keep the clean body icon.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D2517] hover:bg-[#2C1810] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                  {user.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-bold transition cursor-pointer"
                      title="Remove custom photo and revert to body icon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C5332]" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                      Contact / Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C5332]" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 0917 123 4567"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Account Email / Identifier
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C6656]" />
                    <input
                      type="text"
                      disabled
                      value={user.emailOrContact}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5D7CB] bg-[#F0E6DB]/60 text-sm text-[#7C6656] cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-[#7C6656] mt-1">
                    Primary registration login ID ({user.provider.toUpperCase()} account)
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                  {profileSuccessMsg && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-xs animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Changes Saved Successfully!</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSaveProfile()}
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 rounded-xl bg-[#8C5332] hover:bg-[#724125] active:scale-95 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>

              {/* Order History Quick Jump */}
              <div className="pt-4 border-t border-[#DECDBE] flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#2C1810]">Past Café Orders</h5>
                  <p className="text-[11px] text-[#7C6656]">
                    You have placed {orders.length} order{orders.length === 1 ? '' : 's'} with White Haven Café.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOrdersHistory();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DECDBE] bg-white hover:bg-[#F5ECE2] text-xs font-bold text-[#4A2E1B] transition cursor-pointer"
                >
                  <span>View Order Receipts</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C5332]" />
                </button>
              </div>
            </div>
          )}

          {/* TAB: USUAL DRINKS (PABORITO) */}
          {activeTab === 'usuals' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-rose-50/90 via-amber-50/70 to-[#FAF7F2] border-2 border-rose-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Heart className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-serif-cafe text-lg font-bold text-[#2C1810] flex items-center gap-2">
                      <span>Your Usual Drinks ({usualDrinks.length})</span>
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                        1-Click Order
                      </span>
                    </h3>
                    <p className="text-xs text-[#6F4E37] mt-0.5">
                      Ito ang mga inumin na iyong na-heart! Puwede mo itong ma-order sa isang pindot lang nang hindi na kailangang i-configure pa.
                    </p>
                  </div>
                </div>
              </div>

              {usualDrinks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#DECDBE] p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <Heart className="w-7 h-7 text-rose-500" />
                  </div>
                  <h4 className="font-serif-cafe text-base font-bold text-[#2C1810]">
                    Wala Pang Naka-heart na Usual Drinks
                  </h4>
                  <p className="text-xs text-[#7C6656] max-w-sm mx-auto leading-relaxed">
                    Pumunta sa aming Menu o sa iyong Order History at pindutin ang ❤️ Heart icon sa paborito mong kape o drink para lumabas dito!
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#3D2517] text-white px-5 py-2 text-xs font-bold hover:bg-[#2C1810] transition-colors cursor-pointer shadow-xs"
                  >
                    <Coffee className="w-3.5 h-3.5 text-amber-300" />
                    <span>Mag-browse sa Menu</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {usualDrinks.map((usual) => (
                    <div
                      key={usual.id}
                      className="rounded-2xl border border-rose-200/90 bg-white p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={usual.image}
                          alt={usual.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/menu/spanish_latte.jpg';
                          }}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#D8C7B6]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5332]">
                              {usual.category}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                removeUsualDrink(usual.id);
                                onShowToast(`Tinanggal ang ${usual.name} sa iyong Usual Drinks.`);
                              }}
                              title="Remove from usuals"
                              className="text-gray-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h4 className="font-serif-cafe text-base font-bold text-[#2C1810] group-hover:text-rose-700 transition-colors">
                            {usual.name}
                          </h4>
                          <span className="text-xs font-black text-[#8C5332]">
                            ₱{usual.price}
                          </span>
                          <div className="text-[11px] text-[#7C6656] mt-1 bg-[#FAF7F2] p-1.5 rounded-lg border border-[#EFE7DD]">
                            <span>
                              {usual.customization?.temperature || 'Iced'} •{' '}
                              {usual.customization?.size ? usual.customization.size.split(' ')[0] : '16oz'}
                            </span>
                            {usual.customization?.sweetness && (
                              <span> • {usual.customization.sweetness} Sugar</span>
                            )}
                            {usual.customization?.milkType && usual.customization.milkType !== 'Whole Milk' && (
                              <span> • {usual.customization.milkType.split(' ')[0]}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#F0E6DB] flex items-center justify-between gap-2">
                        <span className="text-[10px] text-[#9E8B7A]">
                          Saved {usual.savedAt}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            orderUsual(usual);
                            onClose();
                            onShowToast(`☕ Naidagdag ang iyong Usual (${usual.name}) sa cart!`);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-[#8C5332] hover:from-rose-500 hover:to-[#6F3E22] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>1-Click Order (₱{usual.price})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LOYALTY STAMPS TRACKER */}
          {activeTab === 'stamps' && (
            <div className="space-y-6 animate-fade-in">
              {/* VIP Card Presentation */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#3D2517] via-[#2A180E] to-[#1E110A] text-[#FAF7F2] p-6 sm:p-7 shadow-2xl border border-[#C29B63]/40 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-2 right-4 text-[110px] font-serif text-white/5 font-black select-none pointer-events-none">
                  8
                </div>

                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">
                      White Haven Café • Loyalty Privilège Card
                    </span>
                    <h3 className="font-serif-cafe text-2xl font-bold text-white mt-1">
                      {stampsCount} of 8 Stamps Collected
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C29B63]/20 border border-[#C29B63]/40 text-amber-300">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                {/* 8-Stamp Visual Stamp Grid */}
                <div className="mt-6 grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3 relative z-10">
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const isStamped = idx < stampsCount;
                    const isLastRewardCup = idx === 7;

                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${
                          isStamped
                            ? 'bg-amber-400 text-[#2C1810] border-amber-300 shadow-lg scale-[1.03]'
                            : 'bg-white/5 border-white/15 text-white/40'
                        }`}
                      >
                        {isStamped ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#2C1810]" />
                            <span className="text-[9px] font-black mt-0.5">#{idx + 1}</span>
                          </>
                        ) : isLastRewardCup ? (
                          <>
                            <Gift className="w-5 h-5 text-amber-300/80 animate-pulse" />
                            <span className="text-[9px] font-bold text-amber-200 mt-0.5">FREE</span>
                          </>
                        ) : (
                          <>
                            <Coffee className="w-5 h-5" />
                            <span className="text-[9px] font-semibold mt-0.5">#{idx + 1}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reward Banner */}
                <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {isRewardUnlocked
                          ? '1 Free Drink Reward is Unlocked!'
                          : `${8 - stampsCount} more drink${8 - stampsCount === 1 ? '' : 's'} until your Free Drink reward`}
                      </p>
                      <p className="text-[11px] text-amber-100/70">
                        {isRewardUnlocked
                          ? 'Claim your complimentary handcrafted drink directly on the Cart or Checkout screen!'
                          : 'Order any drink from our menu to earn stamps automatically.'}
                      </p>
                    </div>
                  </div>

                  {isRewardUnlocked && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenFreeDrinkClaim) onOpenFreeDrinkClaim();
                      }}
                      className="shrink-0 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-[#2C1810] text-xs font-black shadow-lg animate-bounce transition flex items-center gap-1.5 cursor-pointer active:scale-95 border border-amber-300"
                    >
                      <Gift className="w-3.5 h-3.5 text-[#2C1810]" />
                      <span>Claim Free Drink Now!</span>
                    </button>
                  )}
                </div>

                {isRewardUnlocked && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-300/10 border border-amber-300/40 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-[#2C1810] flex items-center justify-center font-bold shrink-0">
                        🎁
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">
                          Your complimentary handcrafted drink is ready!
                        </p>
                        <p className="text-[11px] text-amber-100/80">
                          Pick any specialty coffee, matcha, frappe, or slushie at ₱0.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenFreeDrinkClaim) onOpenFreeDrinkClaim();
                      }}
                      className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#2C1810] font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Pick Free Drink</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* How it Works Rules */}
              <div className="bg-[#F4ECE3] border border-[#DECDBE] rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A2E1B] flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#8C5332]" />
                  <span>How White Haven Loyalty Rewards Work</span>
                </h4>
                <ul className="text-xs text-[#5D4037] space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#8C5332]">•</span>
                    <span>Every completed order that includes handcrafted coffee or tea drinks earns 1 stamp toward your card.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#8C5332]">•</span>
                    <span>Upon reaching <strong>8 stamps</strong>, you unlock 1 Free Handcrafted Drink (Regular or Grande) with your choice of customization!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#8C5332]">•</span>
                    <span>Redeem effortlessly: Just tap <strong>"Claim 1 Free Drink"</strong> on your Checkout or Cart drawer to deduct 100% off any drink!</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: CAFE PALETTE THEME SELECTOR */}
          {activeTab === 'theme' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="font-serif-cafe text-base font-bold text-[#2C1810]">
                  Choose Your Preferred Café Aesthetic Theme
                </h4>
                <p className="text-xs text-[#7C6656] mt-0.5">
                  Personalize the ambiance of your White Haven experience. All palettes are curated strictly within our artisanal roastery aesthetics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableThemes.map((theme) => {
                  const isSelected = theme.id === currentTheme;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setTheme(theme.id);
                        onShowToast(`Theme switched to "${theme.name}"`);
                      }}
                      className={`text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? 'border-[#8C5332] bg-[#FAF3EC] shadow-md ring-2 ring-[#8C5332]/20'
                          : 'border-[#DECDBE] bg-white hover:border-[#8C5332]/50 hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {/* Theme Palette Bar */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <span
                          className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.bgHex }}
                          title="Background"
                        />
                        <span
                          className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.creamHex }}
                          title="Cream Card"
                        />
                        <span
                          className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.primaryHex }}
                          title="Primary Roast"
                        />
                        <span
                          className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.accentHex }}
                          title="Accent Tone"
                        />
                        <div className="ml-auto">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EFE7DD] text-[#5D4037]">
                            {theme.badge}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-serif-cafe font-bold text-sm text-[#2C1810]">
                            {theme.name}
                          </h5>
                          <p className="text-xs text-[#7C6656] mt-0.5 leading-snug">
                            {theme.tagline}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8C5332] text-white shrink-0 ml-2">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-[#F4ECE3] border border-[#DECDBE] text-xs text-[#5D4037] flex items-center gap-3">
                <Palette className="w-5 h-5 text-[#8C5332] shrink-0" />
                <p>
                  Your selected theme applies instantly across the entire menu, navigation, modals, and checkout, and remains saved for future visits.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SAVED DELIVERY ADDRESS */}
          {activeTab === 'address' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="font-serif-cafe text-base font-bold text-[#2C1810]">
                  Default Delivery Address
                </h4>
                <p className="text-xs text-[#7C6656] mt-0.5">
                  Save your home or work delivery address so you never have to re-type it during checkout!
                </p>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                {/* Address Label Radio */}
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-2">
                    Address Label
                  </label>
                  <div className="flex items-center gap-3">
                    {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setAddressLabel(lbl)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                          addressLabel === lbl
                            ? 'bg-[#3D2517] text-white border-[#3D2517]'
                            : 'bg-white text-[#5D4037] border-[#DECDBE] hover:bg-[#F5ECE2]'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                      House / Unit / Building Number *
                    </label>
                    <input
                      type="text"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      placeholder="e.g. Unit 302, Tower 1 or Lot 8 Blk 4"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                      Street / Subdivision / Compound *
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. Midway Street, Foresthill Subd."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                      Barangay
                    </label>
                    <input
                      type="text"
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      placeholder="e.g. Gulod, San Bartolome, Novaliches"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                      City / Municipality
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Quezon City, Caloocan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Beside 7-Eleven, opposite green gate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Delivery Rider Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={riderNotes}
                    onChange={(e) => setRiderNotes(e.target.value)}
                    placeholder="e.g. Please call before dropping off at the guardhouse"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                  {addressSuccessMsg && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-xs animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Address Saved Successfully!</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSaveAddress()}
                    disabled={isSavingAddress}
                    className="px-6 py-2.5 rounded-xl bg-[#8C5332] hover:bg-[#724125] active:scale-95 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingAddress ? 'Saving Address...' : 'Save Default Address'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: ACCOUNT SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h4 className="font-serif-cafe text-base font-bold text-[#2C1810]">
                  Password & Security Settings
                </h4>
                <p className="text-xs text-[#7C6656] mt-0.5">
                  Update your credentials or review your account login details.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C5332]" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C5332]" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C5332]" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DECDBE] bg-white text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#3D2517] hover:bg-[#2C1810] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              {/* Logout Option */}
              <div className="pt-6 border-t border-[#DECDBE] flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-red-800">Sign Out of Account</h5>
                  <p className="text-[11px] text-[#7C6656]">
                    You can log back in anytime with your credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                    onShowToast('You have been logged out.');
                  }}
                  className="px-4 py-2 rounded-xl border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-bold transition cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Close Bar */}
        <div className="p-4 bg-[#EFE7DD] border-t border-[#DECDBE] flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-[#7C6656] font-medium">White Haven Café Novaliches • Member Portal</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-[#D8C7B6] bg-white hover:bg-[#FAF7F2] hover:text-[#3D2517] text-xs font-bold text-[#5D4037] transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>

      </div>
    </div>
  );
};
