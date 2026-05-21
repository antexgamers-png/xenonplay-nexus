'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addReservation } from '@/lib/data';
import type { Station, PricingRule } from '@/lib/types';
import { CalendarCheck, User, Phone, Monitor, Clock, Banknote, Package, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatDuration, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const resSchema = z.object({
  customerName: z.string().min(1, 'Nama wajib diisi'),
  customerPhone: z.string().min(10, 'Nomor HP tidak valid'),
  stationId: z.string().min(1, 'Pilih stasiun'),
  startTime: z.string().min(1, 'Pilih jam mulai'),
  pricingRuleId: z.string().min(1, 'Pilih paket mabar'),
  dpAmount: z.coerce.number().min(0),
});

type ResFormData = z.infer<typeof resSchema>;

interface ReservationFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    stations: Station[];
    pricingRules: PricingRule[];
    defaultStationId?: string;
}

export function ReservationFormDialog({ 
    isOpen, 
    onOpenChange, 
    stations,
    pricingRules,
    defaultStationId
}: ReservationFormDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<ResFormData>({
    resolver: zodResolver(resSchema),
    defaultValues: { 
        customerName: '', 
        customerPhone: '', 
        stationId: '', 
        startTime: '', 
        pricingRuleId: '', 
        dpAmount: 0 
    }
  });

  const selectedStationId = watch('stationId');
  const selectedStation = useMemo(() => stations.find(s => s.id === selectedStationId), [stations, selectedStationId]);

  // Set default station if provided via props when dialog opens
  useEffect(() => {
    if (isOpen && defaultStationId) {
        setValue('stationId', defaultStationId);
    }
  }, [isOpen, defaultStationId, setValue]);

  // Filter paket berdasarkan tipe stasiun yang dipilih
  const availableRules = useMemo(() => {
      if (!selectedStation) return [];
      return pricingRules.filter(r => r.type === 'All' || r.type === selectedStation.type)
          .sort((a, b) => a.duration - b.duration);
  }, [pricingRules, selectedStation]);

  // Reset paket jika stasiun ganti secara manual (BUKAN via defaultStationId prop)
  useEffect(() => {
      if (selectedStationId && selectedStationId !== defaultStationId) {
          setValue('pricingRuleId', '');
      }
  }, [selectedStationId, defaultStationId, setValue]);

  const onSubmit = async (data: ResFormData) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      const station = stations.find(s => s.id === data.stationId);
      const rule = pricingRules.find(r => r.id === data.pricingRuleId);
      
      const [hours, minutes] = data.startTime.split(':').map(Number);
      const startTimestamp = new Date();
      startTimestamp.setHours(hours, minutes, 0, 0);

      await addReservation(firestore, {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        stationId: data.stationId,
        stationName: station?.name || 'Unknown',
        startTime: startTimestamp.getTime(),
        durationMinutes: rule?.duration || 60,
        dpAmount: data.dpAmount
      });

      toast({ title: 'Reservasi Berhasil!', description: 'Slot Anda telah kami amankan.', variant: 'success' });
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Gagal', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md bg-background border-border p-0 overflow-hidden rounded-[2rem] gap-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <DialogHeader className="px-6 pt-8 pb-2 relative z-10">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <CalendarCheck className="size-6" />
          </div>
          <DialogTitle className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
            Pesan Slot Mabar
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest mt-1">
            Amankan unit favorit kamu sekarang
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] sm:max-h-none overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6 pb-8 relative z-10">
                <div className="grid grid-cols-1 gap-5">
                    {/* Identitas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em] ml-1">
                                <User className="size-3 text-primary" /> Nama Lengkap
                            </Label>
                            <Input {...register('customerName')} placeholder="Andi Pro" className="bg-muted/40 border-transparent focus:ring-primary/20 h-12 rounded-xl" />
                            {errors.customerName && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.customerName.message}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em] ml-1">
                                <Phone className="size-3 text-primary" /> WhatsApp
                            </Label>
                            <Input {...register('customerPhone')} placeholder="0812..." className="bg-muted/40 border-transparent focus:ring-primary/20 h-12 rounded-xl font-mono" />
                            {errors.customerPhone && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.customerPhone.message}</p>}
                        </div>
                    </div>

                    {/* Unit & Waktu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em] ml-1">
                                <Monitor className="size-3 text-primary" /> Pilih Unit
                            </Label>
                            <Controller
                                name="stationId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="bg-muted/40 border-transparent h-12 rounded-xl">
                                            <SelectValue placeholder="Pilih stasiun..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {stations.map(s => (
                                                <SelectItem key={s.id} value={s.id} disabled={s.is_active}>
                                                    {s.name} ({s.type}) {s.is_active ? '- Sedang Main' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em] ml-1">
                                <Clock className="size-3 text-primary" /> Jam Mulai
                            </Label>
                            <Input type="time" {...register('startTime')} className="bg-muted/40 border-transparent h-12 rounded-xl font-mono" />
                        </div>
                    </div>

                    {/* Paket Waktu */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em] ml-1">
                            <Package className="size-3 text-primary" /> Pilih Paket Mabar
                        </Label>
                        <Controller
                            name="pricingRuleId"
                            control={control}
                            render={({ field }) => (
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                    disabled={!selectedStationId}
                                >
                                    <SelectTrigger className="bg-muted/40 border-transparent h-14 rounded-xl font-bold">
                                        <SelectValue placeholder={selectedStationId ? "Pilih durasi paket..." : "Pilih unit terlebih dahulu"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {availableRules.map(rule => (
                                            <SelectItem key={rule.id} value={rule.id} className="py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black uppercase tracking-tight text-xs">{rule.name}</span>
                                                        <Badge variant="outline" className="text-[8px] font-black h-4 px-1">{formatDuration(rule.duration)}</Badge>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-primary">{formatCurrency(rule.price)}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                        {selectedStationId && availableRules.length === 0 && (
                                            <div className="p-4 text-center text-[10px] uppercase font-bold text-muted-foreground">Tidak ada paket tersedia</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.pricingRuleId && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.pricingRuleId.message}</p>}
                    </div>

                    {/* DP (Opsional) */}
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest">
                                <Banknote className="size-3" /> Uang Muka / DP (IDR)
                            </Label>
                            <Badge variant="outline" className="text-[8px] font-black bg-white/50 border-primary/20">OPSIONAL</Badge>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs">Rp</span>
                            <Input type="number" {...register('dpAmount')} className="bg-background border-primary/20 h-12 pl-10 text-xl font-black font-mono shadow-inner rounded-xl" placeholder="0" />
                        </div>
                        <p className="text-[9px] text-muted-foreground/60 italic leading-relaxed text-center px-4">
                            DP akan otomatis memotong total tagihan saat kamu check-in di kasir.
                        </p>
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all active:scale-95 gap-3">
                        {isSubmitting ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircle2 className="size-5" />
                        )}
                        {isSubmitting ? 'MEMPROSES...' : 'KONFIRMASI BOOKING'}
                    </Button>
                </div>
            </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
