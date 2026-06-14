
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { PointRedemption, Member, CreditVoucher } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { History, Gift, Ticket, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function MemberHistoryDialog({ isOpen, onOpenChange, member }: { isOpen: boolean, onOpenChange: (open: boolean) => void, member: Member }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const redeemQuery = useMemoFirebase(() => {
    if (!firestore || !member.id) return null;
    return query(collection(firestore, 'redemptions'), where('memberId', '==', member.id), limit(20));
  }, [firestore, member.id]);

  const voucherQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'vouchers'), limit(100));
  }, [firestore]);

  const { data: redemptions, isLoading } = useCollection<PointRedemption>(redeemQuery);
  const { data: vouchers } = useCollection<CreditVoucher>(voucherQuery);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: "Kode Tersalin", variant: "success" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
            <History className="h-5 w-5 text-primary" />
            Riwayat Hadiah: {member.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] py-4 pr-4">
            <div className="space-y-3">
                {isLoading ? (
                    <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">Memuat riwayat...</div>
                ) : redemptions?.length ? (
                    redemptions.sort((a,b) => b.timestamp - a.timestamp).map(r => {
                        const voucher = vouchers?.find(v => v.code === r.voucherCode);
                        const isUsed = voucher?.status === 'used';

                        return (
                            <div key={r.id} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600"><Gift className="size-4" /></div>
                                        <div>
                                            <p className="text-xs font-bold uppercase">{r.rewardLabel}</p>
                                            <p className="text-[9px] text-muted-foreground font-mono">{format(r.timestamp, 'dd MMM yyyy, HH:mm', { locale: id })}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] font-black border-emerald-500/20 text-emerald-600">-{r.pointsRedeemed} Pts</Badge>
                                </div>
                                {r.voucherCode && (
                                    <div className={cn("p-3 rounded-xl border flex items-center justify-between", isUsed ? "bg-muted/50 opacity-60" : "bg-card shadow-sm border-primary/20")}>
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                                                <Ticket className="size-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Voucher Code</span>
                                                <span className="text-sm font-black font-mono tracking-widest text-foreground">{r.voucherCode}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isUsed ? (
                                                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-red-500">
                                                    <XCircle className="size-2.5" /> Terpakai
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600">
                                                    <CheckCircle2 className="size-2.5" /> Ready
                                                </div>
                                            )}
                                            {!isUsed && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                                                    onClick={() => handleCopyCode(r.voucherCode!)}
                                                >
                                                    {copiedCode === r.voucherCode ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="py-20 text-center border-2 border-dashed rounded-3xl opacity-30">
                        <p className="text-xs font-bold uppercase tracking-widest">Belum ada riwayat redeem</p>
                    </div>
                )}
            </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
            <DialogClose asChild><Button variant="outline" className="w-full font-bold uppercase text-[10px]">Tutup</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
