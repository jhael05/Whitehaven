import React, { useState, useEffect } from 'react';
import {
  signInWithGoogleDrive,
  signOutGoogleDrive,
  listDriveFiles,
  uploadFileToDrive,
  deleteFileFromDrive,
  DriveFileItem,
  getDriveAccessToken,
  initDriveAuth,
} from '../services/googleDriveService';
import { User as FirebaseUser } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CAFE_INFO, MENU_ITEMS } from '../data/menuData';
import {
  X,
  Search,
  RefreshCw,
  FileText,
  Trash2,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Folder,
  FileSpreadsheet,
  FileImage,
  File,
  HardDrive,
  Coffee,
  Plus,
} from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { user: appUser } = useAuth();
  const { orders } = useCart();

  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(getDriveAccessToken());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Confirmation Modal state for DESTRUCTIVE operation (MANDATORY per skill guidelines)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick note/file creation
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, cachedToken) => {
        setGoogleUser(user);
        setToken(cachedToken);
      },
      () => {
        // Not authenticated
        setGoogleUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch files when token is present
  const fetchFiles = async (query = '') => {
    if (!token) return;
    setIsLoadingFiles(true);
    setErrorMessage('');
    try {
      const items = await listDriveFiles(query);
      setFiles(items);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load Google Drive files.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (token && isOpen) {
      fetchFiles(searchQuery);
    }
  }, [token, isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setGoogleUser(res.user);
        setToken(res.accessToken);
        setSuccessMessage(`Connected to Google Drive as ${res.user.displayName || res.user.email}`);
        fetchFiles('');
        if (onShowToast) onShowToast('Google Drive connected successfully!');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign in with Google failed. Please allow popups.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutGoogleDrive();
      setGoogleUser(null);
      setToken(null);
      setFiles([]);
      setSuccessMessage('Disconnected from Google Drive.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error disconnecting.');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(searchQuery);
  };

  // Upload White Haven Cafe Menu to Google Drive
  const handleUploadMenu = async () => {
    if (!token) return;
    setIsUploading(true);
    setErrorMessage('');
    try {
      const menuContent = [
        '====================================================',
        'WHITE HAVEN CAFÉ - OFFICIAL MENU & DRINK GUIDE',
        `Location: ${CAFE_INFO.address}`,
        `Hours: ${CAFE_INFO.hours} | Contact: ${CAFE_INFO.phone}`,
        `Socials: ${CAFE_INFO.handle}`,
        '====================================================\n',
        'SIGNATURE & FEATURED DRINKS:\n',
        ...MENU_ITEMS.map(
          (m) =>
            `- ${m.name.padEnd(28, ' ')} ₱${m.price} [${m.category}]\n  ${m.description}\n`
        ),
        '\nCUSTOMIZATION OPTIONS:',
        '- Temperature: Iced / Hot',
        '- Sizes: Regular (16oz), Grande (22oz +₱25)',
        '- Sweetness: 0%, 25%, 50%, 75%, 100%',
        '- Milk Alternatives: Whole Milk, Oat Milk (+₱30), Almond Milk (+₱30), Soy Milk (+₱20)',
        '- Add-ons: Espresso Shot (+₱35), Coffee Jelly (+₱25), Vanilla Syrup (+₱20), Whipped Cream (+₱25)',
        '\nExported on: ' + new Date().toLocaleString(),
      ].join('\n');

      const file = await uploadFileToDrive(
        'White_Haven_Cafe_Menu.txt',
        menuContent,
        'text/plain'
      );
      setSuccessMessage(`Menu saved to Google Drive: "${file.name}"!`);
      if (onShowToast) onShowToast('Menu exported to Google Drive!');
      fetchFiles(searchQuery);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export menu.');
    } finally {
      setIsUploading(false);
    }
  };

  // Export Customer's Orders to Google Drive
  const handleExportOrders = async () => {
    if (!token) return;
    if (orders.length === 0) {
      setErrorMessage('You have no order history yet to export.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    try {
      const reportContent = [
        '====================================================',
        'WHITE HAVEN CAFÉ - CUSTOMER ORDERS HISTORY EXPORT',
        `Customer: ${appUser?.name || googleUser?.displayName || 'Guest Customer'}`,
        `Export Date: ${new Date().toLocaleString()}`,
        '====================================================\n',
        ...orders.map((o, idx) => {
          return [
            `ORDER #${idx + 1}: ${o.orderNumber}`,
            `Date: ${new Date(o.createdAt).toLocaleString()}`,
            `Dining Type: ${o.orderType.toUpperCase()} ${o.tableNumber ? `(${o.tableNumber})` : ''}`,
            `Payment: ${o.paymentMethod.toUpperCase()}`,
            `Status: ${o.status.toUpperCase()}`,
            'Items:',
            ...o.items.map(
              (i) =>
                `  - ${i.quantity}x ${i.menuItem.name} (${i.customization.size}, ${i.customization.temperature}, ${i.customization.sweetness} sweet) = ₱${i.totalPrice}`
            ),
            `Subtotal: ₱${o.subtotal} | Discount: ₱${o.discount} | TOTAL: ₱${o.total}`,
            '----------------------------------------------------\n',
          ].join('\n');
        }),
      ].join('\n');

      const file = await uploadFileToDrive(
        `White_Haven_Orders_Summary_${Date.now()}.txt`,
        reportContent,
        'text/plain'
      );
      setSuccessMessage(`Orders history saved to Google Drive: "${file.name}"!`);
      if (onShowToast) onShowToast('Orders exported to Google Drive!');
      fetchFiles(searchQuery);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export orders.');
    } finally {
      setIsUploading(false);
    }
  };

  // Create custom file in Drive
  const handleCreateCustomFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      setErrorMessage('Please enter a file name.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    try {
      const actualName = newFileName.endsWith('.txt') ? newFileName : `${newFileName}.txt`;
      const file = await uploadFileToDrive(actualName, newFileContent, 'text/plain');
      setSuccessMessage(`File "${file.name}" uploaded to Google Drive!`);
      setNewFileName('');
      setNewFileContent('');
      setIsCreatingFile(false);
      fetchFiles(searchQuery);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Confirm and execute DESTRUCTIVE deletion (MANDATORY explicit confirmation dialog)
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    setErrorMessage('');
    try {
      await deleteFileFromDrive(fileToDelete.id);
      setSuccessMessage(`"${fileToDelete.name}" was deleted from your Google Drive.`);
      if (onShowToast) onShowToast('File deleted from Google Drive.');
      setFileToDelete(null);
      fetchFiles(searchQuery);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete file.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder className="w-5 h-5 text-amber-600" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('sheet') || mimeType.includes('excel'))
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (mimeType.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes('text') || mimeType.includes('document'))
      return <FileText className="w-5 h-5 text-[#8C5332]" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 rounded-3xl bg-[#FAF7F2] shadow-2xl border border-[#D8C7B6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#3D2517] text-[#FAF7F2] px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <HardDrive className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="font-serif-cafe text-lg font-bold tracking-wide flex items-center gap-2">
                Google Drive Integration
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-sans uppercase font-bold">
                  Official 1P OAuth
                </span>
              </h2>
              <p className="text-xs text-[#E8DCCF]/80">
                Browse files, export receipts, and save cafe orders directly to Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notices */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-100 border border-red-300 text-xs text-red-900 flex items-start gap-2 animate-fade-in shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-start gap-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Auth State Panel */}
          {!token ? (
            <div className="rounded-2xl border border-[#D8C7B6] bg-[#F5ECE2] p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md border border-[#DECDBE]">
                <HardDrive className="w-8 h-8 text-[#8C5332]" />
              </div>

              <div className="max-w-md mx-auto">
                <h3 className="font-serif-cafe text-base font-bold text-[#2C1810]">
                  Connect Your Google Drive
                </h3>
                <p className="text-xs text-[#5D4037] mt-1">
                  Connect your Google account with permission to store White Haven Café order receipts,
                  export menus, and manage your drive documents directly from this application.
                </p>
              </div>

              {/* Official Google Material Button per Workspace integration guideline */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-3 rounded-full bg-white border border-[#747775] px-6 py-3 text-sm font-semibold text-[#1f1f1f] shadow-md hover:bg-gray-50 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isLoggingIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Connected User Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#DECDBE] shadow-sm">
                <div className="flex items-center gap-3">
                  {googleUser?.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt="Google User"
                      className="w-10 h-10 rounded-full border border-emerald-400"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      {googleUser?.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-[#2C1810] flex items-center gap-1.5">
                      <span>{googleUser?.displayName || 'Google Drive User'}</span>
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-[11px] text-gray-500">{googleUser?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchFiles(searchQuery)}
                    className="flex items-center gap-1 rounded-xl border border-[#D8C7B6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#5D4037] hover:bg-white transition-colors cursor-pointer"
                    title="Refresh files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleSignOut}
                    className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleUploadMenu}
                  className="flex items-center gap-2.5 rounded-2xl bg-[#EFE8DF] hover:bg-[#E5DCD1] p-3 text-left border border-[#D8C7B6] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#8C5332] text-white flex items-center justify-center shrink-0">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#2C1810]">Export Cafe Menu</div>
                    <div className="text-[10px] text-[#7C6656]">Save menu text to Drive</div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isUploading || orders.length === 0}
                  onClick={handleExportOrders}
                  className="flex items-center gap-2.5 rounded-2xl bg-[#EFE8DF] hover:bg-[#E5DCD1] p-3 text-left border border-[#D8C7B6] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#3D2517] text-white flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#2C1810]">Export All Orders</div>
                    <div className="text-[10px] text-[#7C6656]">{orders.length} past order(s)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreatingFile(!isCreatingFile)}
                  className="flex items-center gap-2.5 rounded-2xl bg-[#EFE8DF] hover:bg-[#E5DCD1] p-3 text-left border border-[#D8C7B6] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#2C1810] text-white flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#2C1810]">New Drive File</div>
                    <div className="text-[10px] text-[#7C6656]">Write note or document</div>
                  </div>
                </button>
              </div>

              {/* Create Custom File Form */}
              {isCreatingFile && (
                <form
                  onSubmit={handleCreateCustomFile}
                  className="rounded-2xl bg-white p-4 border border-[#8C5332] space-y-3 shadow-md animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#2C1810]">Create Document in Google Drive</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingFile(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5D4037] mb-1">
                      File Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="e.g. White_Haven_Notes.txt"
                      className="w-full rounded-xl border border-[#D8C7B6] px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5D4037] mb-1">
                      File Contents
                    </label>
                    <textarea
                      rows={3}
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      placeholder="Type your notes or document text here..."
                      className="w-full rounded-xl border border-[#D8C7B6] px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingFile(false)}
                      className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="rounded-xl bg-[#3D2517] hover:bg-[#2C1810] text-white px-4 py-1.5 text-xs font-semibold shadow disabled:opacity-50"
                    >
                      {isUploading ? 'Uploading...' : 'Save to Google Drive'}
                    </button>
                  </div>
                </form>
              )}

              {/* Search Bar & Files Count */}
              <div className="space-y-2">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search files in your Google Drive..."
                      className="w-full rounded-xl border border-[#D8C7B6] bg-white pl-9 pr-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#8C5332] hover:bg-[#734327] text-white px-4 py-2 text-xs font-semibold shadow cursor-pointer"
                  >
                    Search
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        fetchFiles('');
                      }}
                      className="rounded-xl border border-[#D8C7B6] bg-white px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </form>

                <div className="flex items-center justify-between text-[11px] text-[#7C6656] px-1">
                  <span>
                    {isLoadingFiles ? 'Loading files...' : `Showing ${files.length} file(s) from Drive`}
                  </span>
                  <span>Ordered by recently modified</span>
                </div>
              </div>

              {/* Files List */}
              <div className="rounded-2xl border border-[#DECDBE] bg-white divide-y divide-[#EFE8DF] overflow-hidden max-h-[360px] overflow-y-auto">
                {isLoadingFiles ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#8C5332] mb-2" />
                    Loading your Google Drive files...
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 space-y-1">
                    <File className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                    <p className="font-semibold text-gray-700">No files found</p>
                    <p className="text-[11px] text-gray-400">
                      Use the quick buttons above to export the White Haven Cafe menu or orders!
                    </p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF7F2] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0">{getFileIcon(file.mimeType)}</div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2C1810] truncate" title={file.name}>
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            {file.modifiedTime && (
                              <span>
                                {new Date(file.modifiedTime).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                            {file.size && <span>• {(Number(file.size) / 1024).toFixed(1)} KB</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-[#D8C7B6] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5D4037] hover:bg-[#FAF7F2] transition-colors"
                            title="Open file in Google Drive"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {/* Explicit Delete Action button that triggers mandatory confirmation dialog */}
                        <button
                          type="button"
                          onClick={() => setFileToDelete(file)}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete file from Google Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#EFE8DF] px-6 py-3.5 border-t border-[#D8C7B6] flex items-center justify-between text-xs text-[#7C6656] shrink-0">
          <span>White Haven Café × Google Drive Integration</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] px-4 py-1.5 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* ========================================================
          MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE ACTION
          Per Workspace Integration Skill: "NEVER execute a destructive
          or mutating API call without first presenting the user with a
          clear confirmation dialog."
         ======================================================== */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  Delete File from Google Drive?
                </h4>
                <p className="text-xs text-gray-500">This action will delete the file permanently.</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 border border-gray-200 text-xs">
              <div className="font-semibold text-gray-800 truncate">{fileToDelete.name}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{fileToDelete.mimeType}</div>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to delete this file from your personal Google Drive account? You
              cannot undo this action.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setFileToDelete(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteFile}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
