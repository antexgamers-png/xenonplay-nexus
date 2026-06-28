'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { CreditVoucher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ticket, Plus, History, Check, Copy, Loader2, Zap, Monitor, Clock, FileText, Pencil, Trash2, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { createManualVoucher, updateVoucher, deleteVoucher } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useShift } from '@/components/providers/shift-provider';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn, formatDuration } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export function VoucherPos() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { activeShift, setIsOpeningDialog } = useShift();
    
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        duration: '60',
        type: 'All',
        note: ''
    });

    const [lastCode, setLastCode] = useState<string | null>(null);
    const [hasCopied, setHasCopied] = useState(false);
    
    // States for Edit/Delete
    const [isEditing, setIsEditing] = useState(false);
    const [editTarget, setEditTarget] = useState<CreditVoucher | null>(null);
    const [editNote, setEditNote] = useState('');

    const vouchersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Limit 500 untuk paginasi client-side yang optimal
        return query(collection(firestore, 'vouchers'), orderBy('createdAt', 'desc'), limit(500));
    }, [firestore]);

    const { data: vouchers, isLoading } = useCollection<CreditVoucher>(vouchersQuery);

    const checkShift = () => {
        if (!activeShift) {
            toast({ title: "Akses Terkunci", description: "Harap buka shift laci kasir sebelum membuat voucher.", variant: "destructive" });
            setIsOpeningDialog(true);
            return false;
        }
        return true;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !checkShift()) return;

        setIsCreating(true);
        try {
            const code = await createManualVoucher(firestore, {
                durationMinutes: parseInt(formData.duration),
                stationType: formData.type,
                note: formData.note
            }, activeShift?.id);

            setLastCode(code);
            setFormData(prev => ({ ...prev, note: '' }));
            toast({ title: "Voucher Berhasil Dibuat!", variant: "success" });
        } catch (err: any) {
            toast({ title: "Gagal membuat voucher", description: err.message, variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateNote = async () => {
        if (!firestore || !editTarget) return;
        setIsEditing(true);
        try {
            await updateVoucher(firestore, editTarget.id, { description: editNote });
            toast({ title: "Memo Diperbarui", variant: "success" });
            setEditTarget(null);
        } catch (e: any) {
            toast({ title: "Gagal update", description: e.message, variant: "destructive" });
        } finally {
            setIsEditing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        try {
            await deleteVoucher(firestore, id);
            toast({ title: "Voucher Dihapus", variant: "success" });
        } catch (e: any) {
            toast({ title: "Gagal hapus", description: e.message, variant: "destructive" });
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
        toast({ title: "Kode voucher tersalin!", variant: "success" });
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'code',
            header: 'Kode & Deskripsi',
            cell: ({ row }: any) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-black font-mono tracking-widest text-sm text-primary">{row.original.code}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(row.original.code)}>
                            <Copy className="size-3" />
                        </Button>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight max-w-[150px] truncate">{row.original.description || 'Voucher Manual'}</span>
                </div>
            )
        },
        {
            accessorKey: 'durationMinutes',
            header: 'Durasi & Tipe',
            cell: ({ row }: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-xs">{formatDuration(row.original.durationMinutes)}</span>
                    <Badge variant="outline" className="w-fit h-4 text-[8px] font-black border-primary/20 bg-primary/5 text-primary mt-1">{row.original.stationType === 'All' ? 'SEMUA UNIT' : row.original.stationType}</Badge>
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }: any) => (
                <Badge className={cn(
                    "text-[9px] font-black border-none px-2 h-5",
                    row.original.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                )}>
                    {row.original.status === 'active' ? 'AKTIF' : 'TERPAKAI'}
                </Badge>
            )
        },
        {
            accessorKey: 'createdAt',
            header: 'Dibuat',
            cell: ({ row }: any) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase">{format(row.original.createdAt, 'dd MMM yy', { locale: id })}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">{format(row.original.createdAt, 'HH:mm')}</span>
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }: any) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditTarget(row.original); setEditNote(row.original.description || ''); }}>
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus voucher ini?</AlertDialogTitle>
                                <AlertDialogDescription>Kode <b>{row.original.code}</b> akan hilang permanen dari database.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="font-bold">Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(row.original.id)} className={buttonVariants({ variant: 'destructive' })}>Ya, Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        data: vouchers || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-primary/20 bg-primary/[0.02] rounded-[2rem] overflow-hidden shadow-sm">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Ticket className="size-4 text-primary" /> Buat Voucher Baru
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-primary/60">
                            Cetak kode waktu untuk hadiah mabar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-8 space-y-6">
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Durasi Bermain</Label>
                                <Select value={formData.duration} onValueChange={(val) => setFormData({...formData, duration: val})}>
                                    <SelectTrigger className="h-11 rounded-xl bg-background font-bold text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30">30 Menit</SelectItem>
                                        <SelectItem value="60">1 Jam (60m)</SelectItem>
                                        <SelectItem value="120">2 Jam (120m)</SelectItem>
                                        <SelectItem value="180">3 Jam (180m)</SelectItem>
                                        <SelectItem value="300">5 Jam (300m)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Tipe Unit</Label>
                                <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                                    <SelectTrigger className="h-11 rounded-xl bg-background font-bold text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">Berlaku Untuk Semua</SelectItem>
                                        <SelectItem value="PS5">Khusus PS5 Core</SelectItem>
                                        <SelectItem value="PS4">Khusus PS4 Core</SelectItem>
                                        <SelectItem value="PS3">Khusus PS3 Core</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Keterangan / Memo</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-30" />
                                    <Input 
                                        placeholder="Misal: Hadiah Lomba..." 
                                        className="h-11 pl-10 rounded-xl bg-background text-sm font-medium" 
                                        value={formData.note}
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isCreating} 
                                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-primary/20"
                            >
                                {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                                Buat Kode Voucher
                            </Button>
                        </form>

                        {lastCode && (
                            <div className="p-4 rounded-2xl bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 animate-in zoom-in duration-500">
                                <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-emerald-500/10">
                                    <span className="text-xl font-black font-mono tracking-widest text-emerald-600">{lastCode}</span>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => handleCopy(lastCode)}>
                                        {hasCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                    <Zap className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-amber-700 leading-relaxed font-bold uppercase">
                        Voucher mabar tidak memotong saldo kasir saat dibuat. Saldo baru akan bertambah jika voucher dijual melalui menu kasir/wifi.
                    </p>
                </div>
            </div>

            <div className="lg:col-span-8">
                <Card className="rounded-[2rem] overflow-hidden border shadow-sm h-full flex flex-col">
                    <CardHeader className="bg-muted/20 border-b p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <History className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Daftar Voucher</CardTitle>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Manajemen kode mabar tersimpan</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                        <ScrollArea className="flex-1 h-[480px]">
                            <Table>
                                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} className="text-[9px] font-black uppercase text-muted-foreground px-6">
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [1,2,3,4,5].map(i => (
                                            <TableRow key={i}><TableCell colSpan={5} className="p-4"><div className="h-10 w-full bg-muted animate-pulse rounded-lg" /></TableCell></TableRow>
                                        ))
                                    ) : table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map(row => (
                                            <TableRow key={row.id} className="border-border group hover:bg-muted/20 transition-colors h-16">
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id} className="px-6">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic text-xs">Belum ada voucher tersimpan.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                        
                        <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Tampilkan</p>
                                <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(v) => table.setPageSize(Number(v))}>
                                    <SelectTrigger className="h-8 w-[70px] text-xs font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 20, 50, 100].map(size => <SelectItem key={size} value={`${size}`} className="text-xs">{size}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">
                                    Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                                </span>
                                <div className="flex gap-1">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* EDIT DIALOG */}
            <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
                <DialogContent className="max-w-sm rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 uppercase font-black tracking-tight">
                            <Pencil className="size-4 text-primary" /> Edit Memo Voucher
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase ml-1">Keterangan Baru</Label>
                            <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} className="font-medium" />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild><Button variant="outline" className="font-bold">Batal</Button></DialogClose>
                        <Button onClick={handleUpdateNote} disabled={isEditing} className="font-black uppercase tracking-widest px-6">
                            {isEditing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
