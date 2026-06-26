'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getWifiColumns } from './wifi-columns';
import type { PricingRule } from '@/lib/types';
import { useMemo } from 'react';

export function WifiTable({ data, onEdit }: { data: PricingRule[], onEdit: (i: PricingRule) => void }) {
  const columns = useMemo(() => getWifiColumns(onEdit), [onEdit]);
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-[10px] font-black uppercase tracking-widest">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground italic">Belum ada paket Wi-Fi.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}