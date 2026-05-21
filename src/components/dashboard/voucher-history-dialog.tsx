
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { CreditVoucher } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { History, Ticket, Clock, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} Menit`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} Jam`;
  return `${hours.toFixed(1).replace('.', ',')} Jam`;
};

interface VoucherHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoucherHistoryDialog({ isOpen, onOpenChange }: VoucherHistoryDialogProps) {
  const firestore = useFirestore();

  const vouchersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'vouchers'), orderBy('createdAt', 'desc'), limit(50));
  }, [firestore]);

  const { data: vouchers, isLoading } = useCollection<CreditVoucher>(vouchersQuery);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Riwayat Voucher Kredit
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <ScrollArea className="h-[450px] border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="text-[10px] font-black uppercase">Kode Voucher</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Durasi & Tipe</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Tgl Simpan</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Tgl Klaim</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground animate-pulse">Memuat data...</TableCell>
                  </TableRow>
                ) : vouchers?.length ? (
                  vouchers.map((v) => (
                    <TableRow key={v.id} className="border-border text-xs">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Ticket className="size-3 text-amber-500" />
                          <span className="font-black font-mono tracking-wider">{v.code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{formatDuration(v.durationMinutes)}</span>
                          <span className="text-[9px] text-muted-foreground uppercase font-black">{v.stationType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase border-none px-2",
                          v.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                        )}>
                          {v.status === 'active' ? 'Aktif' : 'Terpakai'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(v.createdAt, 'dd/MM/yy', { locale: id })}
                        <p className="text-[9px] font-mono">{format(v.createdAt, 'HH:mm')}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.claimedAt ? (
                          <>
                            <span className="text-emerald-600 font-bold">{format(v.claimedAt, 'dd/MM/yy', { locale: id })}</span>
                            <p className="text-[9px] font-mono">{format(v.claimedAt, 'HH:mm')}</p>
                          </>
                        ) : (
                          <span className="text-[9px] italic opacity-30">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">Belum ada riwayat voucher.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
