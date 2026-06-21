'use client';

import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  Firestore,
  writeBatch,
  increment,
  query,
  where,
  runTransaction,
} from 'firebase/firestore';
import type { Station, Transaction, PricingRule, FnbItem, GeneralSettings, Member, Shift, CreditVoucher, Expense, PointRedemption, LandingSettings, Reward, Reservation, MemberRequest } from './types';
import { formatDuration } from './utils';

function processLoyaltyInTransaction(txn: any, memberSnap: any, transactionRef: any, mRef: any) {
    if (!memberSnap.exists()) return;
    
    const mData = memberSnap.data() as Member;
    let currentStamps = mData.stamps || 0;
    let nextStamps = currentStamps + 1;
    let addedPoints = 0;

    if (nextStamps >= 10) {
        nextStamps = 0;
        addedPoints = 5;
    }

    txn.update(mRef, { stamps: nextStamps, points: increment(addedPoints), lastActivity: Date.now() });
    txn.update(transactionRef, { isLoyaltyProcessed: true });
}

export async function triggerADBAction(db: Firestore, stationId: string, action: string, staffId?: string, staffName?: string) {
  const stationRef = doc(db, 'stations', stationId);
  return await updateDoc(stationRef, { last_action: action, last_action_timestamp: Date.now() });
}

