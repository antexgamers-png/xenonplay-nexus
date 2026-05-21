'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FnbTable } from './fnb-table';
import type { FnbItem } from '@/lib/types';
import { useState } from 'react';
import { FnbFormDialog } from './fnb-form-dialog';

export function FnbClient({ initialData }: { initialData: FnbItem[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FnbItem | undefined>(undefined);

  const handleEdit = (item: FnbItem) => {
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
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Baru
        </Button>
      </div>
      
      <FnbTable data={initialData} onEdit={handleEdit} />
      
      <FnbFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        item={editingItem} 
      />
    </div>
  );
}
