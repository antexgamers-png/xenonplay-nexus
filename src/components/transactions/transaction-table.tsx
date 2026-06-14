
'use client';

import type { Transaction } from '@/lib/types';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn, formatDuration } from '@/lib/utils';
import { ArrowUpRight, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, ShoppingCart, Gamepad2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionTableProps {
    transactions: Transaction[];
    onRowClick: (transaction: Transaction) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
};

export function TransactionTable({ transactions, onRowClick }: TransactionTableProps) {
  const table = useReactTable({
    data: transactions,
    columns: [
      {
        accessorKey: 'timestamp',
        header: 'Tgl. & Waktu',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">{format(row.original.timestamp, 'dd MMM yyyy', { locale: id })}</span>
            <span className="text-[9px] text-muted-foreground font-mono">{format(row.original.timestamp, 'HH:mm')} WIB</span>
          </div>
        )
      },
      {
        accessorKey: 'stationName',
        header: 'Transaksi',
        cell: ({ row }) => {
            const isPos = row.original.stationId === 'pos';
            return (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-1.5 rounded-md shrink-0",
                        isPos ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                    )}>
                        {isPos ? <ShoppingCart className="h-3 w-3" /> : <Gamepad2 className="h-3 w-3" />}
                    </div>
                    <span className="font-bold text-[10px] sm:text-xs uppercase truncate max-w-[100px]">{row.original.stationName}</span>
                </div>
            )
        }
      },
      {
        id: 'items',
        header: 'Nama Item',
        cell: ({ row }) => {
            const items = (row.original.additionalCharges || [])
                .map(c => {
                    let desc = c.description || '';
                    // Clean prefixes for visual table
                    desc = desc.replace(/^Sewa\s+/i, '');
                    desc = desc.replace(/^FnB:\s+/i, '');
                    desc = desc.replace(/^Tambah\s+FnB:\s+/i, '');
                    desc = desc.replace(/^Tambah\s+waktu\s+/i, '');
                    desc = desc.replace(/^Biaya\s+Tambahan\s+/i, '');
                    desc = desc.replace(/^Klaim\s+Voucher:\s+/i, '');
                    return desc.trim();
                })
                .filter((val, index, self) => val && self.indexOf(val) === index);
            
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] sm:text-xs font-bold uppercase truncate max-w-[180px]" title={items.join(', ')}>
                        {items.join(', ') || '-'}
                    </span>
                    {row.original.claimCode && (
                        <span className="text-[8px] font-black text-amber-600 flex items-center gap-1 uppercase">
                            <Ticket className="size-2" /> {row.original.claimCode}
                        </span>
                    )}
                </div>
            );
        }
      },
      {
        accessorKey: 'durationMinutes',
        header: 'Qty/Durasi',
        cell: ({ row }) => {
            const isPos = row.original.stationId === 'pos';
            if (isPos) {
                const totalQty = (row.original.fnbItems || []).reduce((sum, item) => sum + item.quantity, 0);
                return <div className="font-mono text-[10px] sm:text-xs">{totalQty > 0 ? `${totalQty} Pcs` : '-'}</div>;
            }
            return (
                <div className="font-bold text-[10px] sm:text-xs whitespace-nowrap">
                    {formatDuration(row.original.durationMinutes)}
                </div>
            )
        }
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
          const isPaid = row.original.status === 'paid';
          const totalNetto = Math.max(0, (row.original.amount || 0) - (row.original.discount || 0));
          return (
            <div className="flex flex-col items-end">
              <span className={cn("font-bold font-mono text-xs sm:text-sm whitespace-nowrap", !isPaid && "text-amber-600")}>
                {formatCurrency(totalNetto)}
              </span>
              {row.original.discount > 0 && (
                <span className="text-[8px] text-amber-500 font-bold uppercase">Disc: -{formatCurrency(row.original.discount)}</span>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
          const isPaid = row.original.status === 'paid';
          return (
            <div className="flex justify-center">
                <Badge 
                variant={isPaid ? 'default' : 'destructive'} 
                className={cn(
                    'text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 font-black gap-1 border-none',
                    isPaid 
                    ? 'bg-emerald-500/10 text-emerald-600' 
                    : 'bg-amber-500/10 text-amber-600'
                )}
                >
                {isPaid ? <CheckCircle2 className="size-2.5 sm:size-3" /> : <AlertCircle className="size-2.5 sm:size-3" />}
                <span>{isPaid ? 'LUNAS' : 'DUE'}</span>
                </Badge>
            </div>
          );
        }
      }
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn(
                      "text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-4",
                      header.column.id === 'amount' ? "text-right" : "",
                      header.column.id === 'status' ? "text-center" : ""
                  )}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  onClick={() => onRowClick(row.original)}
                  className="cursor-pointer group hover:bg-muted/20 transition-colors border-border h-16"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell className="py-2 pr-4">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic text-xs">
                  Tidak ada transaksi yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tampilkan</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex w-[100px] items-center justify-center text-[10px] font-black uppercase text-muted-foreground">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