export async function convertSessionToCredit(db: Firestore, stationId: string, transactionId: string) {
    return await runTransaction(db, async (transaction) => {
        const sSnap = await transaction.get(doc(db, 'stations', stationId));
        const tSnap = await transaction.get(doc(db, 'transactions', transactionId));
        if (!sSnap.exists() || !tSnap.exists()) throw new Error("Data sesi tidak ditemukan.");
        const sData = sSnap.data() as Station;
        const tData = tSnap.data() as Transaction;
        if (tData.status !== 'paid') throw new Error("Sesi harus lunas (Paid) sebelum bisa dikonversi ke Kredit.");
        let currentUses = 0;
        if (tData.claimCode) {
            const vSnap = await transaction.get(doc(db, 'vouchers', tData.claimCode));
            if (vSnap.exists()) currentUses = vSnap.data().usesCount || 0;
        }
        if (currentUses >= 2) throw new Error("Batas maksimal kredit voucher telah tercapai (Max 2x).");
        const now = Date.now();
        const remainingMs = Math.max(0, (sData.end_time || 0) - now);
        const remainingMins = Math.floor(remainingMs / 60000);
        if (remainingMins < 5) throw new Error("Sisa waktu terlalu sedikit untuk dikreditkan.");
        const code = `XP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const vRef = doc(db, 'vouchers', code);
        transaction.set(vRef, { id: code, code, durationMinutes: remainingMins, stationType: sData.type, status: 'active', usesCount: currentUses + 1, createdAt: now, originalTransactionId: transactionId });
        transaction.update(doc(db, 'stations', stationId), { is_active: false, is_paused: false, start_time: null, end_time: null, current_transaction_id: null, last_action: 'stop', last_action_timestamp: now });
        return code;
    });
}

export async function openShift(db: Firestore, userId: string, userName: string, initialBalance: number) {
  const docRef = doc(collection(db, 'shifts'));
  const id = docRef.id;
  await setDoc(docRef, { id, status: 'open', openedBy: userId, openedByName: userName, openedAt: Date.now(), initialBalance, totalSales: 0, expectedBalance: initialBalance });
  return id;
}

export async function closeShift(db: Firestore, shiftId: string, actualBalance: number, notes: string) {
  const shiftRef = doc(db, 'shifts', shiftId);
  const shiftSnap = await getDoc(shiftRef);
  if (!shiftSnap.exists()) throw new Error("Data shift tidak ditemukan.");
  const shiftData = shiftSnap.data() as Shift;
  const difference = actualBalance - (shiftData.expectedBalance || 0);
  return await updateDoc(shiftRef, { status: 'closed', closedAt: Date.now(), actualBalance, difference, notes });
}

export async function addMember(db: Firestore, member: Omit<Member, 'id' | 'points' | 'stamps' | 'joinDate' | 'lastActivity'>) {
  const docRef = doc(collection(db, 'members'));
  await setDoc(docRef, { ...member, id: docRef.id, points: 0, stamps: 0, joinDate: Date.now(), lastActivity: Date.now() });
}

export async function updateMember(db: Firestore, id: string, updates: Partial<Member>) {
  return await updateDoc(doc(db, 'members', id), { ...updates, lastActivity: Date.now() });
}

export async function deleteMember(db: Firestore, id: string) {
  return await deleteDoc(doc(db, 'members', id));
}

export async function addMemberRequest(db: Firestore, data: { name: string, phone: string }) {
    const docRef = doc(collection(db, 'memberRequests'));
    await setDoc(docRef, { ...data, id: docRef.id, timestamp: Date.now() });
}

export async function approveMemberRequest(db: Firestore, request: MemberRequest) {
    return await runTransaction(db, async (txn) => {
        const mRef = doc(collection(db, 'members'));
        txn.set(mRef, {
            id: mRef.id,
            name: request.name,
            phone: request.phone,
            points: 0,
            stamps: 0,
            joinDate: Date.now(),
            lastActivity: Date.now()
        });
        txn.delete(doc(db, 'memberRequests', request.id));
    });
}

export async function deleteMemberRequest(db: Firestore, id: string) {
    await deleteDoc(doc(db, 'memberRequests', id));
}

export async function addStation(db: Firestore, id: string, stationData: any) {
  const docRef = doc(db, 'stations', id);
  await setDoc(docRef, { ...stationData, id, status: 'disconnected', is_active: false, is_paused: false, start_time: null, end_time: null, current_transaction_id: null });
}

export async function updateStation(db: Firestore, id: string, updates: Partial<Station>) {
  return await updateDoc(doc(db, 'stations', id), updates);
}

export async function deleteStation(db: Firestore, id: string) {
  return await deleteDoc(doc(db, 'stations', id));
}

export async function pauseStation(db: Firestore, stationId: string) {
    const stationRef = doc(db, 'stations', stationId);
    const snap = await getDoc(stationRef);
    if (!snap.exists()) return;
    const data = snap.data() as Station;
    const remaining = Math.max(0, Math.floor(((data.end_time || 0) - Date.now()) / 1000));
    return await updateDoc(stationRef, { is_paused: true, remaining_seconds: remaining, last_action: 'pause', last_action_timestamp: Date.now() });
}

export async function resumeStation(db: Firestore, stationId: string) {
    const stationRef = doc(db, 'stations', stationId);
    const snap = await getDoc(stationRef);
    if (!snap.exists()) return;
    const data = snap.data() as Station;
    const newEndTime = Date.now() + (data.remaining_seconds || 0) * 1000;
    return await updateDoc(stationRef, { is_paused: false, end_time: newEndTime, remaining_seconds: null, last_action: 'resume', last_action_timestamp: Date.now() });
}

export async function moveStation(db: Firestore, sourceId: string, targetId: string, transactionId: string) {
    return await runTransaction(db, async (txn) => {
        const sSnap = await txn.get(doc(db, 'stations', sourceId));
        const tSnap = await txn.get(doc(db, 'stations', targetId));
        if (!sSnap.exists() || !tSnap.exists()) throw new Error("Station tidak ditemukan.");
        const sData = sSnap.data() as Station;
        const now = Date.now();
        const remainingMs = Math.max(0, (sData.end_time || 0) - now);
        txn.update(doc(db, 'stations', sourceId), { is_active: false, current_transaction_id: null, end_time: null, last_action: 'stop' });
        txn.update(doc(db, 'stations', targetId), { is_active: true, current_transaction_id: transactionId, end_time: now + remainingMs, last_action: 'start' });
        txn.update(doc(db, 'transactions', transactionId), { stationId: targetId, stationName: tSnap.data().name });
    });
}

export async function addPricingRule(db: Firestore, rule: any) {
  const docRef = doc(collection(db, 'pricingRules'));
  await setDoc(docRef, { ...rule, id: docRef.id });
}

export async function updatePricingRule(db: Firestore, id: string, updates: Partial<PricingRule>) {
  return await updateDoc(doc(db, 'pricingRules', id), updates);
}

export async function deletePricingRule(db: Firestore, id: string) {
  return await deleteDoc(doc(db, 'pricingRules', id));
}

export async function addFnbItem(db: Firestore, item: any) {
  const docRef = doc(collection(db, 'fnbItems'));
  await setDoc(docRef, { ...item, id: docRef.id });
}

export async function updateFnbItem(db: Firestore, id: string, updates: Partial<FnbItem>) {
  return await updateDoc(doc(db, 'fnbItems', id), updates);
}

export async function deleteFnbItem(db: Firestore, id: string) {
  return await deleteDoc(doc(db, 'fnbItems', id));
}

export async function createTransaction(db: Firestore, data: any) {
    const docRef = doc(collection(db, 'transactions'));
    const now = Date.now();
    const isPaid = data.isPaid || false;
    const discount = data.discount || 0;
    const extraStickFee = (data.extraSticks || 0) * 1000;
    const baseAmount = data.amount || 0;
    
    // Hitung total FnB (baik manual maupun bundling dengan harga 0)
    const fnbTotal = (data.fnbItems || []).reduce((sum: number, f: any) => sum + (f.price * f.quantity), 0);
    const finalBruto = baseAmount + extraStickFee + fnbTotal;
    const finalNetto = Math.max(0, finalBruto - discount);
    
    const initialDesc = data.packageName || `Sewa ${formatDuration(data.durationMinutes)}`;
    const additionalCharges = [{ description: initialDesc, amount: baseAmount, timestamp: now, isPaid }];
    
    if (extraStickFee > 0) additionalCharges.push({ description: `${data.extraSticks} Stik Extra`, amount: extraStickFee, timestamp: now, isPaid });

    if (data.fnbItems && data.fnbItems.length > 0) {
        data.fnbItems.forEach((f: any) => {
            additionalCharges.push({ 
                description: `FnB: ${f.name} x${f.quantity}`, 
                amount: f.price * f.quantity, 
                timestamp: now, 
                isPaid 
            });
        });
    }

    const newTransaction: any = {
        id: docRef.id, 
        stationId: data.stationId || 'pos', 
        stationName: data.stationName || 'Unknown', 
        packageName: data.packageName || initialDesc,
        durationMinutes: data.durationMinutes || 0,
        amount: finalBruto, 
        discount: discount, 
        paidAmount: isPaid ? finalNetto : 0, 
        timestamp: now, 
        status: isPaid ? 'paid' : 'unpaid',
        memberId: data.memberId || null, 
        memberName: data.memberName || null, 
        shiftId: data.activeShiftId || null, 
        fnbItems: data.fnbItems || [],
        additionalCharges: additionalCharges, 
        claimCode: data.claimCode || null, 
        isLoyaltyProcessed: false
    };
    
    return await runTransaction(db, async (txn) => {
        let memberSnap = null;
        let memberRef = null;
        if (data.memberId && isPaid && data.stationId !== 'pos') {
            memberRef = doc(db, 'members', data.memberId);
            memberSnap = await txn.get(memberRef);
        }
        
        if (data.fnbItems && data.fnbItems.length > 0) {
            for (const item of data.fnbItems) {
                const itemRef = doc(db, 'fnbItems', item.id);
                txn.update(itemRef, { stock: increment(-item.quantity) });
            }
        }

        txn.set(docRef, newTransaction);
        if (memberSnap && memberRef) processLoyaltyInTransaction(txn, memberSnap, docRef, memberRef);
        if (data.activeShiftId && isPaid && finalNetto > 0) {
            const shiftRef = doc(db, 'shifts', data.activeShiftId);
            txn.update(shiftRef, { totalSales: increment(finalNetto), expectedBalance: increment(finalNetto) });
        }
        return newTransaction;
    });
}

export async function createStandaloneFnbTransaction(db: Firestore, items: any[], activeShiftId?: string | null) {
    const now = Date.now();
    const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const docRef = doc(collection(db, 'transactions'));
    const newTransaction = {
        id: docRef.id, 
        stationId: 'pos', 
        stationName: 'KASIR KANTIN', 
        durationMinutes: 0, 
        amount: totalAmount, 
        discount: 0, 
        paidAmount: totalAmount, 
        timestamp: now, 
        status: 'paid', 
        shiftId: activeShiftId || null, 
        fnbItems: items, 
        additionalCharges: items.map(i => ({ 
            description: `FnB: ${i.name} x${i.quantity}`, 
            amount: i.price * i.quantity, 
            timestamp: now, 
            isPaid: true 
        })), 
        isLoyaltyProcessed: false
    };

    return await runTransaction(db, async (txn) => {
        txn.set(docRef, newTransaction);
        if (activeShiftId) {
            const shiftRef = doc(db, 'shifts', activeShiftId);
            txn.update(shiftRef, { totalSales: increment(totalAmount), expectedBalance: increment(totalAmount) });
        }
        for (const item of items) {
            const itemRef = doc(db, 'fnbItems', item.id);
            txn.update(itemRef, { stock: increment(-item.quantity) });
        }
        return newTransaction;
    });
}

export async function addItemsToTransaction(db: Firestore, transactionId: string, items: any[], totalAmount: number, isPaid: boolean, discount: number, activeShiftId?: string | null) {
    return await runTransaction(db, async (txn) => {
        const tRef = doc(db, 'transactions', transactionId);
        const tSnap = await txn.get(tRef);
        if (!tSnap.exists()) return;
        const tData = tSnap.data() as Transaction;
        const newBruto = (tData.amount || 0) + totalAmount;
        const newDiscount = (tData.discount || 0) + (discount || 0);
        const netAdd = Math.max(0, totalAmount - (discount || 0));
        const newPaid = isPaid ? (tData.paidAmount || 0) + netAdd : (tData.paidAmount || 0);
        
        const existingFnb = tData.fnbItems || [];
        const updatedFnb = [...existingFnb];
        items.forEach(newItem => {
            const idx = updatedFnb.findIndex(it => it.id === newItem.id);
            if (idx >= 0) updatedFnb[idx].quantity += newItem.quantity;
            else updatedFnb.push(newItem);
        });

        txn.update(tRef, {
            amount: newBruto, 
            discount: newDiscount, 
            paidAmount: newPaid, 
            fnbItems: updatedFnb,
            status: (newBruto - newDiscount) > newPaid ? 'unpaid' : 'paid',
            additionalCharges: [
                ...(tData.additionalCharges || []), 
                ...items.map(i => ({ 
                    description: `FnB: ${i.name} x${i.quantity}`, 
                    amount: i.price * i.quantity, 
                    timestamp: Date.now(), 
                    isPaid 
                }))
            ]
        });
        if (activeShiftId && isPaid && netAdd > 0) txn.update(doc(db, 'shifts', activeShiftId), { totalSales: increment(netAdd), expectedBalance: increment(netAdd) });
        
        for (const i of items) {
            txn.update(doc(db, 'fnbItems', i.id), { stock: increment(-i.quantity) });
        }
    });
}

export async function addTimeToTransaction(db: Firestore, transactionId: string, stationId: string, duration: number, price: number, isPaid: boolean, discount: number, activeShiftId?: string | null, packageName?: string) {
    return await runTransaction(db, async (txn) => {
        const tRef = doc(db, 'transactions', transactionId);
        const tSnap = await txn.get(tRef);
        const sRef = doc(db, 'stations', stationId);
        const sSnap = await txn.get(sRef);
        if (!tSnap.exists() || !sSnap.exists()) return;
        const tData = tSnap.data() as Transaction;
        const sData = sSnap.data() as Station;
        let memberSnap = null;
        let memberRef = null;
        if (tData.memberId && isPaid && stationId !== 'pos' && !tData.isLoyaltyProcessed) {
            memberRef = doc(db, 'members', tData.memberId);
            memberSnap = await txn.get(memberRef);
        }
        const newBruto = (tData.amount || 0) + price;
        const newDiscount = (tData.discount || 0) + (discount || 0);
        const netAdd = Math.max(0, price - (discount || 0));
        const newPaid = isPaid ? (tData.paidAmount || 0) + netAdd : (tData.paidAmount || 0);
        
        const desc = packageName || `Sewa Tambahan ${formatDuration(duration)}`;
        
        txn.update(tRef, {
            durationMinutes: (tData.durationMinutes || 0) + duration, amount: newBruto, discount: newDiscount, paidAmount: newPaid, status: (newBruto - newDiscount) > newPaid ? 'unpaid' : 'paid',
            additionalCharges: [...(tData.additionalCharges || []), { description: desc, amount: price, timestamp: Date.now(), isPaid }]
        });
        txn.update(sRef, { end_time: (sData.end_time || Date.now()) + duration * 60000 });
        if (memberSnap && memberRef) processLoyaltyInTransaction(txn, memberSnap, tRef, memberRef);
        if (activeShiftId && isPaid && netAdd > 0) txn.update(doc(db, 'shifts', activeShiftId), { totalSales: increment(netAdd), expectedBalance: increment(netAdd) });
    });
}

export async function markTransactionAsPaid(db: Firestore, tId: string, activeShiftId?: string | null, member?: Member | null) {
    return await runTransaction(db, async (txn) => {
        const tRef = doc(db, 'transactions', tId);
        const tSnap = await txn.get(tRef);
        if (!tSnap.exists()) throw new Error("Transaksi tidak ditemukan.");
        const tData = tSnap.data() as Transaction;
        const finalMemberId = member ? member.id : tData.memberId;
        let memberSnap = null;
        let memberRef = null;
        if (finalMemberId && tData.stationId !== 'pos' && !tData.isLoyaltyProcessed) {
            memberRef = doc(db, 'members', finalMemberId);
            memberSnap = await txn.get(memberRef);
        }
        const net = Math.max(0, tData.amount - tData.discount);
        const unpaid = Math.max(0, net - tData.paidAmount);
        const finalMemberName = member ? member.name : tData.memberName;
        txn.update(tRef, { status: 'paid', paidAmount: net, memberId: finalMemberId || null, memberName: finalMemberName || null, additionalCharges: (tData.additionalCharges || []).map(c => ({ ...c, isPaid: true })) });
        if (memberSnap && memberRef) processLoyaltyInTransaction(txn, memberSnap, tRef, memberRef);
        if (activeShiftId && unpaid > 0) {
            const shiftRef = doc(db, 'shifts', activeShiftId);
            txn.update(shiftRef, { totalSales: increment(unpaid), expectedBalance: increment(unpaid) });
        }
    });
}

export async function addReservation(db: Firestore, res: any) {
    await setDoc(doc(collection(db, 'reservations')), { ...res, status: 'scheduled', createdAt: Date.now() });
}

export async function updateReservationStatus(db: Firestore, id: string, status: string) {
    await updateDoc(doc(db, 'reservations', id), { status });
}

export async function addExpense(db: Firestore, expense: any) {
    const docRef = doc(collection(db, 'expenses'));
    await setDoc(docRef, { ...expense, id: docRef.id, timestamp: Date.now() });
}

export async function deleteExpense(db: Firestore, id: string) {
    await deleteDoc(doc(db, 'expenses', id));
}

export async function updateUserRole(db: Firestore, userId: string, role: string) {
    await updateDoc(doc(db, 'users', userId), { role });
}

export async function deleteUserProfile(db: Firestore, userId: string) {
    return await deleteDoc(doc(db, 'users', userId));
}

export async function deleteAllTransactions(db: Firestore) {
    const snap = await getDocs(collection(db, 'transactions'));
    for (const d of snap.docs) await deleteDoc(d.ref);
}

export async function deleteAllExpenses(db: Firestore) {
    const snap = await getDocs(collection(db, 'expenses'));
    for (const d of snap.docs) await deleteDoc(d.ref);
}

export async function deleteAllShifts(db: Firestore) {
    const snap = await getDocs(collection(db, 'shifts'));
    for (const d of snap.docs) await deleteDoc(d.ref);
}

export async function deleteAllMembers(db: Firestore) {
    const snap = await getDocs(collection(db, 'members'));
    for (const d of snap.docs) await deleteDoc(d.ref);
}

export async function saveGeneralSettings(db: Firestore, settings: GeneralSettings) {
    await setDoc(doc(db, 'settings', 'general'), settings);
}

export async function saveLandingSettings(db: Firestore, settings: LandingSettings) {
    await setDoc(doc(db, 'settings', 'landing'), settings);
}

export async function updatePricing(db: Firestore, price: number) {
    await setDoc(doc(db, 'prices', 'default'), { perHour: price, lastUpdated: Date.now() });
}

export async function addReward(db: Firestore, reward: any) {
    const docRef = doc(collection(db, 'rewards'));
    await setDoc(docRef, { ...reward, id: docRef.id });
}

export async function updateReward(db: Firestore, id: string, updates: any) {
    await updateDoc(doc(db, 'rewards', id), updates);
}

export async function deleteReward(db: Firestore, id: string) {
  await deleteDoc(doc(db, 'rewards', id));
}

export async function redeemMemberPoints(db: Firestore, member: Member, points: number, label: string, rewardType: string) {
    return await runTransaction(db, async (txn) => {
        const mRef = doc(db, 'members', member.id);
        const mSnap = await txn.get(mRef);
        if(!mSnap.exists()) throw new Error("Member tidak ditemukan.");
        if(mSnap.data().points < points) throw new Error("Poin tidak cukup.");
        
        const now = Date.now();
        const rRef = doc(collection(db, 'redemptions'));
        
        let voucherCode = null;
        if (rewardType === 'time') {
            voucherCode = `REWARD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const vRef = doc(db, 'vouchers', voucherCode);
            let duration = 60;
            if (label.includes('2 Jam')) duration = 120;
            if (label.includes('3 Jam')) duration = 180;
            txn.set(vRef, { id: voucherCode, code: voucherCode, durationMinutes: duration, stationType: 'All', status: 'active', usesCount: 0, createdAt: now, description: `Redeem Point: ${member.name}` });
        }

        txn.update(mRef, { points: increment(-points), lastActivity: now });
        txn.set(rRef, { id: rRef.id, memberId: member.id, rewardLabel: label, pointsRedeemed: points, timestamp: now, voucherCode: voucherCode });
        return voucherCode;
    });
}
