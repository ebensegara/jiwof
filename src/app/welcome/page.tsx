'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    handleWelcome();
  }, []);

  const handleWelcome = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setStatus('error');
        setTimeout(() => router.push('/auth'), 2000);
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setUserName(profile?.full_name || user.email?.split('@')[0] || 'User');
      setStatus('success');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Welcome error:', error);
      setStatus('error');
      setTimeout(() => router.push('/auth'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f3] via-white to-[#f1ede8] dark:from-[#1b1918] dark:via-[#1f1d1a] dark:to-[#1b1918] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="animate-in fade-in duration-500">
            <Loader2 className="w-16 h-16 text-[#756657] animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Memverifikasi akun Anda...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Mohon tunggu sebentar
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in zoom-in duration-500">
            <div className="relative mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              <Sparkles className="w-8 h-8 text-[#756657] absolute top-0 right-1/3 animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Selamat Datang, {userName}! 🎉
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Akun Anda berhasil diverifikasi
            </p>
            
            <div className="bg-[#756657]/10 border border-[#756657]/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Anda akan diarahkan ke dashboard dalam beberapa detik...
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#756657] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#756657] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-[#756657] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifikasi Gagal
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Terjadi kesalahan saat memverifikasi akun Anda
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Mengalihkan ke halaman login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
