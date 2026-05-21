'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { addMember, updateMember } from '@/lib/data';
import type { Member } from '@/lib/types';
import { Users } from 'lucide-react';

const memberSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().min(10, 'Nomor HP tidak valid'),
  email: z.string().email().optional().or(z.string().length(0)),
});

type MemberFormData = z.infer<typeof memberSchema>;

export function MemberFormDialog({ isOpen, onOpenChange, member }: { isOpen: boolean, onOpenChange: (open: boolean) => void, member?: Member }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: '', phone: '', email: '' }
  });

  useEffect(() => {
    if (isOpen) {
      if (member) reset({ name: member.name, phone: member.phone, email: member.email || '' });
      else reset({ name: '', phone: '', email: '' });
    }
  }, [member, reset, isOpen]);

  const onSubmit = async (data: MemberFormData) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (member) {
        await updateMember(firestore, member.id, data);
        toast({ title: 'Berhasil', description: 'Data member diperbarui.', variant: 'success' });
      } else {
        await addMember(firestore, data);
        toast({ title: 'Berhasil', description: 'Member baru terdaftar.', variant: 'success' });
      }
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Gagal', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {member ? 'Edit Member' : 'Daftar Member'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input {...register('name')} placeholder="Contoh: Budi Santoso" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Nomor WhatsApp</Label>
            <Input {...register('phone')} placeholder="0812..." />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email (Opsional)</Label>
            <Input {...register('email')} type="email" placeholder="member@example.com" />
          </div>
          <DialogFooter className="pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Simpan Data'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
