'use client';

import type { Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface ReportsTableProps {
    transactions: Transaction[];
    onRowClick?: (transaction: Transaction) => void;
}

export function ReportsTable({ transactions, onRowClick }: ReportsTableProps) {
  return (
    <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Station</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Durasi (Menit)</TableHead>
              <TableHead className="text-right">Pendapatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <TableRow 
                    key={t.id} 
                    onClick={() => onRowClick?.(t)}
                    className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                >
                  <TableCell className="font-medium">{t.stationName}</TableCell>
                  <TableCell>{format(new Date(t.timestamp), 'dd MMM yyyy, HH:mm', { locale: id })}</TableCell>
                  <TableCell>
                      <Badge variant={t.status === 'paid' ? 'default' : 'destructive'} className={cn('text-xs', t.status === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30')}>{t.status === 'paid' ? 'Lunas' : 'Belum Lunas'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{t.durationMinutes}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(t.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Tidak ada transaksi pada rentang tanggal ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
  );
}
