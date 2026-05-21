
'use client';

import { useMemo } from 'react';
import { MemberClient } from '@/components/members/member-client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Member } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/auth-provider';

export default function MembersPage() {
  const firestore = useFirestore();
  const { isRoleLoading } = useAuth();

  const membersQuery = useMemoFirebase(() => 
    !firestore || isRoleLoading ? null : collection(firestore, 'members'), 
    [firestore, isRoleLoading]
  );

  const { data: members, isLoading } = useCollection<Member>(membersQuery);

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Membership</h1>
        <p className="text-muted-foreground mt-1">Kelola data pelanggan setia dan program loyalitas poin.</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[150px]" />
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <MemberClient initialData={members || []} />
      )}
    </div>
  );
}
