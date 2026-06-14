
'use client';

import { useState } from 'react';
import type { MemberRequest } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, Phone, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useFirestore } from '@/firebase';
import { approveMemberRequest, deleteMemberRequest } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function RequestTable({ requests }: { requests: MemberRequest[] }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleApprove = async (request: MemberRequest) => {
    if (!firestore) return;
    setIsProcessing(request.id);
    try {
      await approveMemberRequest(firestore, request);
      toast({ 
        title: "Member Diterima", 
        description: `${request.name} kini resmi menjadi member sultan.`,
        variant: "success" 
      });
    } catch (e: any) {
      toast({ title: "Gagal Menyetujui", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!firestore) return;
    try {
      await deleteMemberRequest(firestore, requestId);
      toast({ title: "Permohonan Dihapus", variant: "success" });
    } catch (e: any) {
      toast({ title: "Gagal Menghapus", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pendaftar</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kontak (WA)</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waktu Daftar</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length > 0 ? (
            requests.sort((a,b) => b.timestamp - a.timestamp).map((r) => (
              <TableRow key={r.id} className="border-border hover:bg-muted/20 transition-colors">
                <TableCell>
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <User className="size-4" />
                        </div>
                        <span className="font-bold uppercase text-sm">{r.name}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <Phone className="size-3 text-emerald-500" />
                        {r.phone}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Calendar className="size-3" />
                        {format(r.timestamp, 'dd MMM, HH:mm', { locale: id })}
                    </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                        size="sm" 
                        className="h-8 rounded-lg font-black uppercase text-[9px] tracking-widest bg-emerald-600 hover:bg-emerald-700 gap-1.5 shadow-lg shadow-emerald-500/20"
                        onClick={() => handleApprove(r)}
                        disabled={isProcessing === r.id}
                    >
                        <Check className="size-3" /> Terima
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg">
                            <X className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-black uppercase tracking-tight text-red-600">Tolak Pendaftaran?</AlertDialogTitle>
                            <AlertDialogDescription>Data pendaftar atas nama <b>{r.name}</b> akan dihapus secara permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="font-bold">Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleReject(r.id)} className="bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px]">Hapus Data</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center flex flex-col items-center justify-center gap-3 opacity-30">
                  <User className="size-10" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Antrean Kosong</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
