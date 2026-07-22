import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const landingFor = (role) => role === 'citizen' ? '/citizen' : role === 'industry' ? '/industry' : '/dashboard';

export default function Login({ onNavigate }) {
  const { user, login, signUp, error, clearError } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteToken, setInviteToken] = useState(new URLSearchParams(window.location.search).get('invite') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => { if (user) onNavigate(landingFor(user.role)); }, [user, onNavigate]);
  useEffect(() => { clearError(); setLocalError(''); }, [clearError]);

  const submit = async (event) => {
    event.preventDefault(); setLocalError(''); clearError();
    if (!email || !password || (registering && !name)) return setLocalError('Complete all required fields.');
    setIsSubmitting(true);
    try {
      const session = registering ? await signUp(email, password, name, inviteToken) : await login(email, password);
      onNavigate(landingFor(session.role));
    } catch (submitError) { setLocalError(submitError.message); }
    finally { setIsSubmitting(false); }
  };

  return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-16">
    <div className="w-full max-w-md rounded-sm border border-gray-200 bg-white p-8 text-left shadow-xl">
      <div className="mb-8 text-center"><img src="/logo.png" alt="Ganga Guardian AI" className="mx-auto mb-3 h-16 w-auto" /><h1 className="font-outfit text-2xl font-black uppercase text-primary">{registering ? 'Create account' : 'System authorization'}</h1><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Ganga Guardian AI Portal</p><span className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Secure access</span></div>
      {(localError || error) && <div role="alert" className="mb-6 flex gap-3 rounded border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{localError || error}</div>}
      <form onSubmit={submit} className="space-y-5">
        {registering && <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Full name<div className="relative mt-1"><UserRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="w-full border border-gray-300 py-2.5 pl-10 pr-4 text-sm" /></div></label>}
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Email<div className="relative mt-1"><Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="w-full border border-gray-300 py-2.5 pl-10 pr-4 text-sm" /></div></label>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Password<div className="relative mt-1"><Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={registering ? 'new-password' : 'current-password'} className="w-full border border-gray-300 py-2.5 pl-10 pr-4 text-sm" /></div></label>
        {registering && <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Invitation token <span className="font-normal normal-case text-gray-400">(only for privileged roles)</span><input value={inviteToken} onChange={(event) => setInviteToken(event.target.value)} className="mt-1 w-full border border-gray-300 px-4 py-2.5 text-sm" /></label>}
        <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60">{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{registering ? 'Create account' : 'Access portal'}</button>
      </form>
      <button type="button" onClick={() => { setRegistering(!registering); setLocalError(''); clearError(); }} className="mt-6 w-full text-center text-xs font-bold text-primary underline">{registering ? 'Already have an account? Sign in' : 'Create a citizen account'}</button>
    </div>
  </div>;
}
