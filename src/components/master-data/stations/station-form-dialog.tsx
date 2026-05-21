
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addStation, updateStation } from '@/lib/data';
import type { Station } from '@/lib/types';
import { Network, Info, KeyRound, Zap } from 'lucide-react';

const stationSchema = z.object({
  customId: z.string()
    .min(1, 'Kode Aktivasi wajib diisi')
    .max(10, 'Terlalu panjang (Maks 10 karakter)')
    .regex(/^[a-zA-Z0-9-]+$/, 'Hanya boleh huruf, angka, dan tanda hubung (-)'),
  name: z.string().min(1, 'Nama tidak boleh kosong'),
  type: z.enum(['PS3', 'PS4', 'PS5']),
  ipAddress: z.string().optional().or(z.string().length(0)),
  stationIndex: z.coerce.number().min(1, 'Nomor stasiun harus valid'),
  hdmiIndex: z.coerce.number().min(1, 'Port HDMI harus valid').max(4, 'Maks 4 port'),
});

type StationFormData = z.infer<typeof stationSchema>;

export function StationFormDialog({
  isOpen,
  onOpenChange,
  station,
}: StationFormDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StationFormData>({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      customId: '',
      name: '',
      type: 'PS4',
      ipAddress: '',
      stationIndex: 1,
      hdmiIndex: 1,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (station) {
        reset({ 
          customId: station.id,
          name: station.name, 
          type: station.type, 
          ipAddress: station.ipAddress || '',
          stationIndex: station.stationIndex || 1,
          hdmiIndex: station.hdmiIndex || 1,
        });
      } else {
        reset({
          customId: '',
          name: '',
          type: 'PS4',
          ipAddress: '',
          stationIndex: 1,
          hdmiIndex: 1,
        });
      }
    }
  }, [station, reset, isOpen]);

  const onSubmit = async (data: StationFormData) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (station) {
        const { customId, ...updates } = data;
        await updateStation(firestore, station.id, updates);
        toast({
          title: 'Sukses',
          description: 'Konfigurasi stasiun diperbarui.',
          variant: 'success',
        });
      } else {
        const { customId, ...stationData } = data;
        await addStation(firestore, customId.toLowerCase(), stationData);
        toast({
          title: 'Sukses',
          description: `Stasiun baru dengan ID "${customId}" didaftarkan.`,
          variant: 'success',
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan data stasiun.',
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
          <DialogTitle className="flex items-center gap-2 uppercase font-black tracking-tight">
            <Network className="size-5 text-primary" />
            {station ? 'Edit Konfigurasi TV' : 'Daftarkan TV Baru'}
          </DialogTitle>
          <DialogDescription>
            Konfigurasi unit hardware dan port input fisik.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
            <div className="flex items-center gap-2 text-primary">
                <KeyRound className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Kode Aktivasi TV (ID)</span>
            </div>
            <div className="space-y-1.5">
              <Input 
                id="customId" 
                {...register('customId')} 
                placeholder="Contoh: 1 atau tv-01" 
                className="h-12 font-black text-xl text-center uppercase tracking-widest bg-background"
                disabled={!!station}
              />
              {errors.customId && <p className="text-[10px] text-red-500 font-bold text-center">{errors.customId.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Stasiun (Tampilan)</Label>
            <Input id="name" {...register('name')} placeholder="Contoh: Station 1" className="bg-muted/50" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="type">Tipe Konsol</Label>
                <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="type" className="bg-muted/50">
                        <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PS3">PS3</SelectItem>
                        <SelectItem value="PS4">PS4</SelectItem>
                        <SelectItem value="PS5">PS5</SelectItem>
                    </SelectContent>
                    </Select>
                )}
                />
            </div>
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Zap className="size-3 text-amber-500" />
                    Port HDMI
                </Label>
                <Input id="hdmiIndex" type="number" {...register('hdmiIndex')} className="bg-muted/50 font-bold" />
                {errors.hdmiIndex && <p className="text-[10px] text-red-500 font-bold">{errors.hdmiIndex.message}</p>}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-border space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Info className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Detail Hardware (Opsional)</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ipAddress" className="text-xs">IP Lokal TV (Untuk Laptop Bridge)</Label>
              <Input id="ipAddress" {...register('ipAddress')} placeholder="Contoh: 192.168.1.15" className="h-9 font-mono text-xs" />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20">
              {isSubmitting ? 'Memproses...' : station ? 'Simpan Perubahan' : 'Daftarkan Unit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
