'use client';

import { useState, useEffect, useCallback } from 'react';
import { useShopStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Users, 
  Package, 
  History, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  Eye,
  Shield,
  Bug
} from 'lucide-react';

interface AdminUser {
  id: string;
  login: string;
  password: string;
  role: string;
  fullName: string | null;
  createdAt: string;
}

interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

interface LoginLog {
  id: string;
  userId: string;
  login: string;
  ip: string | null;
  timestamp: string;
}

interface VisorLog {
  id: string;
  userId: string;
  login: string;
  timestamp: string;
}

interface BugData {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryLabel: string;
  howToFind: string;
  severity: string;
}

interface UserBugData {
  bugId: string;
  enabled: boolean;
  found: boolean;
}

interface UserWithBugs {
  id: string;
  login: string;
  role: string;
  userBugs: UserBugData[];
}

export function AdminView() {
  const { user, popupDuration, setPopupDuration } = useShopStore();
  const [isLoading, setIsLoading] = useState(true);
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [visorLogs, setVisorLogs] = useState<VisorLog[]>([]);
  
  const [newUserLogin, setNewUserLogin] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Student');
  const [newUserFullName, setNewUserFullName] = useState('');
  
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  
  const [editProductDialog, setEditProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  
  const [popupDurationValue, setPopupDurationValue] = useState('1');
  const [popupSuccessValue, setPopupSuccessValue] = useState('2');
  const [popupErrorValue, setPopupErrorValue] = useState('3');
  const [popupWarningValue, setPopupWarningValue] = useState('2.5');
  const [popupInfoValue, setPopupInfoValue] = useState('1.5');
  
  // Состояние для багов
  const [bugs, setBugs] = useState<BugData[]>([]);
  const [usersWithBugs, setUsersWithBugs] = useState<UserWithBugs[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin', {
        headers: { 'x-admin-token': user?.id || '' },
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setProducts(data.products || []);
        setLoginLogs(data.loginLogs || []);
        setVisorLogs(data.visorLogs || []);
        if (data.settings) {
          setPopupDurationValue(data.settings.popupDuration?.toString() || '1');
          setPopupSuccessValue(data.settings.popupSuccessDuration?.toString() || '2');
          setPopupErrorValue(data.settings.popupErrorDuration?.toString() || '3');
          setPopupWarningValue(data.settings.popupWarningDuration?.toString() || '2.5');
          setPopupInfoValue(data.settings.popupInfoDuration?.toString() || '1.5');
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchBugs = useCallback(async () => {
    try {
      const res = await fetch('/api/bugs', {
        headers: { 'x-admin-token': user?.id || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setBugs(data.bugs || []);
        setUsersWithBugs(data.users || []);
      }
    } catch (error) {
      console.error('Fetch bugs error:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    fetchBugs();
  }, [fetchData, fetchBugs]);

  const toggleBug = async (bugId: string, currentEnabled: boolean) => {
    if (!selectedUserId) return;
    try {
      const res = await fetch('/api/bugs', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': user?.id || '',
        },
        body: JSON.stringify({
          action: 'toggle_user_bug',
          data: { userId: selectedUserId, bugId, enabled: !currentEnabled },
        }),
      });
      if (res.ok) {
        toast.success(`Баг ${!currentEnabled ? 'включён' : 'выключен'}`);
        fetchBugs();
      }
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const toggleAllBugs = async (enabled: boolean) => {
    if (!selectedUserId) return;
    try {
      const res = await fetch('/api/bugs', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': user?.id || '',
        },
        body: JSON.stringify({
          action: 'toggle_all_bugs_for_user',
          data: { userId: selectedUserId, enabled },
        }),
      });
      if (res.ok) {
        toast.success(`Все баги ${enabled ? 'включены' : 'выключены'}`);
        fetchBugs();
      }
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const toggleFound = async (bugId: string, currentFound: boolean) => {
    if (!selectedUserId) return;
    try {
      const res = await fetch('/api/bugs', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': user?.id || '',
        },
        body: JSON.stringify({
          action: 'toggle_found',
          data: { userId: selectedUserId, bugId, found: !currentFound },
        }),
      });
      if (res.ok) {
        toast.success(!currentFound ? 'Баг отмечен как найденный' : 'Метка снята');
        fetchBugs();
      }
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const createUser = async () => {
    if (!newUserLogin || !newUserPassword) {
      toast.error('Укажите логин и пароль');
      return;
    }

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          data: {
            login: newUserLogin,
            password: newUserPassword,
            role: newUserRole,
            fullName: newUserFullName,
          },
        }),
      });

      if (res.ok) {
        toast.success('Пользователь создан');
        fetchData();
        setNewUserLogin('');
        setNewUserPassword('');
        setNewUserFullName('');
      } else {
        toast.error('Ошибка создания');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    }
  };

  const deleteUser = async (id: string, login: string) => {
    try {
      await fetch(`/api/admin?action=delete_user&id=${id}`, { method: 'DELETE' });
      toast.success(`Пользователь "${login}" удалён`);
      fetchData();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const createProduct = async () => {
    if (!newProductName || !newProductCategory || !newProductPrice || !newProductStock) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_product',
          data: {
            name: newProductName,
            category: newProductCategory,
            price: parseFloat(newProductPrice),
            stock: parseInt(newProductStock),
            imageUrl: newProductImageUrl || null,
          },
        }),
      });

      if (res.ok) {
        toast.success('Товар создан');
        fetchData();
        setNewProductName('');
        setNewProductCategory('');
        setNewProductPrice('');
        setNewProductStock('');
        setNewProductImageUrl('');
      }
    } catch (error) {
      toast.error('Ошибка создания');
    }
  };

  const openEditProduct = (product: AdminProduct) => {
    setEditingProduct({ ...product });
    setEditProductDialog(true);
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_product',
          data: {
            id: editingProduct.id,
            name: editingProduct.name,
            category: editingProduct.category,
            price: editingProduct.price,
            stock: editingProduct.stock,
            imageUrl: editingProduct.imageUrl,
          },
        }),
      });

      if (res.ok) {
        toast.success('Товар обновлён');
        setEditProductDialog(false);
        setEditingProduct(null);
        fetchData();
      }
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    try {
      await fetch(`/api/admin?action=delete_product&id=${id}`, { method: 'DELETE' });
      toast.success(`Товар "${name}" удалён`);
      fetchData();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupDuration: parseFloat(popupDurationValue),
          popupSuccessDuration: parseFloat(popupSuccessValue),
          popupErrorDuration: parseFloat(popupErrorValue),
          popupWarningDuration: parseFloat(popupWarningValue),
          popupInfoDuration: parseFloat(popupInfoValue),
        }),
      });

      if (res.ok) {
        setPopupDuration(parseFloat(popupDurationValue));
        toast.success('Настройки сохранены');
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Shield className="w-8 h-8 text-red-500" />
        Панель администратора
      </h1>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800 mb-4 flex-wrap">
          <TabsTrigger value="users" className="data-[state=active]:bg-red-600 data-[state=inactive]:text-white">
            <Users className="w-4 h-4 mr-2" />Пользователи
          </TabsTrigger>
          <TabsTrigger value="bugs" className="data-[state=active]:bg-red-600 data-[state=inactive]:text-white">
            <Bug className="w-4 h-4 mr-2" />Баги
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-red-600 data-[state=inactive]:text-white">
            <Package className="w-4 h-4 mr-2" />Товары
          </TabsTrigger>
          <TabsTrigger value="login-logs" className="data-[state=active]:bg-red-600 data-[state=inactive]:text-white">
            <History className="w-4 h-4 mr-2" />Лог входов
          </TabsTrigger>
          <TabsTrigger value="visor-logs" className="data-[state=active]:bg-red-600 data-[state=inactive]:text-white">
            <Eye className="w-4 h-4 mr-2" />Пасхалки
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-red-600 data-[state=inactive]:text-white">
            <Settings className="w-4 h-4 mr-2" />Настройки
          </TabsTrigger>
        </TabsList>

        {/* Пользователи */}
        <TabsContent value="users">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Управление пользователями</CardTitle>
            </CardHeader>
            <CardContent>
              <Card className="bg-gray-800 border-gray-700 mb-6">
                <CardHeader><CardTitle className="text-white text-lg">Новый пользователь</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300">Логин</Label>
                      <Input value={newUserLogin} onChange={(e) => setNewUserLogin(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div>
                      <Label className="text-gray-300">Пароль</Label>
                      <Input value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div>
                      <Label className="text-gray-300">ФИО</Label>
                      <Input value={newUserFullName} onChange={(e) => setNewUserFullName(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div>
                      <Label className="text-gray-300">Роль</Label>
                      <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2">
                        <option value="Student">Student</option>
                        <option value="Visor">Visor</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={createUser} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Создать</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-white font-medium">{u.login}</p>
                          <p className="text-gray-400 text-sm">{u.fullName || '—'}</p>
                        </div>
                        <Badge className={u.role === 'Visor' ? 'bg-purple-600' : 'bg-emerald-600'}>{u.role}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-gray-800">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Удалить пользователя?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">Вы уверены? Это действие нельзя отменить.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-800 text-white border-gray-700">Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteUser(u.id, u.login)} className="bg-red-600 hover:bg-red-700">Удалить</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Баги */}
        <TabsContent value="bugs">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bug className="w-5 h-5 text-orange-500" />
                Управление багами
              </CardTitle>
              <CardDescription className="text-gray-400">
                Включите или выключите баги для выбранного пользователя
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label className="text-gray-300 mb-2 block">Пользователь</Label>
                <select 
                  value={selectedUserId} 
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-gray-800 border-gray-700 text-white rounded-md px-4 py-2"
                >
                  <option value="">— Выберите —</option>
                  {usersWithBugs.map(u => (
                    <option key={u.id} value={u.id}>{u.login} ({u.role})</option>
                  ))}
                </select>
              </div>

              {selectedUserId && (
                <>
                  <div className="flex gap-2 mb-4">
                    <Button onClick={() => toggleAllBugs(true)} variant="outline" size="sm" className="border-green-600 text-green-400">Включить все</Button>
                    <Button onClick={() => toggleAllBugs(false)} variant="outline" size="sm" className="border-red-600 text-red-400">Выключить все</Button>
                  </div>

                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {bugs.map(bug => {
                        const userBug = usersWithBugs.find(u => u.id === selectedUserId)?.userBugs.find(ub => ub.bugId === bug.id);
                        const enabled = userBug?.enabled ?? bug.defaultEnabled ?? true;
                        const found = userBug?.found ?? false;
                        
                        return (
                          <div key={bug.id} className="bg-gray-800 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-white font-medium">{bug.name}</p>
                                  <Badge className={enabled ? 'bg-green-600' : 'bg-gray-600'}>{enabled ? 'ON' : 'OFF'}</Badge>
                                  <Badge className="text-xs">{bug.categoryLabel}</Badge>
                                </div>
                                <p className="text-gray-400 text-sm">{bug.description}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1 cursor-pointer" title="Студент нашёл баг">
                                  <Checkbox 
                                    checked={found} 
                                    onCheckedChange={() => toggleFound(bug.id, found)}
                                    className="border-yellow-500 data-[state=checked]:bg-yellow-500"
                                  />
                                  <span className="text-xs text-yellow-500">🔍</span>
                                </label>
                                <button
                                  onClick={() => toggleBug(bug.id, enabled)}
                                  className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-green-600' : 'bg-gray-600'}`}
                                >
                                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </>
              )}

              {!selectedUserId && (
                <p className="text-gray-500 text-center py-8">Выберите пользователя</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Товары */}
        <TabsContent value="products">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader><CardTitle className="text-white">Управление товарами</CardTitle></CardHeader>
            <CardContent>
              <Card className="bg-gray-800 border-gray-700 mb-6">
                <CardHeader><CardTitle className="text-white text-lg">Новый товар</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><Label className="text-gray-300">Название</Label><Input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} className="bg-gray-700 border-gray-600 text-white" /></div>
                    <div><Label className="text-gray-300">Категория</Label><Input value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} className="bg-gray-700 border-gray-600 text-white" /></div>
                    <div><Label className="text-gray-300">Цена (₽)</Label><Input type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} className="bg-gray-700 border-gray-600 text-white" /></div>
                    <div><Label className="text-gray-300">Остаток</Label><Input type="number" value={newProductStock} onChange={(e) => setNewProductStock(e.target.value)} className="bg-gray-700 border-gray-600 text-white" /></div>
                    <div><Label className="text-gray-300">URL фото</Label><Input value={newProductImageUrl} onChange={(e) => setNewProductImageUrl(e.target.value)} className="bg-gray-700 border-gray-600 text-white" /></div>
                    <div className="flex items-end"><Button onClick={createProduct} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Создать</Button></div>
                  </div>
                </CardContent>
              </Card>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl || `https://via.placeholder.com/40?text=${p.name[0]}`} alt={p.name} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="text-white font-medium">{p.name}</p>
                          <p className="text-gray-400 text-sm">{p.category}</p>
                        </div>
                        <Badge className="bg-emerald-600">{new Intl.NumberFormat('ru-RU').format(p.price)} ₽</Badge>
                        <Badge className="bg-gray-600">Остаток: {p.stock}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => openEditProduct(p)} variant="outline" size="sm" className="border-gray-600 text-blue-400 hover:bg-blue-600/20"><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-gray-800">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Удалить товар?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">Удалить <strong className="text-white">{p.name}</strong>?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-800 text-white border-gray-700">Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProduct(p.id, p.name)} className="bg-red-600 hover:bg-red-700">Удалить</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Лог входов */}
        <TabsContent value="login-logs">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader><CardTitle className="text-white">Лог входов</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {loginLogs.length === 0 ? <p className="text-gray-500 text-center py-8">Нет записей</p> : loginLogs.map((log) => (
                    <div key={log.id} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                      <div><p className="text-white font-medium">{log.login}</p><p className="text-gray-400 text-sm">IP: {log.ip || 'unknown'}</p></div>
                      <span className="text-gray-400 text-sm">{formatDate(log.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Пасхалки */}
        <TabsContent value="visor-logs">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Eye className="w-5 h-5 text-purple-500" />Лог повышения прав</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {visorLogs.length === 0 ? <p className="text-gray-500 text-center py-8">Нет записей</p> : visorLogs.map((log) => (
                    <div key={log.id} className="bg-gradient-to-r from-purple-900/50 to-red-900/50 p-3 rounded-lg border border-purple-700/50">
                      <div className="flex items-center justify-between">
                        <div><p className="text-white font-medium">{log.login}</p><p className="text-purple-300 text-sm">Повышение прав до Visor</p></div>
                        <span className="text-gray-400 text-sm">{formatDate(log.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки */}
        <TabsContent value="settings">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Настройки PopUp уведомлений</CardTitle>
              <CardDescription className="text-gray-400">
                Настройте время показа уведомлений для каждого типа (в секундах)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Успешные операции */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <Label className="text-gray-300 font-medium">Успешные операции</Label>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">Зелёные уведомления (успешный логин, добавление в корзину и т.д.)</p>
                  <div className="flex items-center gap-4">
                    <Input type="number" step="0.5" value={popupSuccessValue} onChange={(e) => setPopupSuccessValue(e.target.value)} className="bg-gray-700 border-gray-600 text-white w-24" />
                    <span className="text-gray-400">секунд</span>
                  </div>
                </div>

                {/* Ошибки */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <Label className="text-gray-300 font-medium">Ошибки</Label>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">Красные уведомления (ошибки авторизации, оплаты и т.д.)</p>
                  <div className="flex items-center gap-4">
                    <Input type="number" step="0.5" value={popupErrorValue} onChange={(e) => setPopupErrorValue(e.target.value)} className="bg-gray-700 border-gray-600 text-white w-24" />
                    <span className="text-gray-400">секунд</span>
                  </div>
                </div>

                {/* Предупреждения */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <Label className="text-gray-300 font-medium">Предупреждения</Label>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">Жёлтые уведомления (низкий баланс, предупреждения)</p>
                  <div className="flex items-center gap-4">
                    <Input type="number" step="0.5" value={popupWarningValue} onChange={(e) => setPopupWarningValue(e.target.value)} className="bg-gray-700 border-gray-600 text-white w-24" />
                    <span className="text-gray-400">секунд</span>
                  </div>
                </div>

                {/* Информационные */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <Label className="text-gray-300 font-medium">Информационные</Label>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">Синие уведомления (информация, подсказки)</p>
                  <div className="flex items-center gap-4">
                    <Input type="number" step="0.5" value={popupInfoValue} onChange={(e) => setPopupInfoValue(e.target.value)} className="bg-gray-700 border-gray-600 text-white w-24" />
                    <span className="text-gray-400">секунд</span>
                  </div>
                </div>
              </div>
              <Button onClick={saveSettings} className="bg-emerald-600 hover:bg-emerald-700 mt-6"><Save className="w-4 h-4 mr-2" />Сохранить настройки</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог редактирования товара */}
      <Dialog open={editProductDialog} onOpenChange={setEditProductDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Редактирование товара</DialogTitle></DialogHeader>
          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label className="text-gray-300">Название</Label><Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="bg-gray-800 border-gray-700 text-white" /></div>
              <div className="space-y-2"><Label className="text-gray-300">Категория</Label><Input value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="bg-gray-800 border-gray-700 text-white" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-gray-300">Цена (₽)</Label><Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} className="bg-gray-800 border-gray-700 text-white" /></div>
                <div className="space-y-2"><Label className="text-gray-300">Остаток</Label><Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} className="bg-gray-800 border-gray-700 text-white" /></div>
              </div>
              <div className="space-y-2"><Label className="text-gray-300">URL фото</Label><Input value={editingProduct.imageUrl || ''} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} className="bg-gray-800 border-gray-700 text-white" /></div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEditProductDialog(false)} variant="outline" className="border-gray-600 text-gray-300">Отмена</Button>
            <Button onClick={saveProduct} className="bg-emerald-600 hover:bg-emerald-700"><Save className="w-4 h-4 mr-2" />Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
