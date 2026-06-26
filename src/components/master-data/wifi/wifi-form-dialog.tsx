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
import { addWifiPackage, updateWifiPackage } from '@/lib/data';
import type { WifiPackage } from '@/lib/types';
import { Wifi } from 'lucide-react';

const wifiPackageSchema = z.object({
  name: z.string().min(1, 'Nama paket wajib diisi'),
  price: z.coerce.number().min(0, 'Harga harus valid'),
});

type WifiPackageFormData = z.infer<typeof wifiPackageSchema>;

export function WifiFormDialog({ isOpen, onOpenChange, item }: { isOpen: boolean, onOpenChange: (open: boolean) => void, item?: WifiPackage }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WifiPackageFormData>({
    resolver: zodResolver(wifiPackageSchema),
    defaultValues: { name: '', price: 0 }
  });

  useEffect(() => {
    if (isOpen) {
      if (item) reset(item);
      else reset({ name: '', price: 0 });
    }
  }, [item, reset, isOpen]);

  const onSubmit = async (data: WifiPackageFormData) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (item) {
        await updateWifiPackage(firestore, item.id, data);
        toast({ title: 'Berhasil', description: 'Paket Wi-Fi diperbarui.', variant: 'success' });
      } else {
        await addWifiPackage(firestore, data);
        toast({ title: 'Berhasil', description: 'Paket Wi-Fi ditambahkan.', variant: 'success' });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan data.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 uppercase font-black tracking-tight">
              <Wifi className="size-5 text-primary" />
              {item ? 'Ubah Paket Wi-Fi' : 'Tambah Paket Wi-Fi'}
          </DialogTitle>
          <DialogDescription>Atur nama paket dan harga untuk kupon Wi-Fi.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nama Paket (Misal: Wi-Fi 2 Jam)</Label>
            <Input {...register('name')} placeholder="Wi-Fi 1 Hari / 5 Jam" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Harga (IDR)</Label>
            <Input type="number" {...register('price')} />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Simpan Paket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}