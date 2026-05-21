
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { LogIn, RefreshCcw, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/firebase/provider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // Redirect jika sudah login
  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/nexus');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Generate Unique Session ID untuk perangkat ini
      const newSessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('xenon_session_id', newSessionId);

      // Update Session ID & Last Login di Firestore
      if (firestore) {
          const userDocRef = doc(firestore, 'users', userCredential.user.uid);
          await updateDoc(userDocRef, {
              currentSessionId: newSessionId,
              lastLogin: Date.now()
          });
      }

      router.push('/nexus');
    } catch (error: any) {
      toast({
        title: 'Login Gagal',
        description: 'Email atau password salah. Silakan hubungi Admin jika Anda belum memiliki akun.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="absolute top-8 left-8 z-20">
          <Link href="/">
            <Button variant="ghost" className="gap-2 font-bold uppercase text-[10px] tracking-widest">
                <ArrowLeft className="size-4" /> Kembali ke Beranda
            </Button>
          </Link>
      </div>

      <Card className="w-full max-w-sm relative z-10 border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-card">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <CardHeader className="text-center pb-2 pt-10">
            <div className="flex justify-center items-center mb-6">
                <div className="relative group">
                    <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-150 transition-transform" />
                    <Image 
                        src="/xenonplay-logo.png" 
                        alt="XenonPlay Logo" 
                        width={80} 
                        height={80} 
                        className="relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-500"
                    />
                </div>
            </div>
          <CardTitle className="text-2xl font-black tracking-tighter uppercase leading-none mt-2">
            XenonPlay <span className="text-primary">Nexus</span>
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 text-muted-foreground">
            Operator Secure Access
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1">Email Operator</Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@xenonplay.com"
                required
                className="h-12 rounded-2xl bg-muted border-transparent focus:ring-primary shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="h-12 rounded-2xl bg-muted border-transparent focus:ring-primary shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/30 mt-4 text-base" disabled={isLoading}>
              {isLoading ? (
                <RefreshCcw className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
            </Button>
            
            <div className="mt-8 p-4 rounded-3xl bg-muted border border-dashed border-border">
                <p className="text-[9px] text-center text-muted-foreground uppercase font-black tracking-tighter leading-relaxed">
                    Sistem Manajemen Keamanan Tinggi.<br/>Hubungi IT Admin jika lupa kredensial.
                </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
