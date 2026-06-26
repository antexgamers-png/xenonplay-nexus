'use client';

import { Plus, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WifiTable } from './wifi-table';
import type { PricingRule } from '@/lib/types';
import { useState } from 'react';
import { PricingFormDialog } from '../pricing/pricing-form-dialog';

export function WifiClient({ initialData }: { initialData: PricingRule[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingRule | undefined>(undefined);

  const handleEdit = (item: PricingRule) => {
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
      
      <PricingFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        rule={editingItem} 
        fnbItems={[]}
      />
    </div>
  );
}