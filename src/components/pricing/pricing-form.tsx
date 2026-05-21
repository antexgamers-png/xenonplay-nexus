'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { useFirestore } from '@/firebase';
import { updatePricing } from '@/lib/data';
import { Loader2 } from 'lucide-react';

export function PricingForm({ currentPrice }: { currentPrice: number }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [price, setPrice] = useState(currentPrice.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({ title: 'Error', description: 'Harga harus valid', variant: 'destructive' });
      return;
    }

    setIsUpdating(true);
    try {
      // Menggunakan mutation client-side langsung ke Firestore
      await updatePricing(firestore, newPrice);
      toast({
        title: 'Sukses',
        description: 'Harga berhasil diperbarui.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui harga.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="price">Harga Baru (IDR per jam)</Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          className="max-w-xs"
          disabled={isUpdating}
        />
      </div>
      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Simpan Perubahan
      </Button>
    </form>
  );
}
