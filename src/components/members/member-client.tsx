'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Users, Trophy, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MemberTable } from './member-table';
import { MemberFormDialog } from './member-form-dialog';
import type { Member } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function MemberClient({ initialData }: { initialData: Member[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);

  const filteredMembers = useMemo(() => {
    return initialData.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
    );
  }, [initialData, searchQuery]);

  const stats = useMemo(() => {
    const totalMembers = initialData.length;
    const totalPoints = initialData.reduce((sum, m) => sum + (m.points || 0), 0);
    const topMember = [...initialData].sort((a, b) => b.points - a.points)[0];
    return { totalMembers, totalPoints, topMember };
  }, [initialData]);

  const handleAdd = () => {
    setEditingMember(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-black uppercase text-primary tracking-widest">Total Member</CardTitle>
                <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-black">{stats.totalMembers}</div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase">Pelanggan terdaftar</p>
            </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-black uppercase text-emerald-500 tracking-widest">Akumulasi Poin</CardTitle>
                <Trophy className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-black">{stats.totalPoints}</div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase">Total poin beredar</p>
            </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-black uppercase text-amber-500 tracking-widest">Top Collector</CardTitle>
                <Trophy className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-black truncate">{stats.topMember?.name || '-'}</div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase">{stats.topMember?.points || 0} Poin</p>
            </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama atau nomor HP..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/check-member" target="_blank" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full font-bold gap-2">
              <ExternalLink className="h-4 w-4" /> Buka Portal Publik
            </Button>
          </Link>
          <Button onClick={handleAdd} className="flex-1 sm:flex-initial font-bold gap-2">
            <Plus className="h-4 w-4" /> Daftar Member Baru
          </Button>
        </div>
      </div>

      <MemberTable data={filteredMembers} onEdit={handleEdit} />

      <MemberFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        member={editingMember}
      />
    </div>
  );
}
