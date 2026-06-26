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
import { ShoppingCart, Gamepad2, Ticket, CheckCircle2, AlertCircle, Search, UserCheck, X, Printer, Loader2, Wifi } from 'lucide-react';
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
  const isWifi = transaction.stationId === 'wifi';

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
    const fontSize = settings?.receiptFontSize || 12;
    const fontWeight = settings?.receiptFontWeight || '500';
    const headerMsg = settings?.receiptHeader || 'Selamat datang di toko kami';
    const footerMsg = settings?.receiptFooter || 'Terimakasih Telah Bermain\n"Good Game, Well Played"';
    const wifiGuide = settings?.wifiInstructions || 'Silahkan hubungi kasir jika ada kendala.';

    const dateStr = format(transaction.timestamp, 'dd/MM/yyyy');
    const timeStr = format(transaction.timestamp, 'HH:mm');
    const shift = shifts?.find(s => s.id === transaction.shiftId);
    const cashierName = shift?.openedByName || 'Operator';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let receiptBody = '';

    if (isWifi) {
        receiptBody = `
            <div class="center">
                <img src="/xenonplay-logo.png" class="logo" />
                <div class="bold" style="font-size: 1.2em;">${storeName.toUpperCase()}</div>
                <div style="margin-top: 6px; font-size: 0.8em; opacity: 0.7;">${headerMsg}</div>
            </div>
            <div class="sep"></div>
            <div class="center py-6">
                <span style="font-size: 0.8em; font-weight: 900; letter-spacing: 2px; opacity: 0.6; display: block; margin-bottom: 5px;">KODE VOUCHER WI-FI</span>
                <div style="font-size: 3.2em; font-weight: 900; margin: 10px 0; letter-spacing: 4px; line-height: 1;">${transaction.claimCode}</div>
                <div class="bold" style="font-size: 1em; text-transform: uppercase; margin-top: 10px; color: #3b82f6;">PAKET: ${transaction.packageName || 'HOTSPOT'}</div>
            </div>
            <div class="sep"></div>
            <div style="padding: 10px 5px;">
                <div class="bold" style="font-size: 0.85em; margin-bottom: 5px; border-bottom: 1px solid #000; width: fit-content;">PANDUAN KONEKSI:</div>
                <div style="font-size: 0.8em; line-height: 1.4; white-space: pre-wrap; opacity: 0.9;">${wifiGuide}</div>
            </div>
            <div class="sep"></div>
            <div class="flex" style="font-size: 0.7em; opacity: 0.6;">
                <div>Tgl: ${dateStr} ${timeStr}</div>
                <div class="right">Kasir: ${cashierName.toUpperCase()}</div>
            </div>
        `;
    } else {
        const printLines: any[] = [];
        rentalCharges.forEach(rc => {
            let name = rc.description.replace(/^Sewa\s+/i, '').replace(/x\d+$/i, '').trim();
            printLines.push({ name: name.toUpperCase(), qty: 1, price: rc.amount, total: rc.amount });
        });
        fnbItems.forEach(f => {
            printLines.push({ name: f.name.toUpperCase(), qty: f.quantity, price: f.price, total: f.price * f.quantity });
        });
        const totalQty = printLines.reduce((s, i) => s + i.qty, 0);

        receiptBody = `
            <div class="center">
                <img src="/xenonplay-logo.png" class="logo" />
                <div class="bold" style="font-size: 1.2em;">${storeName.toUpperCase()}</div>
                <div style="font-size: 0.75em; opacity: 0.7;">${address}</div>
            </div>
            <div class="sep"></div>
            <div class="flex" style="font-size: 0.75em;">
                <div>Nota: ${transaction.id.substring(0,8).toUpperCase()}<br>Tgl: ${dateStr} ${timeStr}</div>
                <div class="right">Kasir:<br><span class="bold">${cashierName.toUpperCase()}</span></div>
            </div>
            <div class="sep"></div>
            ${printLines.map((item, idx) => `
                <div class="item-block">
                    <span class="item-name" style="font-size: 0.85em;">${idx + 1}. ${item.name}</span>
                    <div class="flex" style="font-size: 0.75em;">
                        <span>${item.qty} x ${item.price.toLocaleString('id-ID')}</span>
                        <span class="right bold">${item.total.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            `).join('')}
            <div class="sep"></div>
            <div class="summary-row" style="font-size: 0.75em;"><span>Sub Total</span><span class="right">${bruto.toLocaleString('id-ID')}</span></div>
            ${discount > 0 ? `<div class="summary-row" style="font-size: 0.75em;"><span>Diskon</span><span class="right">- ${discount.toLocaleString('id-ID')}</span></div>` : ''}
            <div class="total-row"><span>TOTAL</span><span class="right">${netto.toLocaleString('id-ID')}</span></div>
            <div class="sep"></div>
        `;
    }

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>XenonPlay Luxury Print - ${transaction.id}</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js"></script>
          <style>
            @page { margin: 0; size: ${paperSize} auto; }
            html, body { 
                margin: 0; padding: 0; background: #f1f5f9; 
                display: flex; flex-direction: column; align-items: center; 
                font-family: 'Courier New', Courier, monospace; min-height: 100vh;
            }
            .receipt-paper { 
                width: ${paperSize}; padding: 8mm 5mm; background: #fffdf5; 
                font-size: ${fontSize}px; font-weight: ${fontWeight}; line-height: 1.4; color: #000; 
                box-sizing: border-box; border: 1px solid #e2e8f0; 
                box-shadow: 0 20px 50px rgba(0,0,0,0.1); margin: 40px 0 100px; position: relative;
            }
            .center { text-align: center; } .right { text-align: right; } .bold { font-weight: bold; }
            .sep { border-top: 1px dashed #000; margin: 12px 0; opacity: 0.5; }
            .item-block { margin-bottom: 10px; } .item-name { font-weight: bold; display: block; text-transform: uppercase; }
            .flex { display: flex; justify-content: space-between; } 
            .logo { width: 50px; height: auto; margin: 0 auto 10px; display: block; filter: grayscale(1); opacity: 0.8; }
            .summary-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total-row { display: flex; justify-content: space-between; margin: 8px 0; font-weight: 900; font-size: 1.2em; border-top: 1.5px solid #000; padding-top: 8px; }
            .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
            
            /* UI Controls */
            .fab-container { position: fixed; bottom: 30px; right: 30px; display: flex; flex-direction: column-reverse; align-items: center; gap: 15px; z-index: 1000; }
            .fab-main { width: 64px; height: 64px; background: #0ea5e9; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.5); cursor: pointer; border: none; transition: all 0.3s; }
            .fab-main svg { width: 32px; height: 32px; fill: none; stroke: currentColor; stroke-width: 2.5; }
            .fab-main.active { transform: rotate(135deg); background: #ef4444; }
            .fab-menu { display: flex; flex-direction: column; gap: 12px; opacity: 0; transform: translateY(20px) scale(0.8); pointer-events: none; transition: all 0.3s; }
            .fab-menu.active { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
            .fab-item { width: 56px; height: 56px; background: white; color: #64748b; border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.1); cursor: pointer; border: 1px solid #f1f5f9; }
            .fab-item svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; }

            @media print {
              .fab-container { display: none; }
              .receipt-paper { border: none; box-shadow: none; width: ${paperSize}; margin: 0; padding: 0; background: #fff; }
              body { background: #fff; }
            }
          </style>
        </head>
        <body>
            <div id="receipt-target" class="receipt-paper">
                ${receiptBody}
                <div class="center" style="font-size: 0.8em; font-style: italic; white-space: pre-wrap; margin-top: 10px; opacity: 0.6;">${footerMsg}</div>
            </div>

            <div class="fab-container">
                <button class="fab-main" id="fab-main" onclick="toggleMenu()">
                    <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <div class="fab-menu" id="fab-menu">
                    <button class="fab-item" onclick="window.print()" title="Cetak Ke Printer">
                        <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-2 4H8v-6h8v6z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="fab-item" onclick="exportImage()" title="Simpan Gambar PNG">
                        <svg viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="fab-item" onclick="exportPDF()" title="Simpan Dokumen PDF">
                        <svg viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v5h5" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
                    const originalBorder = target.style.border;
                    const originalShadow = target.style.shadow;
                    target.style.border = 'none';
                    target.style.boxShadow = 'none';
                    target.style.margin = '0';
                    
                    html2canvas(target, { backgroundColor: '#fffdf5', scale: 3 }).then(canvas => {
                        const link = document.createElement('a');
                        link.download = 'XenonPlay_Nota_${transaction.id.substring(0,8)}.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                        target.style.border = originalBorder;
                        target.style.boxShadow = originalShadow;
                        target.style.margin = '40px 0 100px';
                    });
                }

                function exportPDF() {
                    const target = document.getElementById('receipt-target');
                    target.style.border = 'none';
                    target.style.boxShadow = 'none';
                    target.style.margin = '0';
                    const { jsPDF } = window.jspdf;
                    
                    html2canvas(target, { backgroundColor: '#fffdf5', scale: 2 }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'px',
                            format: [canvas.width / 2, canvas.height / 2]
                        });
                        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
                        pdf.save('XenonPlay_Nota_${transaction.id.substring(0,8)}.pdf');
                        target.style.border = '1px solid #e2e8f0';
                        target.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
                        target.style.margin = '40px 0 100px';
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
                <div className={cn("p-2 rounded-lg", isWifi ? "bg-amber-500/10 text-amber-500" : transaction.stationId === 'pos' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                    {isWifi ? <Wifi className="h-5 w-5" /> : transaction.stationId === 'pos' ? <ShoppingCart className="h-5 w-5" /> : <Gamepad2 className="h-5 w-5" />}
                </div>
                <div>
                    <DialogTitle className="text-lg font-bold uppercase">{isWifi ? 'Voucher Kupon Wi-Fi' : transaction.stationId === 'pos' ? 'Nota Kasir Kantin' : `Nota ${transaction.stationName ?? 'Stasiun'}`}</DialogTitle>
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
            {isWifi && transaction.claimCode && (
                <div className="p-8 rounded-[2rem] bg-amber-500/5 border-2 border-dashed border-amber-500/30 text-center animate-in zoom-in duration-500">
                    <p className="text-[10px] font-black uppercase text-amber-600 tracking-[0.3em] mb-4">Kode Voucher Aktif</p>
                    <div className="text-5xl font-black font-mono tracking-widest text-amber-600 uppercase">{transaction.claimCode}</div>
                </div>
            )}

            {!isPaid && !isWifi && transaction.stationId !== 'pos' && (
                <div className="space-y-3">
                    <h4 className='text-[10px] font-black uppercase text-muted-foreground tracking-widest'>Siapa yang bayar?</h4>
                    {transaction.memberId ? (
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
                            <div className="flex items-center gap-2"><UserCheck className="size-4 text-primary" /><span className="text-xs font-bold uppercase">{transaction.memberName}</span></div>
                            <Badge variant="outline" className="text-[8px] font-black text-primary border-primary/20">MEMBER</Badge>
                        </div>
                    ) : selectedMember ? (
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/30 flex justify-between items-center">
                            <div className="flex items-center gap-3"><UserCheck className="size-4 text-emerald-600" /><span className="text-xs font-bold uppercase">{selectedMember.name}</span></div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setSelectedMember(null)}><X className="size-3" /></Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Cari member..." className="pl-8 h-9 text-xs bg-muted/30" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} /></div>
                            {filteredMembers.length > 0 && (
                                <div className="rounded-lg border bg-card overflow-hidden shadow-sm">{filteredMembers.map(m => <button key={m.id} onClick={() => { setSelectedMember(m); setMemberSearch(''); }} className="w-full p-2.5 text-left text-xs hover:bg-primary/5 border-b last:border-0 flex justify-between items-center"><span className="font-bold uppercase">{m.name}</span><span className="text-[9px] text-muted-foreground font-mono">{m.phone}</span></button>)}</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-3">
                <h4 className='text-[10px] font-black uppercase text-muted-foreground tracking-widest'>Rincian Tagihan</h4>
                <div className="space-y-2">
                    {charges.map((charge, idx) => (
                    <div key={idx} className='flex justify-between items-center bg-muted/50 p-3 rounded-lg border border-border'>
                        <div className="flex-1">
                            <div className="flex items-center gap-2"><p className="text-xs font-bold uppercase">{charge.description.replace('FnB: ', '').replace('Wifi: ', '')}</p>{charge.isPaid && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}</div>
                            <p className={cn("font-mono text-xs font-bold", charge.description.includes('FnB:') ? "text-emerald-600" : isWifi ? "text-amber-600" : "text-primary")}>{formatCurrency(charge.amount || 0)}</p>
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
                <div className='flex justify-between items-end'><span className="text-xs font-black uppercase">GRAND TOTAL</span><span className={cn("text-2xl font-black font-mono", isWifi ? "text-amber-600" : "text-primary")}>{formatCurrency(outstandingAmount > 0 ? outstandingAmount : netto)}</span></div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1 font-bold uppercase gap-2 h-11" onClick={handlePrint} disabled={isPrinting}>
                    {isPrinting ? <Loader2 className="size-4 animate-spin" /> : <Printer className="size-4" />}
                    Cetak Nota
                </Button>
                {!isPaid && (
                    <Button onClick={handleFinalPaid} className="flex-[1.5] font-black uppercase text-xs h-11 shadow-lg shadow-primary/20">Bayar & Lunasi</Button>
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
