'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { updateProfile, verifyDeletionPassword as verifyCurrentPassword } from '@/lib/actions/user';
import { getAllUsers, createAdminUser, deleteUser } from '@/lib/actions/admin';
import { User, Mail, Lock, ShieldAlert, CheckCircle2, Loader2, Settings, Trash2, Pencil, Check, X as CloseIcon, Eye, EyeOff, UserPlus, Users, ShieldCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import ConfirmModal from '@/components/ConfirmModal';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Section editing states
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Admin management states
    const [adminList, setAdminList] = useState<any[]>([]);
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const [adminFormState, setAdminFormState] = useState({ name: '', email: '', password: '' });
    const [adminStatus, setAdminStatus] = useState({ success: '', error: '' });
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [isListLoading, setIsListLoading] = useState(true);
    const [listError, setListError] = useState('');
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (session?.user?.name) setName(session.user.name);

        if (session?.user?.isAdmin) {
            fetchUsers();
        } else {
            setIsListLoading(false);
        }
    }, [session]);

    const fetchUsers = async () => {
        setIsListLoading(true);
        setListError('');
        try {
            const data = await getAllUsers();
            setAdminList(data);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setListError(err.message || 'Failed to load users list');
        } finally {
            setIsListLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdminLoading(true);
        setAdminStatus({ success: '', error: '' });

        // Basic Validation
        if (!adminFormState.email.includes('@')) {
            setAdminStatus({ success: '', error: 'Please enter a valid email address.' });
            setIsAdminLoading(false);
            return;
        }
        if (adminFormState.password.length < 6) {
            setAdminStatus({ success: '', error: 'Password must be at least 6 characters long.' });
            setIsAdminLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', adminFormState.name);
            formData.append('email', adminFormState.email);
            formData.append('password', adminFormState.password);

            const res = await createAdminUser(formData);
            if (res.success) {
                setAdminStatus({ success: 'New admin created successfully!', error: '' });
                setAdminFormState({ name: '', email: '', password: '' });
                fetchUsers();
            }
        } catch (err: any) {
            setAdminStatus({ success: '', error: err.message || 'Failed to create admin' });
        } finally {
            setIsAdminLoading(false);
        }
    };

    const initiateDeleteUser = (user: any) => {
        setUserToDelete(user);
        setIsConfirmingDelete(true);
        setConfirmAdminPassword('');
        setAdminStatus({ success: '', error: '' });
    };

    const handleConfirmDeleteUser = async () => {
        if (!userToDelete) return;
        if (!confirmAdminPassword) {
            setAdminStatus({ success: '', error: 'Please enter your admin password' });
            return;
        }

        setDeleteLoading(userToDelete._id);
        setIsAdminLoading(true); // Reusing for modal button state

        try {
            const res = await deleteUser(userToDelete._id, confirmAdminPassword);
            if (res.success) {
                setAdminStatus({ success: `Account for ${userToDelete.name} deleted successfully.`, error: '' });
                setIsConfirmingDelete(false);
                fetchUsers();
            } else {
                setAdminStatus({ success: '', error: res.error || 'Verification failed' });
            }
        } catch (err: any) {
            setAdminStatus({ success: '', error: err.message || 'Verification failed' });
        } finally {
            setDeleteLoading(null);
            setIsAdminLoading(false);
        }
    };

    const validatePassword = (pass: string) => {
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        return pass.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
    };

    if (status === 'loading') return null;
    if (!session) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Redirecting...</div>;

    const handlePreValidation = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        setOldPasswordError('');
        setNewPasswordError('');
        setIsValidating(true);

        let hasError = false;

        if (isEditingName && !name.trim()) {
            setError('Full name is required.');
            hasError = true;
        }

        if (isEditingPassword) {
            if (!oldPassword) {
                setOldPasswordError('Current password is required to change password.');
                hasError = true;
            }
            if (!password) {
                setNewPasswordError('New password is required.');
                hasError = true;
            } else if (!validatePassword(password)) {
                setNewPasswordError('Password must be 8+ chars with uppercase, lowercase, number, and special char.');
                hasError = true;
                setPassword('');
            }

            // Verify current password on server BEFORE showing modal
            if (!hasError && oldPassword) {
                try {
                    const result = await verifyCurrentPassword(oldPassword);
                    if (!result.success) {
                        setOldPasswordError(result.error || 'Incorrect current password');
                        setOldPassword('');
                        hasError = true;
                    }
                } catch (err) {
                    setOldPasswordError('Verification failed. Please try again.');
                    hasError = true;
                }
            }
        }

        setIsValidating(false);
        if (!hasError) {
            setShowConfirmModal(true);
        }
    };

    const handleUpdate = async () => {
        // Clear previous state
        setSuccess('');
        setError('');
        setOldPasswordError('');
        setNewPasswordError('');

        if (isEditingPassword && !validatePassword(password)) {
            setNewPasswordError('Password must be 8+ chars with uppercase, lowercase, number, and special char.');
            setPassword(''); // Clear new password as requested
            setShowConfirmModal(false);
            return;
        }

        setLoading(true);
        setShowConfirmModal(false);

        try {
            await updateProfile({
                name: isEditingName ? name : undefined,
                password: isEditingPassword ? password : undefined,
                oldPassword: isEditingPassword ? oldPassword : undefined
            });
            setSuccess('Profile updated successfully!');
            setPassword('');
            setOldPassword('');
            setIsEditingName(false);
            setIsEditingPassword(false);
        } catch (err: any) {
            const msg = err.message || 'Update failed';

            // Targeted error handling
            if (msg.toLowerCase().includes('current password')) {
                setOldPasswordError(msg);
                setOldPassword(''); // Only clear current password
            } else if (isEditingPassword) {
                setNewPasswordError(msg);
                setPassword(''); // Clear new password for other password errors
            } else {
                setError(msg); // General error (e.g. name update failure)
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-background text-foreground flex flex-col">
            <Header />

            <div className="mx-auto flex w-full max-w-6xl flex-grow flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                <header className="mb-8 w-full space-y-2 sm:mb-10">
                    <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                        <Settings className="w-3 h-3" /> Account Settings
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Your Profile</h1>
                    <p className="text-muted-foreground">Manage your private information and security.</p>
                </header>

                <div className="grid w-full min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
                    {/* Main Settings Area */}
                    <div className="min-w-0 space-y-10 sm:space-y-12">

                        <form onSubmit={handlePreValidation} className="space-y-8">
                            <div className="bg-card border border-border rounded-3xl p-4 shadow-sm sm:p-6 lg:p-8 space-y-6">
                                <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between pl-1">
                                            <label htmlFor="fullName" className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Full Name</label>
                                            {!isEditingName ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingName(true)}
                                                    className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                                                >
                                                    <Pencil className="w-3 h-3" /> Edit
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsEditingName(false); setName(session?.user?.name || ''); }}
                                                    className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                                                >
                                                    <CloseIcon className="w-3 h-3" /> Cancel
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                value={name}
                                                disabled={!isEditingName}
                                                onChange={(e) => setName(e.target.value)}
                                                className={`w-full bg-background border border-input rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground sm:px-6 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium ${!isEditingName ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                                                placeholder="Full Name"
                                            />
                                            <User className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between pl-1">
                                            <label htmlFor="emailAddress" className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Email Address</label>
                                            <span className="text-[10px] font-black uppercase text-gray-600 flex items-center gap-1">
                                                Read Only
                                            </span>
                                        </div>
                                        <div className="relative opacity-50">
                                            <input
                                                id="emailAddress"
                                                name="email"
                                                type="email"
                                                value={session.user.email || ''}
                                                disabled
                                                className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground cursor-not-allowed sm:px-6 sm:py-4"
                                            />
                                            <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-border">
                                    <div className="flex items-center justify-between pl-1">
                                        <label htmlFor="newPassword" className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Update Password</label>
                                        {!isEditingPassword ? (
                                            <button
                                                type="button"
                                                onClick={() => { setIsEditingPassword(true); setPassword(''); setOldPassword(''); }}
                                                className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                                            >
                                                <Pencil className="w-3 h-3" /> Edit
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => { setIsEditingPassword(false); setPassword(''); setOldPassword(''); }}
                                                className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                                            >
                                                <CloseIcon className="w-3 h-3" /> Cancel
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {isEditingPassword && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label htmlFor="oldPassword" className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-1">Current Password Required</label>
                                                <div className="relative">
                                                    <input
                                                        id="oldPassword"
                                                        name="oldPassword"
                                                        type={showOldPassword ? "text" : "password"}
                                                        value={oldPassword}
                                                        autoComplete="off"
                                                        data-lpignore="true"
                                                        autoFocus
                                                        onChange={(e) => setOldPassword(e.target.value)}
                                                        className="w-full bg-background border border-input rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground sm:px-6 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium pr-12"
                                                        placeholder="Enter current password"
                                                        required
                                                    />
                                                    <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                                        className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors"
                                                    >
                                                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {oldPasswordError && (
                                                    <div className="text-red-500 text-[10px] font-black uppercase tracking-widest pl-1 mt-1 animate-in fade-in slide-in-from-top-1">
                                                        {oldPasswordError}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {isEditingPassword && <label htmlFor="newPassword" className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-1">New Password</label>}
                                            <div className="relative">
                                                <input
                                                    id="newPassword"
                                                    name="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={password}
                                                    autoComplete="new-password"
                                                    disabled={!isEditingPassword}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className={`w-full bg-background border border-input rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground sm:px-6 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium pr-12 ${!isEditingPassword ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                                                    placeholder={isEditingPassword ? "New Password" : "••••••••"}
                                                    required={isEditingPassword}
                                                />
                                                <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                                {isEditingPassword && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors"
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </div>

                                            {newPasswordError && (
                                                <div className="text-red-500 text-[10px] font-black uppercase tracking-widest pl-1 py-1 animate-in fade-in slide-in-from-top-1">
                                                    {newPasswordError}
                                                </div>
                                            )}
                                            {isEditingPassword && password && (
                                                <div className="space-y-3 mt-3 px-1">
                                                    <div className="flex gap-1.5">
                                                        {[1, 2, 3, 4].map((step) => {
                                                            const criteriaMet = [
                                                                password.length >= 8,
                                                                /[A-Z]/.test(password),
                                                                /[a-z]/.test(password),
                                                                /[0-9]/.test(password),
                                                                /[!@#$%^&*(),.?":{}|<>]/.test(password)
                                                            ].filter(Boolean).length;

                                                            let isActive = false;
                                                            if (step === 1 && criteriaMet >= 1) isActive = true;
                                                            if (step === 2 && criteriaMet >= 3) isActive = true;
                                                            if (step === 3 && criteriaMet >= 4) isActive = true;
                                                            if (step === 4 && criteriaMet >= 5) isActive = true;

                                                            let colorClass = 'bg-white/10';
                                                            if (isActive) {
                                                                if (criteriaMet <= 2) colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
                                                                else if (criteriaMet === 3) colorClass = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
                                                                else if (criteriaMet === 4) colorClass = 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
                                                                else colorClass = 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
                                                            }

                                                            return (
                                                                <div
                                                                    key={step}
                                                                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${colorClass}`}
                                                                />
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Security Strength</p>
                                                        {(() => {
                                                            const criteriaMet = [
                                                                password.length >= 8,
                                                                /[A-Z]/.test(password),
                                                                /[a-z]/.test(password),
                                                                /[0-9]/.test(password),
                                                                /[!@#$%^&*(),.?":{}|<>]/.test(password)
                                                            ].filter(Boolean).length;

                                                            let label = 'Weak';
                                                            let color = 'text-red-500';
                                                            if (criteriaMet >= 5) { label = 'Strong'; color = 'text-green-500'; }
                                                            else if (criteriaMet >= 4) { label = 'Good'; color = 'text-blue-500'; }
                                                            else if (criteriaMet >= 3) { label = 'Moderate'; color = 'text-yellow-500'; }
                                                            else if (criteriaMet >= 2) { label = 'Weak'; color = 'text-red-500'; }

                                                            return <span className={`text-[9px] font-black uppercase tracking-widest ${color} animate-in fade-in zoom-in-95`}>{label}</span>;
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer actions inside the main div */}
                                <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        {success && <div className="flex items-center gap-2 text-green-500 text-xs font-bold animate-in fade-in slide-in-from-top-2"><CheckCircle2 className="w-4 h-4" /> {success}</div>}
                                        {error && !isEditingPassword && <div className="text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">{error}</div>}
                                    </div>
                                    {(isEditingName || isEditingPassword) && (
                                        <Button
                                            type="submit"
                                            disabled={loading || isValidating}
                                            className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground sm:w-auto sm:px-10 font-black uppercase tracking-widest hover:bg-gray-200 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-[10px]"
                                        >
                                            {(loading || isValidating) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save Changes</>}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* Admin Management Section */}
                        {session?.user?.isAdmin && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="w-full min-w-0 space-y-8 pt-2 sm:space-y-10 sm:pt-4"
                            >
                                <header className="space-y-2">
                                    <div className="flex items-center gap-3 text-purple-500 font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                                        <ShieldAlert className="w-3 h-3" /> System Control
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">System Management</h2>
                                    <p className="text-muted-foreground text-sm">Create admins and manage all users in the system.</p>
                                </header>

                                <div className="grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:gap-6">
                                    {/* Create New Admin Form */}
                                    <div className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-sm space-y-6 sm:p-6 lg:p-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                                <UserPlus className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <h3 className="min-w-0 text-sm font-black uppercase tracking-[0.14em] text-foreground">Create New Admin</h3>
                                        </div>

                                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={adminFormState.name}
                                                    onChange={e => setAdminFormState({ ...adminFormState, name: e.target.value })}
                                                    className="w-full bg-background border border-input rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all sm:px-6 sm:py-4"
                                                    placeholder="Admin Name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={adminFormState.email}
                                                    onChange={e => setAdminFormState({ ...adminFormState, email: e.target.value })}
                                                    className="w-full bg-background border border-input rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all sm:px-6 sm:py-4 font-mono"
                                                    placeholder="admin@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Temporary Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={adminFormState.password}
                                                    onChange={e => setAdminFormState({ ...adminFormState, password: e.target.value })}
                                                    className="w-full bg-background border border-input rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all sm:px-6 sm:py-4"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            {adminStatus.error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center mt-2">{adminStatus.error}</p>}
                                            {adminStatus.success && <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest text-center mt-2">{adminStatus.success}</p>}

                                            <Button
                                                type="submit"
                                                disabled={isAdminLoading}
                                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-4"
                                            >
                                                {isAdminLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Admin'}
                                            </Button>
                                        </form>
                                    </div>

                                    {/* All Users List */}
                                    <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm flex flex-col sm:p-6 lg:p-8">
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-500/10 rounded-xl">
                                                    <Users className="w-4 h-4 text-purple-500" />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-foreground sm:text-xs">System Users</h3>
                                            </div>
                                            <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-gray-500">
                                                {adminList.length} Total
                                            </span>
                                        </div>

                                        <div className="w-full max-h-[500px] space-y-3 overflow-y-auto pr-0 scrollbar-thin sm:pr-2">
                                            {isListLoading ? (
                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="h-20 w-full bg-white/5 animate-pulse rounded-2xl" />
                                                    ))}
                                                </div>
                                            ) : listError ? (
                                                <div className="text-center py-10 space-y-3">
                                                    <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{listError}</p>
                                                    <Button type="button" onClick={fetchUsers} variant="outline" size="sm" className="border-border text-[10px] h-8">Try Again</Button>
                                                </div>
                                            ) : adminList.length === 0 ? (
                                                <p className="text-center text-gray-600 py-10 text-xs italic">No users found in the system.</p>
                                            ) : (
                                                adminList.map((adm) => (
                                                    <div key={adm._id} className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 transition-all hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 group">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={cn(
                                                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                                                adm.role === 'admin' ? "bg-blue-500/10 text-blue-500" : "bg-gray-500/10 text-gray-400"
                                                            )}>
                                                                {adm.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-xs font-black text-foreground truncate">{adm.name}</p>
                                                                    <span className={cn(
                                                                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                                                        adm.role === 'admin' ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-500"
                                                                    )}>
                                                                        {adm.role}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-gray-500 truncate font-mono">{adm.email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-end gap-3 border-t sm:border-0 pt-3 sm:pt-0 border-white/5">
                                                            {session.user.id !== adm._id ? (
                                                                <button
                                                                    onClick={() => initiateDeleteUser(adm)}
                                                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all text-[10px] font-black uppercase tracking-widest sm:opacity-0 sm:group-hover:opacity-100"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" /> <span className="sm:hidden lg:inline">Delete Account</span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-blue-500/50 px-3 py-1 bg-blue-500/5 rounded-full ring-1 ring-blue-500/20">Active Session</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Admin Delete Confirmation Modal */}
                    {isConfirmingDelete && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                                onClick={() => setIsConfirmingDelete(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="relative w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl sm:p-8 space-y-6"
                            >
                                <div className="text-center space-y-2">
                                    <div className="inline-flex p-3 bg-red-500/10 rounded-2xl mb-2">
                                        <ShieldAlert className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-white tracking-tight">Security Verification</h3>
                                    <p className="text-gray-400 text-xs">
                                        You are about to delete <span className="text-white font-bold">{userToDelete?.name}</span>'s account.
                                        Please enter <span className="text-blue-400">your admin password</span> to confirm.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Your Admin Password</label>
                                        <input
                                            type="password"
                                            value={confirmAdminPassword}
                                            onChange={(e) => setConfirmAdminPassword(e.target.value)}
                                            autoFocus
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white"
                                            placeholder="Enter your password"
                                        />
                                    </div>

                                    {adminStatus.error && (
                                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center animate-shake">
                                            {adminStatus.error}
                                        </p>
                                    )}

                                    <div className="flex flex-col gap-3">
                                        <Button
                                            onClick={handleConfirmDeleteUser}
                                            disabled={isAdminLoading}
                                            className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                                        >
                                            {isAdminLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Deletion'}
                                        </Button>
                                        <button
                                            onClick={() => setIsConfirmingDelete(false)}
                                            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors py-2"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Sidebar / Danger Zone */}
                    <div className="space-y-8">
                        <div className="bg-card border border-border rounded-3xl p-4 shadow-sm sm:p-6 lg:p-8">
                            <h3 className="text-lg font-black tracking-tight mb-4">Account Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-border">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Status</span>
                                    <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full uppercase">Verified</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Member Since</span>
                                    <span className="text-[10px] font-black text-foreground uppercase">
                                        {mounted ? (
                                            (session.user as any).createdAt ?
                                                new Date((session.user as any).createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                                                new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                        ) : '...'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-5 sm:p-8">
                            <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-[10px] mb-4">
                                <ShieldAlert className="w-3.5 h-3.5" /> Danger Zone
                            </div>
                            <p className="text-gray-500 text-[11px] font-medium leading-relaxed mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                            <Button
                                onClick={() => setShowDeleteModal(true)}
                                variant="outline"
                                className="w-full border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 rounded-2xl py-6 font-black uppercase tracking-widest text-xs transition-all"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
            />

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleUpdate}
                loading={loading}
                title="Update Profile?"
                message={`Are you sure you want to update your ${[isEditingName ? 'name' : '', isEditingPassword ? 'password' : ''].filter(Boolean).join(' and ')}?`}
            />

            <Footer />
        </main>
    );
}
