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
import type { Transaction, Member, GeneralSettings, Shift } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { ShoppingCart, Gamepad2, Ticket, CheckCircle2, AlertCircle, Search, UserCheck, X, Printer, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Input } from '../ui/input';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface TransactionDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onMarkAsPaid: (member?: Member | null) => void;
  onPayCharge?: (index: number) => void;
}

export function TransactionDetailDialog({
  isOpen,
  onOpenChange,
  transaction,
  onMarkAsPaid,
  onPayCharge,
}: TransactionDetailDialogProps) {
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const firestore = useFirestore();

  const membersQuery = useMemoFirebase(() => !firestore ? null : collection(firestore, 'members'), [firestore]);
  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'general') : null, [firestore]);
  const shiftsQuery = useMemoFirebase(() => !firestore ? null : collection(firestore, 'shifts'), [firestore]);
  
  const { data: members } = useCollection<Member>(membersQuery);
  const { data: settings } = useDoc<GeneralSettings>(settingsRef);
  const { data: shifts } = useCollection<Shift>(shiftsQuery);

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return [];
    return (members || []).filter(m => 
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
        m.phone.includes(memberSearch)
    ).slice(0, 3);
  }, [members, memberSearch]);

  if (!transaction) return null;

  const isPosOnly = transaction.stationId === 'pos';
  const bruto = transaction.amount || 0;
  const discount = transaction.discount || 0;
  const netto = Math.max(0, bruto - discount);
  const outstandingAmount = Math.max(0, netto - (transaction.paidAmount || 0));
  const isPaid = transaction.status === 'paid';

  const charges = transaction.additionalCharges ?? [];
  const rentalCharges = charges
    .map((c, i) => ({ ...c, index: i }))
    .filter(c => c && c.description && !c.description.startsWith('FnB:'));
    
  const fnbCharges = charges
    .map((c, i) => ({ ...c, index: i }))
    .filter(c => c && c.description && c.description.startsWith('FnB:'));

  const handleFinalPaid = () => {
      onMarkAsPaid(selectedMember);
      setSelectedMember(null);
      setMemberSearch('');
  };

  const handlePrint = () => {
    setIsPrinting(true);
    const storeName = settings?.storeName || 'XENONPLAY';
    const address = settings?.address || '';
    const dateStr = format(transaction.timestamp, 'dd/MM/yyyy HH:mm');
    const shift = shifts?.find(s => s.id === transaction.shiftId);
    const cashierName = shift?.openedByName || 'Operator';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build Items for Table
    const printItems: { name: string, qty: string, price: string, total: string }[] = [];
    
    // 1. Rental/Package
    rentalCharges.forEach(rc => {
        let name = rc.description.replace(/^Sewa\s+/i, '');
        let qty = "1";
        if (name.includes("Stik Extra")) {
            qty = name.split(" ")[0];
            name = "Extra Stick";
        }
        printItems.push({
            name: name.substring(0, 12),
            qty,
            price: (rc.amount / (parseInt(qty) || 1)).toLocaleString('id-ID'),
            total: rc.amount.toLocaleString('id-ID')
        });
    });

    // 2. FnB Items
    (transaction.fnbItems || []).forEach(f => {
        printItems.push({
            name: f.name.substring(0, 12),
            qty: f.quantity.toString(),
            price: f.price.toLocaleString('id-ID'),
            total: (f.price * f.quantity).toLocaleString('id-ID')
        });
    });

    const html = `
      <html>
        <head>
          <title>Print Nota</title>
          <style>
            @page { margin: 0; size: 58mm auto; }
            body { 
              width: 58mm; margin: 0; padding: 2px; 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 8.5px; line-height: 1.1; color: #000;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .sep { border-top: 1px dashed #000; margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin: 4px 0; }
            .item-row td { padding: 1px 0; vertical-align: top; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center bold" style="font-size: 11px;">${storeName.toUpperCase()}</div>
          <div class="center">${address}</div>
          <div class="sep"></div>
          <div>Nota : ${transaction.id.substring(0, 8).toUpperCase()}</div>
          <div>Tgl. Transaksi : ${dateStr}</div>
          <div>Kasir : ${cashierName.toUpperCase()}</div>
          <div class="sep"></div>
          <table>
            <tr class="bold">
              <td width="40%">Item</td>
              <td width="10%" class="center">Qty</td>
              <td width="25%" class="right">Harga</td>
              <td width="25%" class="right">Total</td>
            </tr>
            ${printItems.map(item => `
              <tr class="item-row">
                <td>${item.name.toUpperCase()}</td>
                <td class="center">${item.qty}</td>
                <td class="right">${item.price}</td>
                <td class="right">${item.total}</td>
              </tr>
            `).join('')}
          </table>
          <div class="sep"></div>
          <table>
            <tr><td>Sub Total :</td><td class="right">${bruto.toLocaleString('id-ID')}</td></tr>
            <tr><td>Diskon :</td><td class="right">-${discount.toLocaleString('id-ID')}</td></tr>
            <tr class="bold"><td>Grand Total:</td><td class="right">${netto.toLocaleString('id-ID')}</td></tr>
            <tr><td>Bayar :</td><td class="right">${(transaction.paidAmount || netto).toLocaleString('id-ID')}</td></tr>
            <tr><td>Kembali :</td><td class="right">0</td></tr>
          </table>
          <div class="sep"></div>
          <div class="center">Terimakasih Telah Bermain</div>
          <div class="center italic">"Good Game, Well Played"</div>
          <div style="height: 15px;"></div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setIsPrinting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { onOpenChange(val); if(!val) { setSelectedMember(null); setMemberSearch(''); } }}>
      <DialogContent className="max-w-md bg-background border-border max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className='flex items-start justify-between'>
            <div className="flex gap-3">
                <div className={cn("p-2 rounded-lg", isPosOnly ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                    {isPosOnly ? <ShoppingCart className="h-5 w-5" /> : <Gamepad2 className="h-5 w-5" />}
                </div>
                <div>
                    <DialogTitle className="text-lg font-bold uppercase">{isPosOnly ? 'Nota Kasir Kantin' : `Nota ${transaction.stationName ?? 'Stasiun'}`}</DialogTitle>
                    <DialogDescription className="text-[10px] font-mono uppercase tracking-widest">{transaction.id}</DialogDescription>
                </div>
            </div>
             <Badge className={cn('text-[10px] font-bold gap-1', isPaid ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600')}>
                {isPaid ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
                {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <div className="space-y-6 py-4">
            {/* MEMBER BINDING SECTION (FOR UNPAID GUEST) */}
            {!isPaid && !isPosOnly && (
                <div className="space-y-3">
                    <h4 className='text-[10px] font-black uppercase text-muted-foreground tracking-widest'>Siapa yang bayar? (Stempel Loyalitas)</h4>
                    {transaction.memberId ? (
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-4 text-primary" />
                                <span className="text-xs font-bold uppercase">{transaction.memberName}</span>
                            </div>
                            <Badge variant="outline" className="text-[8px] font-black text-primary border-primary/20">MEMBER TERDAFTAR</Badge>
                        </div>
                    ) : selectedMember ? (
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/30 flex justify-between items-center animate-in zoom-in-95">
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-4 text-emerald-600" />
                                <span className="text-xs font-bold uppercase">{selectedMember.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setSelectedMember(null)}>
                                <X className="size-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari member yang akan bayar..." 
                                    className="pl-8 h-9 text-xs bg-muted/30"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                />
                            </div>
                            {filteredMembers.length > 0 && (
                                <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
                                    {filteredMembers.map(m => (
                                        <button 
                                            key={m.id} 
                                            onClick={() => { setSelectedMember(m); setMemberSearch(''); }}
                                            className="w-full p-2.5 text-left text-xs hover:bg-primary/5 border-b last:border-0 flex justify-between items-center"
                                        >
                                            <span className="font-bold uppercase">{m.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono">{m.phone}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {transaction.claimCode && (
                <div className="border p-4 rounded-xl flex items-center justify-between bg-amber-500/10 border-amber-500/30">
                    <div className="flex items-center gap-3">
                        <Ticket className="h-5 w-5 text-amber-500" />
                        <div><p className="text-[10px] font-black uppercase text-amber-600">Voucher Kredit</p><p className="text-lg font-black font-mono">{transaction.claimCode}</p></div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <h4 className='text-[10px] font-black uppercase text-muted-foreground tracking-widest'>Rincian Tagihan</h4>
                <div className="space-y-2">
                    {charges.map((charge, idx) => (
                    <div key={idx} className='flex justify-between items-center bg-muted/50 p-3 rounded-lg border border-border'>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-bold uppercase">{charge.description.replace('FnB: ', '')}</p>
                                {charge.isPaid && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                            </div>
                            <p className={cn("font-mono text-xs font-bold", charge.description.includes('FnB:') ? "text-emerald-600" : "text-primary")}>
                                {formatCurrency(charge.amount || 0)}
                            </p>
                        </div>
                        {!charge.isPaid && onPayCharge && <Button variant="outline" size="sm" className="h-7 text-[9px] font-black uppercase" onClick={() => onPayCharge(idx)}>Bayar</Button>}
                    </div>
                    ))}
                </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-2 bg-muted/30 border-t shrink-0">
            <div className="space-y-2 mb-4">
                <div className='flex justify-between text-xs opacity-60 font-bold'><span>TOTAL BRUTO</span><span className="font-mono">{formatCurrency(bruto)}</span></div>
                {transaction.discount > 0 && <div className='flex justify-between text-xs text-amber-600 font-bold'><span>DISKON / REWARD</span><span className="font-mono">-{formatCurrency(transaction.discount)}</span></div>}
                <Separator />
                <div className='flex justify-between items-end'><span className="text-xs font-black uppercase">TOTAL TAGIHAN NETTO</span><span className="text-2xl font-black text-primary font-mono">{formatCurrency(outstandingAmount > 0 ? outstandingAmount : netto)}</span></div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1 font-bold uppercase gap-2 h-11" onClick={handlePrint} disabled={isPrinting}>
                    {isPrinting ? <Loader2 className="size-4 animate-spin" /> : <Printer className="size-4" />}
                    Cetak Nota
                </Button>
                {!isPaid && (
                    <Button onClick={handleFinalPaid} className="flex-[1.5] font-black uppercase text-xs h-11 shadow-lg shadow-primary/20">
                        Bayar & Lunasi
                    </Button>
                )}
                {isPaid && (
                    <DialogClose asChild><Button variant="secondary" className="flex-1 font-bold uppercase h-11">Tutup</Button></DialogClose>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
