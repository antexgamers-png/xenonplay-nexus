'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addFnbItem, updateFnbItem } from '@/lib/data';
import type { FnbItem } from '@/lib/types';

const fnbItemSchema = z.object({
  name: z.string().min(1, 'Nama barang tidak boleh kosong'),
  purchasePrice: z.coerce.number().min(0, 'Harga beli harus valid'),
  sellPrice: z.coerce.number().min(0, 'Harga jual harus valid'),
  stock: z.coerce.number().int().min(0, 'Stok harus valid'),
});

type FnbItemFormData = z.infer<typeof fnbItemSchema>;

interface FnbFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item?: FnbItem;
}

export function FnbFormDialog({
  isOpen,
  onOpenChange,
  item,
}: FnbFormDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FnbItemFormData>({
    resolver: zodResolver(fnbItemSchema),
    defaultValues: {
      name: '',
      purchasePrice: 0,
      sellPrice: 0,
      stock: 0,
    },
  });

  useEffect(() => {
    if (item) {
      reset(item);
    } else {
      reset({
        name: '',
        purchasePrice: 0,
        sellPrice: 0,
        stock: 0,
      });
    }
  }, [item, reset, isOpen]);

  const onSubmit = async (data: FnbItemFormData) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (item) {
        await updateFnbItem(firestore, item.id, data);
        toast({
          title: 'Sukses',
          description: 'Item FnB berhasil diperbarui.',
          variant: 'success',
        });
      } else {
        await addFnbItem(firestore, data);
        toast({
          title: 'Sukses',
          description: 'Item FnB baru berhasil ditambahkan.',
          variant: 'success',
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Gagal menyimpan item FnB.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Ubah Item FnB' : 'Tambah Item FnB Baru'}</DialogTitle>
          <DialogDescription>
            {item ? 'Ubah detail item FnB.' : 'Isi detail untuk item FnB baru.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Barang</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="purchasePrice">Harga Beli</Label>
                <Input id="purchasePrice" type="number" {...register('purchasePrice')} />
                {errors.purchasePrice && <p className="text-sm text-destructive">{errors.purchasePrice.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="sellPrice">Harga Jual</Label>
                <Input id="sellPrice" type="number" {...register('sellPrice')} />
                {errors.sellPrice && <p className="text-sm text-destructive">{errors.sellPrice.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stok</Label>
            <Input id="stock" type="number" {...register('stock')} />
            {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
