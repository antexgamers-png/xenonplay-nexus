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

  const bruto = transaction.amount || 0;
  const discount = transaction.discount || 0;
  const netto = Math.max(0, bruto - discount);
  const outstandingAmount = Math.max(0, netto - (transaction.paidAmount || 0));
  const isPaid = transaction.status === 'paid';

  const charges = transaction.additionalCharges ?? [];
  
  const rentalCharges = charges.filter(c => c && c.description && !c.description.startsWith('FnB:'));
  const fnbItems = transaction.fnbItems || [];

  const handleFinalPaid = () => {
      onMarkAsPaid(selectedMember);
      setSelectedMember(null);
      setMemberSearch('');
  };

  const handlePrint = () => {
    setIsPrinting(true);
    const storeName = settings?.storeName || 'XENONPLAY';
    const address = settings?.address || '';
    const paperSize = settings?.receiptPaperSize || '58mm';
    const headerMsg = settings?.receiptHeader || 'Selamat datang di toko kami';
    const footerMsg = settings?.receiptFooter || 'Terimakasih Telah Bermain\n"Good Game, Well Played"';

    const dateStr = format(transaction.timestamp, 'dd/MM/yyyy');
    const timeStr = format(transaction.timestamp, 'HH:mm');
    const shift = shifts?.find(s => s.id === transaction.shiftId);
    const cashierName = shift?.openedByName || 'Operator';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printLines: any[] = [];
    
    rentalCharges.forEach(rc => {
        let name = rc.description.replace(/^Sewa\s+/i, '').replace(/x\d+$/i, '').trim();
        printLines.push({
            name: name.toUpperCase(),
            qty: 1,
            price: rc.amount,
            total: rc.amount
        });
    });

    fnbItems.forEach(f => {
        printLines.push({
            name: f.name.toUpperCase(),
            qty: f.quantity,
            price: f.price,
            total: f.price * f.quantity
        });
    });

    const totalQty = printLines.reduce((s, i) => s + i.qty, 0);

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>XenonPlay Receipt - ${transaction.id}</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js"></script>
          <style>
            @page { margin: 0; size: auto; }
            html, body { 
              margin: 0; 
              padding: 0; 
              background: #fff; 
              display: flex;
              flex-direction: column;
              align-items: center;
              font-family: 'Courier New', Courier, monospace;
            }
            .receipt-paper { 
              width: 100vw;
              max-width: ${paperSize};
              padding: 12mm 6mm; 
              background: #fff;
              font-size: 13px; 
              line-height: 1.3; 
              color: #000;
              box-sizing: border-box;
              border: 1px solid #f1f5f9; /* Ghost border for preview */
              box-shadow: 0 10px 40px rgba(0,0,0,0.05);
              margin-bottom: 80px;
            }
            .center { text-align: center; } 
            .right { text-align: right; } 
            .bold { font-weight: bold; }
            .sep { border-top: 1px dashed #000; margin: 10px 0; }
            .item-block { margin-bottom: 8px; }
            .item-name { font-weight: bold; display: block; text-transform: uppercase; }
            .flex { display: flex; justify-content: space-between; }
            .logo { width: 60px; height: auto; margin: 0 auto 12px; display: block; filter: grayscale(1); }
            .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total-row { display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 8px; }
            
            /* Modern FAB Styles */
            .fab-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                display: flex;
                flex-direction: column-reverse;
                align-items: center;
                gap: 15px;
                z-index: 1000;
            }
            .fab-main {
                width: 60px;
                height: 60px;
                background: #0ea5e9; /* Azure Cyan */
                color: white;
                border-radius: 18px; /* Modern Squircle */
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.4);
                cursor: pointer;
                border: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .fab-main svg { width: 30px; height: 30px; fill: currentColor; }
            .fab-main.active { transform: rotate(135deg); background: #ef4444; box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4); }
            
            .fab-menu {
                display: flex;
                flex-direction: column;
                gap: 12px;
                opacity: 0;
                transform: translateY(20px) scale(0.8);
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .fab-menu.active { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
            
            .fab-item {
                width: 52px;
                height: 52px;
                background: white;
                color: #64748b;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                cursor: pointer;
                border: 1px solid #f1f5f9;
                transition: all 0.2s;
            }
            .fab-item:hover { background: #f8fafc; color: #0ea5e9; transform: translateX(-5px); }
            .fab-item svg { width: 22px; height: 22px; fill: currentColor; }

            @media (max-width: 480px) {
                .receipt-paper { width: 96vw; padding: 8mm 6mm; border-radius: 12px; }
            }
            @media print {
              .fab-container { display: none; }
              .receipt-paper { border: none; box-shadow: none; width: ${paperSize}; margin: 0; }
              body { background: #fff; }
            }
          </style>
        </head>
        <body>
            <div id="receipt-target" class="receipt-paper">
                <div class="center">
                    <img src="/xplogo-monochrome.png" class="logo" />
                    <div class="bold" style="font-size: 16px;">${storeName.toUpperCase()}</div>
                    <div style="font-size: 11px; opacity: 0.8;">${address}</div>
                    <div style="margin-top: 8px; font-size: 11px;">${headerMsg}</div>
                </div>
                
                <div class="sep"></div>
                
                <div class="flex" style="font-size: 11px;">
                    <div>
                    <div>Nota : ${transaction.id.substring(0,8).toUpperCase()}</div>
                    <div>Tgl  : ${dateStr}</div>
                    <div>Jam  : ${timeStr}</div>
                    </div>
                    <div class="right">
                    <div>Kasir:</div>
                    <div class="bold">${cashierName.toUpperCase()}</div>
                    </div>
                </div>

                <div class="sep"></div>

                ${printLines.map((item, idx) => `
                    <div class="item-block">
                    <span class="item-name">${idx + 1}. ${item.name}</span>
                    <div class="flex">
                        <span>${item.qty} x ${item.price.toLocaleString('id-ID')}</span>
                        <span class="right bold">${item.total.toLocaleString('id-ID')}</span>
                    </div>
                    </div>
                `).join('')}

                <div class="sep"></div>

                <div class="summary-row">
                    <span>Total Qty</span>
                    <span class="right">${totalQty} Items</span>
                </div>
                <div class="summary-row">
                    <span>Sub Total</span>
                    <span class="right">${bruto.toLocaleString('id-ID')}</span>
                </div>
                ${discount > 0 ? `
                <div class="summary-row" style="color: #000;">
                    <span>Potongan Diskon</span>
                    <span class="right">- ${discount.toLocaleString('id-ID')}</span>
                </div>
                ` : ''}

                <div class="total-row">
                    <span>TOTAL AKHIR</span>
                    <span class="right">${netto.toLocaleString('id-ID')}</span>
                </div>

                <div class="summary-row" style="opacity: 0.8;">
                    <span>Diterima (Cash)</span>
                    <span class="right">${(transaction.paidAmount || netto).toLocaleString('id-ID')}</span>
                </div>
                <div class="summary-row">
                    <span class="bold">Kembali</span>
                    <span class="right bold">0</span>
                </div>

                <div class="sep"></div>
                <div class="center" style="font-size: 11px; font-style: italic; white-space: pre-wrap;">${footerMsg}</div>
            </div>

            <div class="fab-container">
                <button class="fab-main" id="fab-main" onclick="toggleMenu()">
                    <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </button>
                <div class="fab-menu" id="fab-menu">
                    <button class="fab-item" onclick="window.print()" title="Cetak">
                        <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.33-3 3v6h4v4h12v-4h4v-6c0-1.67-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                    </button>
                    <button class="fab-item" onclick="exportImage()" title="Simpan PNG">
                        <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                    </button>
                    <button class="fab-item" onclick="exportPDF()" title="Simpan PDF">
                        <svg viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 10h1V8H9v2zm5.5 2h1V8h-1v4zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/></svg>
                    </button>
                </div>
            </div>

            <script>
                function toggleMenu() {
                    const main = document.getElementById('fab-main');
                    const menu = document.getElementById('fab-menu');
                    main.classList.toggle('active');
                    menu.classList.toggle('active');
                }

                function exportImage() {
                    const target = document.getElementById('receipt-target');
                    target.style.border = 'none'; // Hide ghost border for export
                    target.style.boxShadow = 'none';
                    html2canvas(target, { backgroundColor: '#fff', scale: 3 }).then(canvas => {
                        const link = document.createElement('a');
                        link.download = 'XenonPlay_${transaction.id.substring(0,8)}.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                        target.style.border = '1px solid #f1f5f9'; // Restore ghost border
                        target.style.boxShadow = '0 10px 40px rgba(0,0,0,0.05)';
                    });
                }

                function exportPDF() {
                    const target = document.getElementById('receipt-target');
                    target.style.border = 'none';
                    target.style.boxShadow = 'none';
                    const { jsPDF } = window.jspdf;
                    html2canvas(target, { scale: 2 }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'px',
                            format: [canvas.width / 2, canvas.height / 2]
                        });
                        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
                        pdf.save('XenonPlay_${transaction.id.substring(0,8)}.pdf');
                        target.style.border = '1px solid #f1f5f9';
                        target.style.boxShadow = '0 10px 40px rgba(0,0,0,0.05)';
                    });
                }
            </script>
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
                <div className={cn("p-2 rounded-lg", transaction.stationId === 'pos' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                    {transaction.stationId === 'pos' ? <ShoppingCart className="h-5 w-5" /> : <Gamepad2 className="h-5 w-5" />}
                </div>
                <div>
                    <DialogTitle className="text-lg font-bold uppercase">{transaction.stationId === 'pos' ? 'Nota Kasir Kantin' : `Nota ${transaction.stationName ?? 'Stasiun'}`}</DialogTitle>
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
            {!isPaid && transaction.stationId !== 'pos' && (
                <div className="space-y-3">
                    <h4 className='text-[10px] font-black uppercase text-muted-foreground tracking-widest'>Siapa yang bayar?</h4>
                    {transaction.memberId ? (
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-4 text-primary" />
                                <span className="text-xs font-bold uppercase">{transaction.memberName}</span>
                            </div>
                            <Badge variant="outline" className="text-[8px] font-black text-primary border-primary/20">MEMBER</Badge>
                        </div>
                    ) : selectedMember ? (
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/30 flex justify-between items-center animate-in zoom-in-95">
                            <div className="flex items-center gap-3">
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
                                    placeholder="Cari member..." 
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
                {transaction.discount > 0 && <div className='flex justify-between text-xs text-amber-600 font-bold'><span>DISKON</span><span className="font-mono">-{formatCurrency(transaction.discount)}</span></div>}
                <Separator />
                <div className='flex justify-between items-end'><span className="text-xs font-black uppercase">GRAND TOTAL</span><span className="text-2xl font-black text-primary font-mono">{formatCurrency(outstandingAmount > 0 ? outstandingAmount : netto)}</span></div>
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
