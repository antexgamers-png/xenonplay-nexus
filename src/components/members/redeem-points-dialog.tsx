'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { redeemMemberPoints } from '@/lib/data';
import type { Member, Reward } from '@/lib/types';
import { Gift, CheckCircle2, Ticket, Coffee, Clock, Sparkles, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

const rewardIcons = {
    time: Clock,
    item: Coffee,
    other: Sparkles
};

export function RedeemPointsDialog({ isOpen, onOpenChange, member }: { isOpen: boolean, onOpenChange: (open: boolean) => void, member: Member }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const rewardsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'rewards') : null, [firestore]);
  const { data: rewards, isLoading } = useCollection<Reward>(rewardsQuery);

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isProcessing, setIsSubmitting] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleRedeem = async () => {
    if (!firestore || !selectedReward) return;
    setIsSubmitting(true);
    try {
      const voucherCode = await redeemMemberPoints(firestore, member, selectedReward.points, selectedReward.label, selectedReward.type);
      
      if (voucherCode) {
          setGeneratedVoucher(voucherCode);
      } else {
          toast({ 
            title: 'Penukaran Berhasil!', 
            description: `${selectedReward.label} telah diberikan ke member.`,
            variant: 'success' 
          });
          onOpenChange(false);
      }
    } catch (e: any) {
      toast({ title: 'Gagal Redeem', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
      if (!generatedVoucher) return;
      navigator.clipboard.writeText(generatedVoucher);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({ title: "Kode Tersalin", variant: "success" });
  };

  const handleClose = () => {
      setGeneratedVoucher(null);
      setSelectedReward(null);
      onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if(!val) handleClose(); }}>
      <DialogContent className="max-w-md bg-background border-border">
        {!generatedVoucher ? (
            <>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black flex items-center gap-2">
                        <Gift className="h-6 w-6 text-amber-500" />
                        Tukar Poin
                    </DialogTitle>
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 mt-2 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Saldo Poin Saat Ini</p>
                            <p className="text-3xl font-black text-amber-500 font-mono">{member.points} <span className="text-sm">pts</span></p>
                        </div>
                        <Ticket className="h-10 w-10 text-amber-500/20" />
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-2.5 py-4 min-h-[200px]">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Pilih Hadiah</Label>
                    
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </div>
                    ) : (
                        <>
                            {rewards?.map(reward => {
                                const canAfford = member.points >= reward.points;
                                const Icon = rewardIcons[reward.type] || Sparkles;
                                return (
                                    <button
                                        key={reward.id}
                                        disabled={!canAfford}
                                        onClick={() => setSelectedReward(reward)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                                            selectedReward?.id === reward.id 
                                                ? "border-primary bg-primary/5" 
                                                : "bg-muted border-transparent hover:border-border",
                                            !canAfford && "opacity-40 grayscale cursor-not-allowed border-dashed"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg bg-background", reward.type === 'time' ? 'text-blue-500' : 'text-emerald-500')}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm uppercase leading-tight">{reward.label}</p>
                                                <p className="text-[10px] text-muted-foreground font-black mt-0.5">{reward.points} POIN</p>
                                            </div>
                                        </div>
                                        {selectedReward?.id === reward.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                                    </button>
                                )
                            })}
                            {rewards?.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-10 italic">
                                    Belum ada hadiah yang dikonfigurasi oleh admin.
                                </p>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t border-border">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Batal</Button>
                    </DialogClose>
                    <Button 
                        onClick={handleRedeem} 
                        disabled={!selectedReward || isProcessing} 
                        className="font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20"
                    >
                    {isProcessing ? 'Memproses...' : 'Tukar Sekarang'}
                    </Button>
                </DialogFooter>
            </>
        ) : (
            <div className="py-6 text-center space-y-6">
                <div className="size-20 rounded-[2.5rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border-4 border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                    <Ticket className="size-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Kupon Berhasil!</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Berikan kode ini kepada pelanggan</p>
                </div>

                <div 
                    className="p-8 rounded-[2rem] bg-muted/50 border-2 border-dashed border-primary/30 relative group cursor-pointer active:scale-95 transition-transform"
                    onClick={handleCopyCode}
                >
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-2">Kode Voucher</p>
                    <div className="text-4xl font-black font-mono tracking-widest text-primary uppercase select-all">
                        {generatedVoucher}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] font-black uppercase text-muted-foreground">
                        {hasCopied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        {hasCopied ? 'Tersalin!' : 'Klik Untuk Salin'}
                    </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-[10px] text-primary/70 leading-relaxed font-bold uppercase">
                        Voucher ini dapat ditukarkan di dashboard utama <br/> melaui tombol "Tukar Voucher".
                    </p>
                </div>

                <Button onClick={handleClose} className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    Selesai
                </Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
