'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import type { Station } from '@/lib/types';
import { ArrowRightLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MoveStationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableStations: Station[];
  sourceStationName: string;
  onConfirm: (targetStationId: string) => void;
}

export function MoveStationDialog({
  isOpen,
  onOpenChange,
  availableStations,
  sourceStationName,
  onConfirm,
}: MoveStationDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Pindahkan Sesi
          </DialogTitle>
          <DialogDescription>
            Pindahkan durasi bermain aktif dari <b>{sourceStationName}</b> ke unit lain yang kosong.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 ml-1">Pilih Unit Tujuan</p>
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-1 gap-2">
              {availableStations.length > 0 ? (
                availableStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => setSelectedId(station.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                      selectedId === station.id 
                        ? "border-primary bg-primary/5" 
                        : "border-transparent bg-muted/30 hover:border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0">
                        <Image src={`/${station.type.toLowerCase()}-logo.png`} alt={station.type} fill className="object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-sm uppercase leading-tight">{station.name}</p>
                        <p className="text-[10px] text-muted-foreground font-black mt-0.5">SISTEM {station.type}</p>
                      </div>
                    </div>
                    {selectedId === station.id ? (
                        <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                    )}
                  </button>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-3xl opacity-50">
                    <p className="text-xs font-bold uppercase tracking-widest">Tidak ada unit kosong</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2 border-t pt-4">
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button 
            disabled={!selectedId} 
            onClick={() => selectedId && onConfirm(selectedId)}
            className="font-black uppercase tracking-widest flex-1"
          >
            Konfirmasi Pindah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}