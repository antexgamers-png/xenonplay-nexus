
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
import { cn } from '@/lib/utils';
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
        accessorKey: 'stationName',
        header: 'Sumber Transaksi',
        cell: ({ row }) => {
            const isPos = row.original.stationId === 'pos';
            const claimCode = row.original.claimCode;
            return (
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-1.5 rounded-md shrink-0",
                        isPos ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                    )}>
                        {isPos ? <ShoppingCart className="h-3.5 w-3.5" /> : <Gamepad2 className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold truncate text-xs sm:text-sm">{row.original.stationName}</span>
                        {claimCode && (
                            <span className="text-[8px] sm:text-[9px] font-black text-amber-500 flex items-center gap-1 uppercase tracking-tight">
                                <Ticket className="size-2 sm:size-2.5" /> Voucher: {claimCode}
                            </span>
                        )}
                    </div>
                </div>
            )
        }
      },
      {
        accessorKey: 'timestamp',
        header: 'Waktu & Tanggal',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-sm whitespace-nowrap">{format(row.original.timestamp, 'dd MMM yyyy', { locale: id })}</span>
            <span className="text-[9px] sm:text-xs text-muted-foreground font-mono">{format(row.original.timestamp, 'HH:mm', { locale: id })} WIB</span>
          </div>
        )
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
                    'text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 font-bold gap-1',
                    isPaid 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                )}
                >
                {isPaid ? <CheckCircle2 className="size-2.5 sm:size-3" /> : <AlertCircle className="size-2.5 sm:size-3" />}
                <span className="hidden sm:inline">{isPaid ? 'LUNAS' : 'BELUM BAYAR'}</span>
                <span className="sm:hidden">{isPaid ? 'PAID' : 'DUE'}</span>
                </Badge>
            </div>
          );
        }
      },
      {
        accessorKey: 'durationMinutes',
        header: () => <div className="text-right hidden md:table-cell">Durasi</div>,
        cell: ({ row }) => {
            const isPos = row.original.stationId === 'pos';
            return (
                <div className="text-right font-mono text-muted-foreground hidden md:table-cell">
                    {isPos ? '-' : `${row.original.durationMinutes}m`}
                </div>
            )
        }
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
          const isPaid = row.original.status === 'paid';
          return (
            <div className="flex flex-col items-end shrink-0">
              <span className={cn("font-bold font-mono text-xs sm:text-sm whitespace-nowrap", !isPaid && "text-amber-600")}>{formatCurrency(row.original.amount)}</span>
              {row.original.paidAmount > 0 && row.original.paidAmount < row.original.amount && (
                <span className="text-[8px] sm:text-[10px] text-muted-foreground whitespace-nowrap">Dibayar: {formatCurrency(row.original.paidAmount)}</span>
              )}
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
                      "text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                      header.column.id === 'amount' || header.column.id === 'durationMinutes' ? "text-right" : ""
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
                  className="cursor-pointer group hover:bg-muted/20 transition-colors border-border h-14"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
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
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic text-xs">
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
