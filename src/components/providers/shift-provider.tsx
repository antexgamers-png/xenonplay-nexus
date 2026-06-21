
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useAuth as useFirebaseAuth } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Shift, UserRole } from '@/lib/types';
import { openShift, closeShift } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Banknote, UserCheck, Calculator, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface ShiftContextType {
  activeShift: Shift | null;
  isLoadingShift: boolean;
  openNewShift: (initialBalance: number) => Promise<void>;
  closeActiveShift: (actualBalance: number, notes: string) => Promise<void>;
  setIsOpeningDialog: (open: boolean) => void;
}

interface ShiftProviderProps {
  children: ReactNode;
  role: UserRole | null;
  isRoleLoading: boolean;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children, role, isRoleLoading }: ShiftProviderProps) {
  const firestore = useFirestore();
  const auth = useFirebaseAuth();
  const { user } = useUser(); 
  const { toast } = useToast();
  const router = useRouter();
  
  const [isOpeningDialog, setIsOpeningDialog] = useState(false);
  const [initialBalanceInput, setInitialBalanceInput] = useState('0');
  const [isProcessing, setIsSubmitting] = useState(false);

  const shiftsQuery = useMemoFirebase(() => {
    if (!firestore || isRoleLoading) return null;
    return query(collection(firestore, 'shifts'), where('status', '==', 'open'), limit(1));
  }, [firestore, isRoleLoading]);

  const { data: openShifts, isLoading: isLoadingShift } = useCollection<Shift>(shiftsQuery);
  const activeShift = openShifts && openShifts.length > 0 ? openShifts[0] : null;

  useEffect(() => {
    if (!isLoadingShift && !activeShift && !isRoleLoading && role === 'staff' && user) {
        setIsOpeningDialog(true);
    } else if (activeShift) {
        setIsOpeningDialog(false);
    }
  }, [activeShift, isLoadingShift, isRoleLoading, role, user]);

  const openNewShift = async (initialBalance: number) => {
    if (!firestore || !user) return;
    setIsSubmitting(true);
    try {
      const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Operator');
      await openShift(firestore, user.uid, displayName, initialBalance);
      toast({ title: "Buka Shift Berhasil", description: "Selamat bekerja, jaga integritas laci kasir ya!", variant: "success" });
      setIsOpeningDialog(false);
    } catch (e: any) {
      toast({ title: "Gagal buka laci", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeActiveShift = async (actualBalance: number, notes: string) => {
    if (!firestore || !activeShift) return;
    try {
      await closeShift(firestore, activeShift.id, actualBalance, notes);
      toast({ title: "Shift Ditutup", description: "Mantap, laporan kerja kamu sudah tersimpan aman.", variant: "success" });
    } catch (e: any) {
      toast({ title: "Gagal tutup shift", description: e.message, variant: "destructive" });
      throw e;
    }
  };

  const handleLogout = async () => {
      await signOut(auth);
      router.push('/login');
  }

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      openNewShift(parseInt(initialBalanceInput) || 0);
  }

  return (
    <ShiftContext.Provider value={{ activeShift, isLoadingShift, openNewShift, closeActiveShift, setIsOpeningDialog }}>
      {children}
      
      <Dialog open={isOpeningDialog} onOpenChange={(val) => {
          if (!activeShift && role === 'staff') return; 
          setIsOpeningDialog(val);
      }}>
        <DialogContent onPointerDownOutside={(e) => { if(!activeShift && role === 'staff') e.preventDefault() }} onEscapeKeyDown={(e) => { if(!activeShift && role === 'staff') e.preventDefault() }}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20">
                    <Banknote className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Persiapan Laci Kasir</DialogTitle>
                    <DialogDescription>Sistem Akuntansi XenonPlay Nexus</DialogDescription>
                </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleOpenShiftSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
                    <UserCheck className="size-4 text-primary" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Petugas Yang Bertanggung Jawab</p>
                        <p className="text-sm font-bold uppercase">{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Uang Modal Awal (Cek Laci Sekarang)</Label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">Rp</span>
                        <Input 
                            type="number"
                            className="h-16 pl-12 text-3xl font-black bg-muted border-border focus:ring-primary shadow-inner"
                            value={initialBalanceInput}
                            onChange={(e) => setInitialBalanceInput(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic px-1 text-center">Hitung uang tunai di laci kasir sekarang dan masukkan nominalnya.</p>
                </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
                <Calculator className="h-5 w-5 text-blue-500 shrink-0" />
                <p className="text-xs text-blue-600 leading-relaxed font-medium">
                    Semua transaksi yang dibayar akan dilacak otomatis oleh sistem. Jangan lupa lakukan **Tutup Shift** saat jam kerja kamu berakhir ya.
                </p>
            </div>

            <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-14 font-bold uppercase tracking-tighter" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Keluar
                </Button>
                <Button type="submit" className="flex-[2] h-14 font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-lg" disabled={isProcessing}>
                    {isProcessing ? 'Sabar Ya...' : 'Buka Laci & Mulai Kerja'}
                </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ShiftContext.Provider>
  );
}

export function useShift() {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
}
