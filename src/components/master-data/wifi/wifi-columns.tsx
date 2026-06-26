'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { WifiPackage } from '@/lib/types';
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
import { MoreHorizontal, Pencil, Trash2, Wifi } from 'lucide-react';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { deleteWifiPackage } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

const WifiItemActions: React.FC<{ item: WifiPackage; onEdit: (item: WifiPackage) => void }> = ({ item, onEdit }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!firestore) return;
    try {
      await deleteWifiPackage(firestore, item.id);
      toast({ title: 'Sukses', description: 'Paket Wi-Fi dihapus.', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus paket.', variant: 'destructive' });
    } finally {
        setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="mr-2 h-4 w-4" /> Ubah
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus paket ini?</AlertDialogTitle>
            <AlertDialogDescription>Data paket Wi-Fi akan hilang dari daftar jualan Dashboard.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: 'destructive' })}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const getWifiColumns = (onEdit: (item: WifiPackage) => void): ColumnDef<WifiPackage>[] => [
  {
    accessorKey: 'name',
    header: 'Nama Paket Kupon',
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Wifi className="size-3" />
            </div>
            <span className="font-bold uppercase text-xs">{row.original.name}</span>
        </div>
    )
  },
  {
    accessorKey: 'price',
    header: 'Harga Jual',
    cell: ({ row }) => <span className="font-mono font-bold text-emerald-600">{formatCurrency(row.original.price)}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="text-right">
        <WifiItemActions item={row.original} onEdit={onEdit} />
      </div>
    ),
  },
];