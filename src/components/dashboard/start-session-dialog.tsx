
'use client';

import { useState, useMemo, cloneElement, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import type { FnbItem, PricingRule, Member } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { 
    Minus, 
    Plus, 
    ArrowLeft, 
    ArrowRight, 
    ShoppingCart, 
    Clock, 
    Tag, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Banknote,
    Users,
    Search,
    UserCheck,
    Gift,
    Award,
    ReceiptText,
    CreditCard,
    Sparkles,
    Gamepad2,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Input } from '../ui/input';
import Image from 'next/image';

interface StartSessionDialogProps {
  stationType: 'PS3' | 'PS4' | 'PS5';
  pricingRules: PricingRule[];
  fnbItems: FnbItem[];
  onConfirm: (
    rule: PricingRule | null, 
    selectedFnb: { id: string; name: string; price: number; quantity: number }[],
    isPaid: boolean,
    member?: Member | null,
    discount?: number,
    extraSticks?: number
  ) => void;
  triggerButton?: React.ReactElement;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isAddingTime?: boolean;
  outstandingAmount?: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} Jam`;
  return `${hours.toFixed(1).replace('.', ',')} Jam`;
};

const slideVariants = {
    hidden: { x: 8, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -8, opacity: 0 },
};

export function StartSessionDialog({
  stationType,
  pricingRules,
  fnbItems,
  onConfirm,
  triggerButton,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  isAddingTime = false,
  outstandingAmount = 0,
}: StartSessionDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Identity, 2: Selection (Config), 3: Checkout
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedFnb, setSelectedFnb] = useState<Record<string, number>>({});
  const [isPaid, setIsPaid] = useState(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [extraSticks, setExtraSticks] = useState<number>(0);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const isOpen = controlledIsOpen ?? internalIsOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalIsOpen;

  // Real-time HH/Begadang Check
  const currentHour = new Date().getHours();
  const isHappyHour = currentHour >= 8 && currentHour < 13;
  const isBegadang = currentHour >= 22 || currentHour < 6;

  const membersQuery = useMemoFirebase(() => !firestore ? null : collection(firestore, 'members'), [firestore]);
  const { data: members } = useCollection<Member>(membersQuery);

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return [];
    return (members || []).filter(m => 
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
        m.phone.includes(memberSearch)
    ).slice(0, 4);
  }, [members, memberSearch]);

  const relevantPricingRules = useMemo(() => {
    return pricingRules.filter(
      (rule) => rule.type === 'All' || rule.type === stationType
    ).sort((a, b) => a.duration - b.duration);
  }, [pricingRules, stationType]);

  const selectedRule = useMemo(() => pricingRules.find((r) => r.id === selectedRuleId), [pricingRules, selectedRuleId]);
  
  const fnbDetails = useMemo(() => Object.entries(selectedFnb)
      .map(([id, quantity]) => {
        if (quantity === 0) return null;
        const item = fnbItems.find((f) => f.id === id);
        if (!item) return null;
        return { id, name: item.name, price: item.sellPrice, quantity };
      })
      .filter((i): i is { id: string; name: string; price: number; quantity: number; } => i !== null), [selectedFnb, fnbItems]);

  useEffect(() => {
    if (isOpen) {
        setStep(1);
        setSelectedRuleId(null);
        setSelectedFnb({});
        setIsPaid(false);
        setDiscountAmount(0);
        setExtraSticks(0);
        setSelectedMember(null);
        setMemberSearch('');
    }
  }, [isOpen]);

  const handleNextStep = () => {
    if (step === 2 && !isAddingTime && !selectedRule) {
      toast({ title: 'Pilih Paket', description: 'Silakan pilih paket waktu terlebih dahulu.', variant: 'destructive' });
      return;
    }
    setStep(s => s + 1);
  };
  
  const handlePrevStep = () => setStep(s => s - 1);

  const handleConfirm = () => {
    onConfirm(selectedRule || null, fnbDetails, isPaid, selectedMember, discountAmount, extraSticks);
  };
  
  const handleFnbQuantityChange = (itemId: string, change: 1 | -1) => {
    setSelectedFnb(prev => {
        const currentQuantity = prev[itemId] || 0;
        const newQuantity = Math.max(0, currentQuantity + change);
        const item = fnbItems.find(f => f.id === itemId);
        if (item && newQuantity > item.stock) {
            toast({ title: 'Stok Habis', description: `Sisa ${item.stock} unit.`, variant: 'destructive' });
            return { ...prev, [itemId]: item.stock };
        }
        return { ...prev, [itemId]: newQuantity };
    });
  };
  
  const fnbTotal = useMemo(() => fnbDetails.reduce((total, item) => total + item.price * item.quantity, 0), [fnbDetails]);
  const extraStickTotal = extraSticks * 1000;
  const timePackagePrice = selectedRule?.price || 0;
  const newAdditionsTotal = timePackagePrice + fnbTotal + extraStickTotal;
  const totalBeforeDiscount = (outstandingAmount || 0) + newAdditionsTotal;
  const finalTotal = Math.max(0, totalBeforeDiscount - discountAmount);

  const trigger = triggerButton ? (
    cloneElement(triggerButton, { onClick: () => onOpenChange(true) })
  ) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-lg overflow-hidden bg-background border-border/40 p-0 rounded-[2rem] gap-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <DialogHeader className="px-6 pt-6 pb-2 relative z-10">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <DialogTitle className="text-xl font-black tracking-tighter uppercase leading-none">
                        {isAddingTime ? 'Update Sesi' : 'Konfigurasi Sesi'}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 bg-primary/5 text-primary tracking-widest px-1.5 h-4">
                            UNIT {stationType}
                        </Badge>
                        {!isAddingTime && (
                            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Tahap {step}/3</span>
                        )}
                    </div>
                </div>
                {!isAddingTime && (
                    <div className="flex gap-1.5">
                        {[1,2,3].map(i => (
                            <div key={i} className={cn(
                                "h-1 rounded-full transition-all duration-500",
                                step === i ? "w-5 bg-primary" : "w-1.5 bg-muted"
                            )} />
                        ))}
                    </div>
                )}
            </div>
        </DialogHeader>

        <div className="relative z-10 px-6 py-4 min-h-[380px] flex flex-col">
            <AnimatePresence mode="wait">
                {step === 1 && !isAddingTime && (
                    <motion.div key="identity" initial="hidden" animate="visible" exit="exit" variants={slideVariants} className="space-y-5">
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari Member (Nama/Nomor HP)..." 
                                    className="pl-10 h-11 bg-muted/40 border-transparent focus:ring-primary/20 rounded-xl text-sm"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {filteredMembers.length > 0 && (
                                <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-1">
                                    {filteredMembers.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => { setSelectedMember(m); setMemberSearch(''); }}
                                            className="w-full p-3 flex items-center justify-between hover:bg-primary/5 border-b last:border-0 transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black uppercase tracking-tight">{m.name}</p>
                                                    <p className="text-[9px] text-muted-foreground font-mono">{m.phone}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black">{m.points} PTS</Badge>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedMember ? (
                                <div className="p-4 rounded-2xl bg-amber-500/[0.03] border-2 border-amber-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                            <UserCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest">Pelanggan</p>
                                            <p className="font-black text-lg uppercase tracking-tight leading-none">{selectedMember.name}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)} className="h-8 rounded-lg text-[10px] font-black uppercase text-muted-foreground hover:text-red-500">Ganti</Button>
                                </div>
                            ) : (
                                <div className="p-8 border-2 border-dashed border-border/40 rounded-3xl flex flex-col items-center justify-center opacity-40">
                                    <Users className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-center">Tamu Umum (Guest)</p>
                                </div>
                            )}
                        </div>
                        
                        {selectedMember && (
                            <div className="bg-muted/30 rounded-2xl p-3 border border-border/50">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        <Award className="size-2.5 text-amber-500" /> Loyalty Progres
                                    </p>
                                    <span className="text-[8px] font-bold text-muted-foreground">{selectedMember.stamps}/10</span>
                                </div>
                                <div className="flex gap-1 justify-between">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className={cn("size-6 rounded-md border flex items-center justify-center p-0.5", i < (selectedMember.stamps || 0) ? "bg-primary/10 border-primary/30" : "bg-background border-border/30 opacity-30")}>
                                            {i < (selectedMember.stamps || 0) && <Image src="/xenonplay-logo.png" alt="X" width={14} height={14} className="object-contain" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {(step === 2 || isAddingTime) && (
                    <motion.div key="selection" initial="hidden" animate="visible" exit="exit" variants={slideVariants} className="space-y-4">
                        <Tabs defaultValue="time" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 h-10 bg-muted/50 p-1 rounded-xl mb-4">
                                <TabsTrigger value="time" className="rounded-lg data-[state=active]:bg-background font-black uppercase text-[9px] tracking-widest gap-1.5">
                                    <Clock className="h-3 w-3"/> Waktu
                                </TabsTrigger>
                                <TabsTrigger value="fnb" className="rounded-lg data-[state=active]:bg-background font-black uppercase text-[9px] tracking-widest gap-1.5">
                                    <ShoppingCart className="h-3 w-3"/> Kantin
                                </TabsTrigger>
                                <TabsTrigger value="extra" className="rounded-lg data-[state=active]:bg-background font-black uppercase text-[9px] tracking-widest gap-1.5">
                                    <Gamepad2 className="h-3 w-3"/> Opsi
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="time" className="mt-0 outline-none">
                                <ScrollArea className='h-[260px] pr-2'>
                                    {(isHappyHour || isBegadang) && (
                                        <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-pulse">
                                            <Sparkles className="size-4 text-amber-600" />
                                            <p className="text-[10px] font-black uppercase text-amber-700 leading-tight">
                                                {isHappyHour ? "HAPPY HOUR AKTIF! HARGA LEBIH MURAH." : "PAKET BEGADANG TERSEDIA!"}
                                            </p>
                                        </div>
                                    )}
                                    <RadioGroup value={selectedRuleId || undefined} onValueChange={setSelectedRuleId} className='grid grid-cols-2 gap-2 pb-2'>
                                        {relevantPricingRules.map(rule => {
                                            const isSpecial = (isHappyHour && rule.name.toLowerCase().includes('happy')) || (isBegadang && rule.name.toLowerCase().includes('begadang'));
                                            return (
                                                <div key={rule.id}>
                                                    <RadioGroupItem value={rule.id} id={rule.id} className="sr-only" />
                                                    <Label 
                                                        htmlFor={rule.id} 
                                                        className={cn(
                                                            'block cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 active:scale-95 relative overflow-hidden',
                                                            selectedRuleId === rule.id ? 'border-primary bg-primary/[0.03]' : 'bg-muted/20 border-transparent hover:border-border/50',
                                                            isSpecial && !selectedRuleId && "border-amber-500/40 bg-amber-500/5"
                                                        )}
                                                    >
                                                        {isSpecial && <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-amber-500 text-white text-[7px] font-black uppercase">Promo</div>}
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <span className="text-[10px] font-black uppercase tracking-tight text-primary">{formatDuration(rule.duration)}</span>
                                                            {selectedRuleId === rule.id && <CheckCircle2 className="size-3.5 text-primary" />}
                                                        </div>
                                                        <p className="font-bold text-xs uppercase truncate mb-1">{rule.name}</p>
                                                        <p className="text-sm font-black text-foreground font-mono">{formatCurrency(rule.price).replace(',00', '')}</p>
                                                    </Label>
                                                </div>
                                            )
                                        })}
                                    </RadioGroup>
                                </ScrollArea>
                            </TabsContent>
                            
                            <TabsContent value="fnb" className="mt-0 outline-none">
                                <ScrollArea className='h-[260px] pr-2'>
                                    <div className='grid gap-1.5 pb-2'>
                                        {fnbItems.map(item => (
                                            <div key={item.id} className={cn(
                                                'flex items-center justify-between p-2.5 rounded-xl border transition-all',
                                                (selectedFnb[item.id] || 0) > 0 ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'bg-muted/20 border-transparent'
                                            )}>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className='font-black uppercase tracking-tight text-[11px] truncate'>{item.name}</p>
                                                    <p className='text-[9px] font-mono text-muted-foreground'>{formatCurrency(item.sellPrice)} • <span className='font-bold text-emerald-600'>Stok {item.stock}</span></p>
                                                </div>
                                                <div className='flex items-center gap-2 bg-background p-1 rounded-lg border shadow-sm shrink-0'>
                                                    <Button size='icon' variant='ghost' className='h-6 w-6' onClick={() => handleFnbQuantityChange(item.id, -1)} disabled={(selectedFnb[item.id] || 0) === 0}>
                                                        <Minus className='h-3 w-3'/>
                                                    </Button>
                                                    <span className='w-4 text-center font-black font-mono text-[11px]'>{(selectedFnb[item.id] || 0)}</span>
                                                    <Button size='icon' variant='ghost' className='h-6 w-6' onClick={() => handleFnbQuantityChange(item.id, 1)} disabled={(selectedFnb[item.id] || 0) >= item.stock}>
                                                        <Plus className='h-3 w-3'/>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="extra" className="mt-0 outline-none">
                                <div className="p-4 rounded-2xl border bg-muted/20 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-xs font-black uppercase tracking-widest">Stik Tambahan</Label>
                                            <p className="text-[10px] text-muted-foreground">Biaya Rp1.000 / stik extra (3 & 4)</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-background p-1 rounded-xl border shadow-sm">
                                            <Button size='icon' variant='ghost' className='h-8 w-8' onClick={() => setExtraSticks(Math.max(0, extraSticks - 1))} disabled={extraSticks === 0}>
                                                <Minus className='h-4 w-4'/>
                                            </Button>
                                            <span className='w-6 text-center font-black font-mono text-sm'>{extraSticks}</span>
                                            <Button size='icon' variant='ghost' className='h-8 w-8' onClick={() => setExtraSticks(Math.min(2, extraSticks + 1))} disabled={extraSticks >= 2}>
                                                <Plus className='h-4 w-4'/>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                                        <Info className="size-4 text-primary shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-primary/80 leading-relaxed italic">
                                            "Target Riset: Pemain ekstra (stik 3/4) meningkatkan margin profit 100% tanpa beban listrik tambahan."
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                )}

                {step === 3 && !isAddingTime && (
                    <motion.div key="checkout" initial="hidden" animate="visible" exit="exit" variants={slideVariants} className="space-y-4">
                        <div className="rounded-2xl border bg-muted/20 p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                                <ReceiptText className="size-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Rincian Nota Digital</span>
                            </div>
                            
                            <ScrollArea className="max-h-[140px] mb-4">
                                <div className="space-y-2 pr-2">
                                    {selectedRule && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground uppercase font-medium">Sewa {formatDuration(selectedRule.duration)}</span>
                                            <span className="font-mono font-bold">{formatCurrency(selectedRule.price)}</span>
                                        </div>
                                    )}
                                    {extraSticks > 0 && (
                                        <div className="flex justify-between items-center text-[11px] text-emerald-600">
                                            <span className="uppercase font-medium">Biaya Tambahan {extraSticks} Stik</span>
                                            <span className="font-mono font-bold">+{formatCurrency(extraSticks * 1000)}</span>
                                        </div>
                                    )}
                                    {fnbDetails.map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-[11px]">
                                            <span className="text-muted-foreground truncate max-w-[180px]">{item.name} x{item.quantity}</span>
                                            <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <Separator className="mb-4" />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="relative">
                                        <Label className="text-[8px] font-black uppercase text-amber-500 absolute -top-3 left-0">Potongan Diskon</Label>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-[10px] font-black text-muted-foreground/60">RP</span>
                                            <Input 
                                                type="number" 
                                                className="w-24 h-7 bg-background border-border text-amber-500 font-black font-mono text-xs rounded-md p-1"
                                                value={discountAmount || ''}
                                                onChange={(e) => setDiscountAmount(parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Total Akhir</p>
                                        <p className="text-2xl font-black text-primary font-mono tracking-tighter leading-none">
                                            {formatCurrency(finalTotal).replace(',00', '')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-primary/10 border border-primary/30">
                                    <Checkbox 
                                        id="paid-status" 
                                        checked={isPaid} 
                                        onCheckedChange={(val) => setIsPaid(val === true)}
                                        className="size-4 border-primary"
                                    />
                                    <label htmlFor="paid-status" className="text-[9px] font-black uppercase text-primary cursor-pointer tracking-wider">
                                        Konfirmasi Bayar Lunas Sekarang
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-3 rounded-xl border border-dashed border-border/50 flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground">
                                <UserCheck className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[8px] font-black text-muted-foreground uppercase">Atas Nama</p>
                                <p className="text-xs font-bold uppercase truncate">{selectedMember?.name || 'Tamu Umum'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <DialogFooter className="p-6 pt-2 pb-8 relative z-10 flex flex-col sm:flex-row gap-3">
            {!isAddingTime ? (
                <>
                    <div className="flex gap-2 w-full">
                        {step > 1 ? (
                            <Button variant="outline" onClick={handlePrevStep} className="flex-1 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/50">
                                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Kembali
                            </Button>
                        ) : (
                            <DialogClose asChild>
                                <Button variant="ghost" className="flex-1 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest">Batal</Button>
                            </DialogClose>
                        )}
                        
                        {step < 3 ? (
                            <Button onClick={handleNextStep} className="flex-[2] h-11 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                                Lanjutkan <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                        ) : (
                            <Button onClick={handleConfirm} disabled={totalBeforeDiscount <= 0} className="flex-[2] h-11 rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 gap-2">
                                <Zap className="size-3.5 fill-current" /> Aktifkan Unit
                            </Button>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex gap-2 w-full">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/50">Batal</Button>
                    </DialogClose>
                    <Button onClick={handleConfirm} disabled={totalBeforeDiscount <= 0} className="flex-[2] h-11 rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30">
                        Simpan Perubahan
                    </Button>
                </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
