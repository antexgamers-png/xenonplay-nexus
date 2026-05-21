'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Reward } from '@/lib/types';
import { Plus, Trash2, Pencil, Gift, Clock, Coffee, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addReward, updateReward, deleteReward } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const rewardIcons = {
    time: Clock,
    item: Coffee,
    other: Sparkles
};

export default function RewardSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const rewardsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'rewards') : null, [firestore]);
  const { data: rewards, isLoading } = useCollection<Reward>(rewardsQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Reward, 'id'>>({
    label: '',
    points: 50,
    type: 'time'
  });

  const handleOpenAdd = () => {
    setEditingReward(null);
    setFormData({ label: '', points: 50, type: 'time' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({ label: reward.label, points: reward.points, type: reward.type });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!firestore || !formData.label) return;
    setIsSubmitting(true);
    try {
      if (editingReward) {
        await updateReward(firestore, editingReward.id, formData);
        toast({ title: 'Berhasil', description: 'Hadiah diperbarui.', variant: 'success' });
      } else {
        await addReward(firestore, formData);
        toast({ title: 'Berhasil', description: 'Hadiah baru ditambahkan.', variant: 'success' });
      }
      setIsDialogOpen(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteReward(firestore, id);
      toast({ title: 'Dihapus', description: 'Hadiah telah dihapus.', variant: 'success' });
    } catch (e: any) {
      toast({ title: 'Gagal', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Katalog Hadiah Member</h1>
          <p className="text-muted-foreground mt-1">
            Atur daftar hadiah yang bisa ditukarkan oleh pelanggan menggunakan poin mereka.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="font-bold">
          <Plus className="mr-2 h-4 w-4" /> Tambah Hadiah
        </Button>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rewards?.map((reward) => {
            const Icon = rewardIcons[reward.type] || Sparkles;
            return (
              <Card key={reward.id} className="group border-border hover:border-primary/50 transition-colors bg-card shadow-sm">
                <CardHeader className="p-5 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenEdit(reward)}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(reward.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <h3 className="font-black text-lg uppercase tracking-tight leading-tight text-foreground">{reward.label}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-mono font-bold">
                        {reward.points} Pts
                    </Badge>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{reward.type === 'time' ? 'Bonus Waktu' : 'Barang/Snack'}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {rewards?.length === 0 && (
            <div className="col-span-full py-20 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <Gift className="h-12 w-12 mb-4" />
                <p className="font-bold uppercase tracking-widest">Belum ada hadiah terdaftar</p>
            </div>
          )}
        </div>
      )}

      {/* DIALOG FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingReward ? 'Ubah Hadiah' : 'Tambah Hadiah Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Hadiah</Label>
              <Input 
                placeholder="Contoh: Gratis 1 Jam PS5" 
                className="bg-muted border-border"
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Kebutuhan Poin</Label>
                    <Input 
                        type="number"
                        className="bg-muted border-border"
                        value={formData.points}
                        onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Jenis Hadiah</Label>
                    <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
                        <SelectTrigger className="bg-muted border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                            <SelectItem value="time">Bonus Waktu</SelectItem>
                            <SelectItem value="item">Barang / Snack</SelectItem>
                            <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSubmitting || !formData.label} className="font-bold">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Hadiah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
