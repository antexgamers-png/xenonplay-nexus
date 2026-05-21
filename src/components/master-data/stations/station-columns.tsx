
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Station } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Network, ShieldCheck, RefreshCw, Activity, WifiOff, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { deleteStation, triggerADBAction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Sub-komponen untuk menangani status link yang berdetak (real-time)
const HardwareLinkStatus = ({ station }: { station: Station }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 10000);
        return () => clearInterval(interval);
    }, []);

    // Konversi heartbeat ke millis untuk perbandingan yang aman
    const hbMillis = station.last_heartbeat?.toMillis ? station.last_heartbeat.toMillis() : station.last_heartbeat || 0;
    const isOnline = hbMillis && (now - hbMillis < 45000);

    return (
        <div className="flex items-center gap-2">
            {isOnline ? (
                <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black uppercase shadow-lg shadow-emerald-500/20 px-2 py-0.5 animate-in zoom-in duration-300">
                    <ShieldCheck className="h-2.5 w-2.5 mr-1" /> Verified Link
                </Badge>
            ) : (
                <Badge variant="outline" className="text-[9px] font-black uppercase opacity-60 bg-red-500/5 text-red-500 border-red-500/20 px-2 py-0.5">
                    <WifiOff className="h-2.5 w-2.5 mr-1" /> No Response
                </Badge>
            )}
        </div>
    );
};

const StationActions: React.FC<{ station: Station; onEdit: (station: Station) => void }> = ({ station, onEdit }) => {
  const [isPinging, setIsPinging] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handlePing = async () => {
    if (!firestore) return;
    setIsPinging(true);
    try {
        await triggerADBAction(firestore, station.id, 'ping');
        toast({ 
            title: "Memulai Verifikasi Hardware", 
            description: `Bridge sedang mencoba menyambung ke ${station.ipAddress}...`, 
            variant: "success" 
        });
    } catch (e) {
        toast({ title: "Gagal Mengirim Perintah", variant: "destructive" });
    } finally {
        setTimeout(() => setIsPinging(false), 3000);
    }
  }

  const handleDelete = async () => {
    if (!firestore) return;
    try {
      await deleteStation(firestore, station.id);
      toast({
        title: 'Sukses',
        description: 'Stasiun berhasil dihapus.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus stasiun.',
        variant: 'destructive',
      });
    } finally {
        setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className={cn(
            "h-8 text-[10px] font-black uppercase tracking-widest gap-1.5 border-primary/20 text-primary hover:bg-primary/5",
            isPinging && "animate-pulse"
        )}
        onClick={handlePing}
        disabled={isPinging}
      >
        {isPinging ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
        Verifikasi Link
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(station)}>
            <Pencil className="mr-2 h-4 w-4" />
            Ubah Konfigurasi
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Stasiun
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus unit hardware ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Seluruh riwayat status unit ini akan hilang. Pastikan Anda tidak sedang menjalankan sesi aktif di unit ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: 'destructive' })}>
              Hapus Selamanya
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const getStationColumns = (onEdit: (station: Station) => void): ColumnDef<Station>[] => [
  {
    accessorKey: 'name',
    header: 'Identitas TV',
    cell: ({ row }) => (
        <div className="flex flex-col">
            <span className="font-black uppercase tracking-tight text-sm">{row.original.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[8px] font-black px-1.5 h-4 bg-primary/5 text-primary border-primary/20 tracking-wider">ID: {row.original.id}</Badge>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Tipe: {row.original.type}</span>
            </div>
        </div>
    )
  },
  {
    id: 'hdmi_input',
    header: 'Port HDMI',
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Zap className="h-3 w-3" />
            </div>
            <span className="text-xs font-black uppercase">HDMI {row.original.hdmiIndex || 1}</span>
        </div>
    )
  },
  {
    accessorKey: 'ipAddress',
    header: 'ADB Address (IP)',
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-muted border border-border">
                <Network className="h-3 w-3 text-primary" />
            </div>
            <span className="font-mono text-xs font-bold">{row.original.ipAddress || 'Native Client'}</span>
        </div>
    )
  },
  {
    id: 'link_status',
    header: 'Hardware Link',
    cell: ({ row }) => <HardwareLinkStatus station={row.original} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <StationActions station={row.original} onEdit={onEdit} />
    ),
  },
];
