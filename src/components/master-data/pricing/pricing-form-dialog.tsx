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
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addPricingRule, updatePricingRule } from '@/lib/data';
import type { PricingRule, FnbItem } from '@/lib/types';
import { Plus, Trash2, ShoppingCart, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const pricingRuleSchema = z.object({
  name: z.string().min(1, 'Nama paket harus diisi'),
  duration: z.coerce.number().int().min(1, 'Durasi harus diisi'),
  type: z.enum(['PS3', 'PS4', 'PS5', 'All', 'Wifi']),
  price: z.coerce.number().min(0, 'Harga harus diisi'),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Pilih item'),
    name: z.string(),
    quantity: z.coerce.number().min(1, 'Min 1')
  })).optional(),
});

type PricingRuleFormData = z.infer<typeof pricingRuleSchema>;

interface PricingFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  rule?: PricingRule;
  fnbItems: FnbItem[];
}

export function PricingFormDialog({
  isOpen,
  onOpenChange,
  rule,
  fnbItems
}: PricingFormDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      name: '',
      duration: 60,
      type: 'All',
      price: 0,
      items: []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    if (isOpen) {
      if (rule) {
        reset({
            ...rule,
            items: rule.items || []
        });
      } else {
        reset({
          name: '',
          duration: 60,
          type: 'All',
          price: 0,
          items: []
        });
      }
    }
  }, [rule, reset, isOpen]);

  const onSubmit = async (data: PricingRuleFormData) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (rule) {
        await updatePricingRule(firestore, rule.id, data);
        toast({
          title: 'Sukses',
          description: 'Paket berhasil diperbarui.',
          variant: 'success',
        });
      } else {
        await addPricingRule(firestore, data);
        toast({
          title: 'Sukses',
          description: 'Paket baru berhasil ditambahkan.',
          variant: 'success',
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Gagal menyimpan paket.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = () => {
      append({ itemId: '', name: '', quantity: 1 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {rule ? 'Ubah Paket / Bundling' : 'Tambah Paket Baru'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tentukan harga durasi bermain dan item FnB yang termasuk di dalamnya.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nama Paket</Label>
                <Input id="name" {...register('name')} placeholder="Contoh: Paket Gaming Puas + Minum" className="bg-muted border-border" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="duration">Durasi (Menit)</Label>
                    <Input id="duration" type="number" {...register('duration')} className="bg-muted border-border" />
                    {errors.duration && <p className="text-xs text-destructive">{errors.duration.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Tipe Layanan</Label>
                    <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="type" className="bg-muted border-border">
                            <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                            <SelectItem value="All">Semua Konsol</SelectItem>
                            <SelectItem value="PS5">Khusus PS5</SelectItem>
                            <SelectItem value="PS4">Khusus PS4</SelectItem>
                            <SelectItem value="PS3">Khusus PS3</SelectItem>
                            <SelectItem value="Wifi" className="text-primary font-bold">KUPON WI-FI</SelectItem>
                        </SelectContent>
                        </Select>
                    )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">Harga Paket (Total IDR)</Label>
                <Input id="price" type="number" {...register('price')} className="bg-muted border-border text-primary font-bold" />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* SECTION BUNDLING */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-500">
                    <ShoppingCart className="h-4 w-4" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Item Bundling (Bonus)</h4>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                    <Plus className="h-3 w-3 mr-1" /> Tambah Item
                </Button>
            </div>

            <ScrollArea className={fields.length > 0 ? "h-[150px] pr-4" : "h-auto"}>
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 rounded-lg border border-border bg-muted/30">
                            <div className="flex-1 space-y-1.5">
                                <Label className="text-[10px] uppercase text-muted-foreground">Pilih Barang</Label>
                                <Controller
                                    name={`items.${index}.itemId`}
                                    control={control}
                                    render={({ field: subField }) => (
                                        <Select 
                                            onValueChange={(val) => {
                                                subField.onChange(val);
                                                const item = fnbItems.find(i => i.id === val);
                                                if (item) {
                                                    reset({
                                                        ...control._formValues,
                                                        items: control._formValues.items.map((it: any, i: number) => 
                                                            i === index ? { ...it, itemId: val, name: item.name } : it
                                                        )
                                                    });
                                                }
                                            }} 
                                            value={subField.value}
                                        >
                                            <SelectTrigger className="h-9 bg-background border-border text-xs">
                                                <SelectValue placeholder="Pilih..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background border-border">
                                                {fnbItems.map(item => (
                                                    <SelectItem key={item.id} value={item.id} className="text-xs">
                                                        {item.name} (Stok: {item.stock})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="w-20 space-y-1.5">
                                <Label className="text-[10px] uppercase text-muted-foreground">Jumlah</Label>
                                <Input 
                                    type="number" 
                                    {...register(`items.${index}.quantity`)} 
                                    className="h-9 bg-background border-border text-xs" 
                                />
                            </div>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => remove(index)} 
                                className="h-9 w-9 text-red-500 hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <p className="text-center text-xs text-muted-foreground italic py-4 border-2 border-dashed border-border rounded-lg">
                            Belum ada item bonus dalam paket ini.
                        </p>
                    )}
                </div>
            </ScrollArea>
          </div>
          
          <DialogFooter className="border-t border-border pt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="font-bold">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Paket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}