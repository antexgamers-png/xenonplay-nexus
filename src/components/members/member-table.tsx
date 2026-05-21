'use client';

import { useMemo, useState } from 'react';
import type { Member } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Gift, History, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useFirestore } from '@/firebase';
import { deleteMember } from '@/lib/data';
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
import { RedeemPointsDialog } from './redeem-points-dialog';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function MemberTable({ data, onEdit }: { data: Member[], onEdit: (m: Member) => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  const handleDelete = async (memberId: string) => {
    if (!firestore) return;
    try {
      await deleteMember(firestore, memberId);
      toast({ title: "Member Dihapus", variant: "success" });
    } catch (e: any) {
      toast({ title: "Gagal Menghapus", description: e.message, variant: "destructive" });
    }
  };

  const handleRedeem = (member: Member) => {
    setSelectedMember(member);
    setIsRedeemOpen(true);
  };

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nama Member</TableHead>
            <TableHead>Kontak</TableHead>
            <TableHead className="text-center">Progres Stempel</TableHead>
            <TableHead className="text-center">Total Poin</TableHead>
            <TableHead>Tgl Gabung</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-bold">{m.name}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{m.phone}</TableCell>
                <TableCell>
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "size-4 rounded-sm border-[1px] flex items-center justify-center p-0.5",
                                        i < (m.stamps || 0) ? "bg-primary/5 border-primary/30" : "bg-muted border-border"
                                    )} 
                                >
                                    {i < (m.stamps || 0) && (
                                        <div className="relative size-full">
                                            <Image src="/xenonplay-logo.png" alt="Logo" fill className="object-contain" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
                            {m.stamps || 0} / 10 Stamp
                        </span>
                    </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-black">
                    {m.points || 0} pts
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(m.joinDate, 'dd MMM yyyy', { locale: id })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] uppercase font-black border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                        onClick={() => handleRedeem(m)}
                    >
                        <Gift className="h-3 w-3 mr-1" /> Redeem
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Member?</AlertDialogTitle>
                          <AlertDialogDescription>Data member <b>{m.name}</b> dan seluruh poinnya akan hilang permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(m.id)} className="bg-destructive">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">Belum ada member terdaftar.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedMember && (
        <RedeemPointsDialog 
            isOpen={isRedeemOpen}
            onOpenChange={setIsRedeemOpen}
            member={selectedMember}
        />
      )}
    </div>
  );
}
