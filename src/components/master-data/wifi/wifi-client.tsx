'use client';

import { Plus, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WifiTable } from './wifi-table';
import type { WifiPackage } from '@/lib/types';
import { useState } from 'react';
import { WifiFormDialog } from './wifi-form-dialog';

export function WifiClient({ initialData }: { initialData: WifiPackage[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WifiPackage | undefined>(undefined);

  const handleEdit = (item: WifiPackage) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd} className="font-bold gap-2">
          <Plus className="size-4" /> Tambah Paket Wi-Fi
        </Button>
      </div>
      
      <WifiTable data={initialData} onEdit={handleEdit} />
      
      <WifiFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        item={editingItem} 
      />
    </div>
  );
}