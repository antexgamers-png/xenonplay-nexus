
'use client';

import type { Notification, NotificationType, Shift, FnbItem, Expense, Reservation } from '@/lib/types';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from './auth-provider';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  removeNotification: (notificationId: string) => void;
  markAsRead: (notificationId: string) => void;
  unreadCount: number;
  transactionToOpen: string | null;
  triggerTransactionDetail: (transactionId: string) => void;
  clearTransactionToOpen: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactionToOpen, setTransactionToOpen] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const firestore = useFirestore();
  const { role } = useAuth();
  const { toast } = useToast();
  
  const isInitialShiftLoad = useRef(true);

  // Inisialisasi startTime hanya di client untuk menghindari Hydration Mismatch
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    setNotifications(prev => {
      const isDuplicate = prev.slice(0, 5).some(n => 
        n.type === notification.type && 
        n.message === notification.message
      );
      
      if (isDuplicate) return prev;
      return [{ ...notification, id, timestamp, isRead: false }, ...prev];
    });

    if (notification.priority === 'high' || notification.type === 'new-reservation') {
        toast({
            title: notification.stationName || "Notifikasi Baru",
            description: notification.message,
            variant: notification.priority === 'high' ? "default" : "success",
        });
    }
  }, [toast]);

  useEffect(() => {
    if (!firestore || !role || !startTime) return;

    // 1. Monitor Shift Closed
    const shiftUnsub = onSnapshot(
      query(collection(firestore, 'shifts'), orderBy('openedAt', 'desc'), limit(5)),
      (snapshot) => {
        if (isInitialShiftLoad.current) {
          isInitialShiftLoad.current = false;
          return;
        }
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const shift = change.doc.data() as Shift;
            if (shift.status === 'closed') {
              addNotification({
                type: 'shift-closed',
                priority: 'medium',
                message: `Shift ditutup oleh ${shift.openedByName}.`,
                metadata: { shiftId: shift.id }
              });
            }
          }
        });
      }
    );

    // 2. Monitor New Reservations (Hanya yang dibuat SETELAH app dibuka)
    const resQuery = query(
        collection(firestore, 'reservations'),
        where('createdAt', '>', startTime),
        orderBy('createdAt', 'desc')
    );

    const resUnsub = onSnapshot(resQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const res = change.doc.data() as Reservation;
            addNotification({
              type: 'new-reservation',
              priority: 'high',
              stationName: `Booking: ${res.customerName}`,
              message: `Pesanan masuk untuk ${res.stationName} jam ${format(res.startTime, 'HH:mm')}`,
              metadata: { resId: res.id }
            });
          }
        });
    });

    // 3. Monitor Low Stock
    const stockUnsub = onSnapshot(
      query(collection(firestore, 'fnbItems'), where('stock', '<', 5)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const item = change.doc.data() as FnbItem;
            addNotification({
              type: 'low-stock',
              priority: 'medium',
              message: `Stok kritis: ${item.name} sisa ${item.stock}!`,
              metadata: { itemId: item.id }
            });
          }
        });
      }
    );

    return () => {
      shiftUnsub();
      resUnsub();
      stockUnsub();
    };
  }, [firestore, role, startTime, addNotification]);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);
  
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  }, []);

  const triggerTransactionDetail = useCallback((transactionId: string) => {
    setTransactionToOpen(transactionId);
  }, []);

  const clearTransactionToOpen = useCallback(() => {
    setTransactionToOpen(null);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    unreadCount,
    transactionToOpen,
    triggerTransactionDetail,
    clearTransactionToOpen,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
