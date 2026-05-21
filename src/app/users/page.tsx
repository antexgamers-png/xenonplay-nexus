'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    UserCog, 
    Mail, 
    ShieldCheck, 
    UserCircle,
    RefreshCw,
    UserPlus,
    Lock,
    Info,
    ShieldAlert,
    LogOut,
    Clock,
    Pencil,
    Trash2,
    Save
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { updateUserRole, deleteUserProfile } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/provider';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogClose,
    DialogDescription
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth as getFirebaseAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { role, isRoleLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form Edit Display Name
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Form Tambah Staff
  const [newStaff, setNewStaff] = useState({
      displayName: '',
      email: '',
      password: ''
  });

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || role !== 'admin') return null;
    return query(collection(firestore, 'users'), orderBy('email', 'asc'));
  }, [firestore, isAuthLoading, role]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!firestore || userId === currentUser?.uid) {
        toast({ title: "Aksi Ditolak", description: "Anda tidak bisa mengubah peran Anda sendiri.", variant: "destructive" });
        return;
    }

    setIsUpdatingId(userId);
    try {
      await updateUserRole(firestore, userId, newRole);
      toast({ title: "Berhasil", description: "Hak akses staff telah diperbarui.", variant: "success" });
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!firestore || !editingUser || !newDisplayName.trim()) return;
      
      setIsEditingName(true);
      try {
          await updateDoc(doc(firestore, 'users', editingUser.id), {
              displayName: newDisplayName.trim()
          });
          toast({ title: "Berhasil", description: "Nama operator diperbarui.", variant: "success" });
          setEditingUser(null);
      } catch (err: any) {
          toast({ title: "Gagal Update", description: err.message, variant: "destructive" });
      } finally {
          setIsEditingName(false);
      }
  };

  const handleDeleteUser = async (userId: string) => {
      if (!firestore || userId === currentUser?.uid) return;
      try {
          await deleteUserProfile(firestore, userId);
          toast({ title: "Berhasil", description: "Profil pengguna dihapus dari sistem.", variant: "success" });
      } catch (err: any) {
          toast({ title: "Gagal Menghapus", description: err.message, variant: "destructive" });
      }
  };

  const handleForceLogout = async (userId: string) => {
      if (!firestore) return;
      try {
          // Merusak Session ID di DB untuk memicu logout otomatis di sisi client target
          const userDocRef = doc(firestore, 'users', userId);
          await updateDoc(userDocRef, {
              currentSessionId: 'FORCED_LOGOUT_' + Date.now()
          });
          toast({ title: "Instruksi Terkirim", description: "Sesi pengguna telah diputuskan secara paksa.", variant: "success" });
      } catch (err: any) {
          toast({ title: "Gagal Putuskan Sesi", description: err.message, variant: "destructive" });
      }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!firestore) return;
      
      setIsCreating(true);
      const tempAppName = `temp-app-${Date.now()}`;
      const tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getFirebaseAuth(tempApp);

      try {
          const userCredential = await createUserWithEmailAndPassword(tempAuth, newStaff.email, newStaff.password);
          if (newStaff.displayName) {
              await updateProfile(userCredential.user, { displayName: newStaff.displayName });
          }

          const userDocRef = doc(firestore, 'users', userCredential.user.uid);
          const newUserDoc: UserProfile = {
              id: userCredential.user.uid,
              email: newStaff.email,
              role: 'staff',
              displayName: newStaff.displayName || newStaff.email.split('@')[0],
              createdAt: Date.now(),
              lastLogin: Date.now()
          };
          
          await setDoc(userDocRef, newUserDoc);
          toast({ title: "Staff Berhasil Ditambahkan", description: `Akun ${newStaff.displayName || newStaff.email} siap digunakan.`, variant: "success" });
          setIsAddDialogOpen(false);
          setNewStaff({ displayName: '', email: '', password: '' });
      } catch (error: any) {
          toast({ title: "Gagal Membuat Akun", description: error.message, variant: "destructive" });
      } finally {
          await deleteApp(tempApp);
          setIsCreating(false);
      }
  };

  if (!isAuthLoading && role !== 'admin') {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="size-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black uppercase">Akses Terbatas</h2>
            <p className="text-muted-foreground max-w-sm">Halaman ini hanya dapat diakses oleh Administrator Sistem.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Staff</h1>
            <p className="text-muted-foreground mt-1">Kelola daftar akun, peran, dan kontrol sesi login operator.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="font-bold gap-2 rounded-xl shadow-lg shadow-primary/20">
            <UserPlus className="h-4 w-4" /> Tambah Staff Baru
        </Button>
      </header>

      <Card className="bg-card border-border shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="bg-muted/20 border-b border-border">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <UserCog className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
                    <CardDescription className="text-xs">Status sesi real-time dan kendali akses operator.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Operator / Profil</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Hak Akses</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Login Terakhir</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-right">Tindakan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [1,2,3].map(i => (
                            <TableRow key={i}>
                                <TableCell colSpan={4}><Skeleton className="h-12 w-full" /></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        users?.map(u => (
                            <TableRow key={u.id} className="border-border">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center relative group">
                                            <UserCircle className="h-6 w-6 text-muted-foreground opacity-40" />
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute inset-0 size-full opacity-0 group-hover:opacity-100 bg-background/80 transition-opacity rounded-xl"
                                                onClick={() => { setEditingUser(u); setNewDisplayName(u.displayName || ''); }}
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm uppercase tracking-tight">{u.displayName || 'Staff'}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Mail className="h-2.5 w-2.5" /> {u.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn("text-[9px] font-black uppercase border-none", u.role === 'admin' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                                            {u.role}
                                        </Badge>
                                        {u.id === currentUser?.uid && (
                                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">(Profil Anda)</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="size-3 text-muted-foreground" />
                                            <span className="text-xs font-medium">
                                                {u.lastLogin ? format(u.lastLogin, 'dd MMM, HH:mm', { locale: idLocale }) : 'Belum Pernah'}
                                            </span>
                                        </div>
                                        {u.lastLogin && Date.now() - u.lastLogin < 2 * 60 * 60 * 1000 && (
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Sesi Sedang Aktif</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-3">
                                        <Select 
                                            defaultValue={u.role} 
                                            onValueChange={(val: UserRole) => handleRoleChange(u.id, val)}
                                            disabled={isUpdatingId === u.id || u.id === currentUser?.uid}
                                        >
                                            <SelectTrigger className="w-[110px] h-8 bg-background border-border text-[10px] font-bold uppercase">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="staff" className="text-xs uppercase font-bold">Staff</SelectItem>
                                                <SelectItem value="admin" className="text-xs uppercase font-bold">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        
                                        <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className={cn("h-7 w-7 text-muted-foreground hover:text-red-500 transition-colors", u.id === currentUser?.uid && "opacity-0 pointer-events-none")}
                                                        title="Putuskan Sesi Jarak Jauh"
                                                    >
                                                        <LogOut className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-xl font-black uppercase flex items-center gap-2">
                                                            <LogOut className="h-5 w-5 text-red-500" /> Putuskan Sesi?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-sm">
                                                            Perangkat yang saat ini digunakan oleh <b>{u.displayName || u.email}</b> akan langsung otomatis Logout secara real-time.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="font-bold">Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleForceLogout(u.id)} className="bg-red-600 hover:bg-red-700 font-bold uppercase text-[10px] tracking-widest">Ya, Logout Paksa</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className={cn("h-7 w-7 text-muted-foreground hover:text-red-600 transition-colors", u.id === currentUser?.uid && "opacity-0 pointer-events-none")}
                                                        title="Hapus Pengguna Selamanya"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-red-600 flex items-center gap-2 font-black uppercase">
                                                            <ShieldAlert className="size-5" /> Hapus Pengguna
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-sm">
                                                            Anda akan menghapus profil <b>{u.displayName || u.email}</b> secara permanen. Tindakan ini tidak dapat dibatalkan.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="font-bold">Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteUser(u.id)} className="bg-red-600 hover:bg-red-700 font-bold uppercase text-[10px] tracking-widest">Hapus Permanen</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="font-black uppercase tracking-tight">Kedaulatan Sesi (Enterprise)</h3>
              </div>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                  <li className="flex items-start gap-2">
                      <div className="size-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <p><b>Single Device Enforcement:</b> Pengguna akan otomatis di-logout dari HP jika mereka login di Laptop baru.</p>
                  </li>
                  <li className="flex items-start gap-2">
                      <div className="size-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <p><b>Remote Kill:</b> Admin berhak mematikan sesi staff mana pun secara instan dari panel ini.</p>
                  </li>
              </ul>
          </div>

          <div className="bg-muted/30 border border-border p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                  <Info className="h-5 w-5" />
                  <h3 className="font-black uppercase tracking-tight">Informasi Audit</h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Menghapus pengguna hanya menghapus profil metadata di database. Akun email tetap ada di sistem Auth utama (Firebase Console) untuk keamanan riwayat audit transaksi masa lalu.
              </p>
          </div>
      </div>

      {/* DIALOG EDIT DISPLAY NAME */}
      <Dialog open={!!editingUser} onOpenChange={(val) => !val && setEditingUser(null)}>
          <DialogContent className="max-w-sm rounded-2xl">
              <DialogHeader>
                  <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                      <Pencil className="h-4 w-4 text-primary" />
                      Ubah Identitas Operator
                  </DialogTitle>
                  <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">
                      Target: {editingUser?.email}
                  </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleUpdateName} className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Tampilan Baru</Label>
                      <Input 
                        placeholder="Contoh: Staff Malam"
                        required
                        className="rounded-xl bg-muted/50 font-bold"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        disabled={isEditingName}
                        autoFocus
                      />
                  </div>

                  <DialogFooter className="pt-4 border-t border-border mt-2">
                      <DialogClose asChild>
                          <Button type="button" variant="outline" className="rounded-xl">Batal</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isEditingName || !newDisplayName.trim()} className="font-bold gap-2 rounded-xl">
                          {isEditingName ? <RefreshCw className="size-3 animate-spin" /> : <Save className="size-3" />}
                          Simpan Perubahan
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

      {/* DIALOG ADD STAFF */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Registrasi Operator Baru
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                      Buat akun operator baru dengan hak akses 'Staff' secara langsung.
                  </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateStaff} className="space-y-5 py-4">
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase ml-1">Nama Lengkap Operator</Label>
                      <Input 
                        placeholder="Contoh: Budi Santoso"
                        required
                        className="rounded-xl"
                        value={newStaff.displayName}
                        onChange={(e) => setNewStaff({...newStaff, displayName: e.target.value})}
                        disabled={isCreating}
                      />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase ml-1">Email (ID Login)</Label>
                      <Input 
                        type="email"
                        placeholder="operator@xenonplay.com"
                        required
                        className="rounded-xl font-mono"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        disabled={isCreating}
                      />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase ml-1">Password Sementara</Label>
                      <div className="relative">
                        <Input 
                            type="password"
                            placeholder="Minimal 6 karakter"
                            required
                            className="pl-10 rounded-xl"
                            value={newStaff.password}
                            onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                            disabled={isCreating}
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-30" />
                      </div>
                  </div>

                  <DialogFooter className="pt-6 border-t border-border mt-4">
                      <DialogClose asChild>
                          <Button type="button" variant="outline" className="rounded-xl">Batal</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isCreating} className="font-black uppercase tracking-widest rounded-xl px-8 shadow-lg shadow-primary/20">
                          {isCreating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Daftarkan Staff
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
