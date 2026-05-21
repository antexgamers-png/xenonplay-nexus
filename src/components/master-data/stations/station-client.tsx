'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StationTable } from './station-table';
import type { Station } from '@/lib/types';
import { useState } from 'react';
import { StationFormDialog } from './station-form-dialog';

export function StationClient({ initialData }: { initialData: Station[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | undefined>(undefined);

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingStation(undefined);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Baru
        </Button>
      </div>
      
      <StationTable data={initialData} onEdit={handleEdit} />
      
      {/* Gunakan satu dialog yang tetap mounted untuk menghindari race condition pointer-events */}
      <StationFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        station={editingStation}
      />
    </div>
  );
}
