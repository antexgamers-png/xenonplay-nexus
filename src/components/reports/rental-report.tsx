'use client';

import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Timer, Wallet, Gamepad2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function RentalReport({ transactions }: { transactions: Transaction[] }) {
  const stats = useMemo(() => {
    let totalRentalRev = 0;
    let totalMinutes = 0;
    const stationCounts: Record<string, number> = {};

    transactions.forEach(t => {
      // HANYA hitung charge yang bukan FnB
      const rentalAmount = (t.additionalCharges || [])
        .filter(c => !c.description.includes('FnB:'))
        .reduce((sum, c) => sum + (c.amount || 0), 0);
      
      totalRentalRev += rentalAmount;
      totalMinutes += (t.durationMinutes || 0);
      
      if (t.stationId !== 'pos') {
        stationCounts[t.stationName] = (stationCounts[t.stationName] || 0) + 1;
      }
    });

    const mostPlayed = Object.entries(stationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    const rentalOnlyTransactions = transactions.filter(t => t.stationId !== 'pos');
    const avgDuration = rentalOnlyTransactions.length > 0 ? Math.round(totalMinutes / rentalOnlyTransactions.length) : 0;
    const totalHours = (totalMinutes / 60).toFixed(1).replace('.0', '');

    return { totalRentalRev, avgDuration, mostPlayed, totalHours };
  }, [transactions]);

  const table = useReactTable({
    data: transactions.filter(t => t.stationId !== 'pos'), // Sembunyikan transaksi POS murni di laporan rental
    columns: [
      {
        accessorKey: 'stationName',
        header: 'Station',
        cell: ({ row }) => <span className="font-medium">{row.original.stationName}</span>
      },
      {
        accessorKey: 'timestamp',
        header: 'Waktu',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {format(row.original.timestamp, 'dd MMM, HH:mm', { locale: id })}
          </span>
        )
      },
      {
        accessorKey: 'durationMinutes',
        header: 'Durasi',
        cell: ({ row }) => <div className="text-right">{row.original.durationMinutes}m</div>
      },
      {
        id: 'rentalFee',
        header: 'Biaya Sewa',
        cell: ({ row }) => {
          const rentalAmount = (row.original.additionalCharges || [])
            .filter(c => !row.original.stationId.includes('pos') && !c.description.includes('FnB:'))
            .reduce((sum, c) => sum + (c.amount || 0), 0);
          return <div className="text-right font-mono text-primary font-bold">{formatCurrency(rentalAmount)}</div>;
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'paid' ? 'default' : 'destructive'} className="text-[10px]">
            {row.original.status === 'paid' ? 'LUNAS' : 'BELUM'}
          </Badge>
        )
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
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Omzet Rental</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{formatCurrency(stats.totalRentalRev)}</div>
            <p className="text-xs text-muted-foreground">Murni biaya sewa TV</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jam Main</CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours} Jam</div>
            <p className="text-xs text-muted-foreground">Akumulasi durasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Durasi</CardTitle>
            <Timer className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration} Menit</div>
            <p className="text-xs text-muted-foreground">Per sesi bermain</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stasiun Terlaris</CardTitle>
            <Gamepad2 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{stats.mostPlayed}</div>
            <p className="text-xs text-muted-foreground">Paling sering digunakan</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Sesi Rental</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className={cn(header.column.id === 'durationMinutes' || header.column.id === 'rentalFee' ? "text-right" : "")}>
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
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Tidak ada data sesi rental.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Baris per halaman</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
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
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
