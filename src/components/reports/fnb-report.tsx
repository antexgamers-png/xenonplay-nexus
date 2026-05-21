'use client';

import type { Transaction, FnbItem } from '@/lib/types';
import { useMemo, useState } from 'react';
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
import { ShoppingBag, TrendingUp, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

export function FnBReport({ transactions, fnbItems }: { transactions: Transaction[], fnbItems: FnbItem[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    let totalOmzet = 0;
    let totalLaba = 0;
    const itemSales: Record<string, { name: string, qty: number, omzet: number, laba: number, currentStock: number }> = {};

    transactions.forEach(t => {
      (t.fnbItems || []).forEach(item => {
        const masterItem = fnbItems.find(f => f.id === item.id);
        const purchasePrice = masterItem?.purchasePrice || 0;
        const itemLaba = (item.price - purchasePrice) * item.quantity;
        const itemOmzet = item.price * item.quantity;

        totalOmzet += itemOmzet;
        totalLaba += itemLaba;

        if (!itemSales[item.id]) {
          itemSales[item.id] = { 
            name: item.name, 
            qty: 0, 
            omzet: 0, 
            laba: 0,
            currentStock: masterItem?.stock ?? 0
          };
        }
        itemSales[item.id].qty += item.quantity;
        itemSales[item.id].omzet += itemOmzet;
        itemSales[item.id].laba += itemLaba;
      });
    });

    const bestSeller = Object.entries(itemSales).sort((a, b) => b[1].qty - a[1].qty)[0]?.[1]?.name || '-';
    const lowStockItems = fnbItems.filter(i => i.stock < 5);

    return { totalOmzet, totalLaba, bestSeller, itemSales, lowStockItems };
  }, [transactions, fnbItems]);

  const tableData = useMemo(() => {
    return Object.entries(stats.itemSales)
      .filter(([, data]) => data.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(([id, data]) => ({ 
        id, 
        ...data,
        initialStock: data.currentStock + data.qty
      }))
      .sort((a, b) => b.qty - a.qty);
  }, [stats.itemSales, searchQuery]);

  const table = useReactTable({
    data: tableData,
    columns: [
      {
        accessorKey: 'name',
        header: 'Nama Barang',
        cell: ({ row }) => <span className="font-bold">{row.original.name}</span>
      },
      {
        accessorKey: 'initialStock',
        header: () => <div className="text-center">Stok Awal</div>,
        cell: ({ row }) => <div className="text-center font-mono text-muted-foreground">{row.original.initialStock}</div>
      },
      {
        accessorKey: 'qty',
        header: () => <div className="text-center">Terjual</div>,
        cell: ({ row }) => (
            <div className="text-center">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">
                    {row.original.qty}
                </Badge>
            </div>
        )
      },
      {
        accessorKey: 'currentStock',
        header: () => <div className="text-center">Stok Akhir</div>,
        cell: ({ row }) => (
            <div className="text-center font-mono font-bold text-emerald-600">
                {row.original.currentStock}
            </div>
        )
      },
      {
        accessorKey: 'omzet',
        header: () => <div className="text-right">Omzet</div>,
        cell: ({ row }) => <div className="text-right font-mono text-xs">{formatCurrency(row.original.omzet)}</div>
      },
      {
        accessorKey: 'laba',
        header: () => <div className="text-right">Laba</div>,
        cell: ({ row }) => <div className="text-right font-mono text-emerald-600 font-bold">{formatCurrency(row.original.laba)}</div>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Omzet FnB</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{formatCurrency(stats.totalOmzet)}</div>
            <p className="text-[10px] text-muted-foreground uppercase mt-1">Total penjualan kotor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Laba Bersih</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalLaba)}</div>
            <p className="text-[10px] text-muted-foreground uppercase mt-1">Estimasi profit bersih</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Best Seller</CardTitle>
            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">{stats.bestSeller}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black truncate">{stats.bestSeller}</div>
            <p className="text-[10px] text-muted-foreground uppercase mt-1">Volume tertinggi</p>
          </CardContent>
        </Card>
      </div>

      {stats.lowStockItems.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight text-amber-600">Peringatan Inventaris</h4>
            <p className="text-xs text-muted-foreground">Item berikut butuh restock: {stats.lowStockItems.map(i => `${i.name} (${i.stock})`).join(', ')}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Inventaris & Penjualan</CardTitle>
            <p className="text-xs text-muted-foreground">Audit stok awal vs stok akhir berdasarkan transaksi.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              className="pl-9 h-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                      {searchQuery ? 'Produk tidak ditemukan.' : 'Belum ada data penjualan.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-2 pt-2">
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