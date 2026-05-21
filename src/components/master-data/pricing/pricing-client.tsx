
'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PricingTable } from './pricing-table';
import type { PricingRule, FnbItem } from '@/lib/types';
import { useState } from 'react';
import { PricingFormDialog } from './pricing-form-dialog';

interface PricingClientProps {
    initialData: PricingRule[];
    fnbItems: FnbItem[];
}

export function PricingClient({ initialData, fnbItems }: PricingClientProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<PricingRule | undefined>(undefined);

    const handleEdit = (rule: PricingRule) => {
        setEditingRule(rule);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingRule(undefined);
        setIsFormOpen(true);
    };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Paket / Bundling
        </Button>
      </div>
      
      <PricingTable data={initialData} onEdit={handleEdit} />
      
      <PricingFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        rule={editingRule} 
        fnbItems={fnbItems}
      />
    </div>
  );
}
