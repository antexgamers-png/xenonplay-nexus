
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Users, Trophy, ExternalLink, UserPlus, ListChecks } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MemberTable } from './member-table';
import { MemberFormDialog } from './member-form-dialog';
import { RequestTable } from './request-table';
import type { Member, MemberRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Link from 'next/link';

export function MemberClient({ initialData }: { initialData: Member[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  
  const firestore = useFirestore();
  const requestsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'memberRequests') : null, [firestore]);
  const { data: requests } = useCollection<MemberRequest>(requestsQuery);

  const filteredMembers = useMemo(() => {
    return initialData.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
    );
  }, [initialData, searchQuery]);

  const stats = useMemo(() => {
    const totalMembers = initialData.length;
    const totalPoints = initialData.reduce((sum, m) => sum + (m.points || 0), 0);
    const pendingRequests = requests?.length || 0;
    return { totalMembers, totalPoints, pendingRequests };
  }, [initialData, requests]);

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
        <Card className={cn("transition-colors", stats.pendingRequests > 0 ? "bg-amber-500/10 border-amber-500/30 animate-pulse" : "bg-muted/5 border-border/20")}>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className={cn("text-xs font-black uppercase tracking-widest", stats.pendingRequests > 0 ? "text-amber-600" : "text-muted-foreground")}>Antrean Baru</CardTitle>
                <UserPlus className={cn("h-4 w-4", stats.pendingRequests > 0 ? "text-amber-600" : "text-muted-foreground")} />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className={cn("text-2xl font-black", stats.pendingRequests > 0 ? "text-amber-600" : "")}>{stats.pendingRequests}</div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase">Menunggu konfirmasi</p>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-6">
            <TabsList className="bg-muted/50 border p-1 rounded-xl h-11">
                <TabsTrigger value="list" className="px-6 rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2">
                    <ListChecks className="size-3.5" /> Daftar Member
                </TabsTrigger>
                <TabsTrigger value="requests" className="px-6 rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 relative">
                    <UserPlus className="size-3.5" /> Pendaftar Baru
                    {stats.pendingRequests > 0 && (
                        <span className="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                            {stats.pendingRequests}
                        </span>
                    )}
                </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari..." 
                        className="pl-10 h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Link href="/check-member" target="_blank">
                    <Button variant="outline" className="w-full sm:w-auto h-10 font-bold gap-2">
                        <ExternalLink className="h-4 w-4" /> Portal
                    </Button>
                </Link>
                <Button onClick={handleAdd} className="w-full sm:w-auto h-10 font-bold gap-2">
                    <Plus className="h-4 w-4" /> Tambah Manual
                </Button>
            </div>
        </div>

        <TabsContent value="list" className="mt-0 outline-none">
            <MemberTable data={filteredMembers} onEdit={handleEdit} />
        </TabsContent>

        <TabsContent value="requests" className="mt-0 outline-none">
            <RequestTable requests={requests || []} />
        </TabsContent>
      </Tabs>

      <MemberFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        member={editingMember}
      />
    </div>
  );
}
