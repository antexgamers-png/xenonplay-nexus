'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { PricingRule } from '@/lib/types';
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
import { MoreHorizontal, Pencil, Trash2, Package, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { deletePricingRule } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} Menit`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} Jam`;
  return `${hours.toFixed(1).replace('.', ',')} Jam`;
};

const PricingRuleActions: React.FC<{ rule: PricingRule; onEdit: (rule: PricingRule) => void }> = ({ rule, onEdit }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!firestore) return;
    try {
      await deletePricingRule(firestore, rule.id);
      toast({
        title: 'Sukses',
        description: 'Aturan harga berhasil dihapus.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus aturan harga.',
        variant: 'destructive',
      });
    } finally {
        setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(rule)}>
            <Pencil className="mr-2 h-4 w-4" />
            Ubah
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Ini akan menghapus aturan harga
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: 'destructive' })}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


export const getPricingColumns = (onEdit: (rule: PricingRule) => void): ColumnDef<PricingRule>[] => [
  {
    accessorKey: 'name',
    header: 'Nama Paket',
    cell: ({ row }) => (
        <div className="flex flex-col gap-1">
            <span className="font-black uppercase tracking-tight">{row.original.name || '-'}</span>
            {row.original.items && row.original.items.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] py-0 h-4">
                        <ShoppingCart className="h-2 w-2 mr-1" /> BUNDLING
                    </Badge>
                    <span className="text-[10px] text-muted-foreground italic">
                        {row.original.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                    </span>
                </div>
            )}
        </div>
    )
  },
  {
    accessorKey: 'type',
    header: 'Tipe Station',
    cell: ({ row }) => <Badge variant="secondary" className="font-bold text-[10px]">{row.original.type}</Badge>
  },
  {
    accessorKey: 'duration',
    header: 'Durasi',
    cell: ({ row }) => {
        const mins = row.original.duration;
        return (
            <div className="font-mono text-xs">
                {formatDuration(mins)}
            </div>
        )
    }
  },
  {
    accessorKey: 'price',
    header: 'Harga',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="text-right">
        <PricingRuleActions rule={row.original} onEdit={onEdit} />
      </div>
    ),
  },
];
