'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Alert {
  id: string
  product_id: string | null
  competitor_id: string | null
  alert_type: 'price_drop' | 'price_increase' | 'target_reached'
  threshold: number | null
  is_active: boolean
  product: { name: string } | null
  competitor: { name: string } | null
}

interface AlertLog {
  id: string
  message: string
  sent_at: string
  alert_id: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [competitors, setCompetitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [formData, setFormData] = useState({
    product_id: '',
    competitor_id: '',
    alert_type: 'price_drop' as 'price_drop' | 'price_increase' | 'target_reached',
    threshold: '',
    is_active: true,
  })

  useEffect(() => {
    fetchAlerts()
    fetchProducts()
    fetchCompetitors()
    fetchAlertLogs()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchCompetitors = async () => {
    try {
      const response = await fetch('/api/competitors')
      if (response.ok) {
        const data = await response.json()
        setCompetitors(data)
      }
    } catch (error) {
      console.error('Failed to fetch competitors:', error)
    }
  }

  const fetchAlertLogs = async () => {
    try {
      const response = await fetch('/api/alerts/logs')
      if (response.ok) {
        const data = await response.json()
        setAlertLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch alert logs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAlert
        ? `/api/alerts/${editingAlert.id}`
        : '/api/alerts'
      const method = editingAlert ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          product_id: formData.product_id || null,
          competitor_id: formData.competitor_id || null,
          threshold: formData.threshold || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save alert')
      }

      toast.success(editingAlert ? 'Алерт обновлен' : 'Алерт создан')
      setDialogOpen(false)
      resetForm()
      fetchAlerts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert)
    setFormData({
      product_id: alert.product_id || '',
      competitor_id: alert.competitor_id || '',
      alert_type: alert.alert_type,
      threshold: alert.threshold?.toString() || '',
      is_active: alert.is_active,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот алерт?')) return

    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete alert')

      toast.success('Алерт удален')
      fetchAlerts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleToggle = async (alert: Alert) => {
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !alert.is_active }),
      })

      if (!response.ok) throw new Error('Failed to update alert')

      toast.success(`Алерт ${!alert.is_active ? 'активирован' : 'деактивирован'}`)
      fetchAlerts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setEditingAlert(null)
    setFormData({
      product_id: '',
      competitor_id: '',
      alert_type: 'price_drop',
      threshold: '',
      is_active: true,
    })
  }

  if (loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Алерты</h1>
          <p className="text-muted-foreground">
            Настройка уведомлений об изменении цен
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить алерт
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingAlert ? 'Редактировать' : 'Добавить'} алерт
                </DialogTitle>
                <DialogDescription>
                  Настройте условия для получения уведомлений
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="alert_type">Тип алерта</Label>
                  <Select
                    value={formData.alert_type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, alert_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_drop">Падение цены</SelectItem>
                      <SelectItem value="price_increase">Рост цены</SelectItem>
                      <SelectItem value="target_reached">
                        Достижение целевой цены
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_id">Продукт (опционально)</Label>
                  <Select
                    value={formData.product_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все продукты" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все продукты</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competitor_id">
                    Конкурент (опционально)
                  </Label>
                  <Select
                    value={formData.competitor_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, competitor_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все конкуренты" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все конкуренты</SelectItem>
                      {competitors.map((competitor) => (
                        <SelectItem key={competitor.id} value={competitor.id}>
                          {competitor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(formData.alert_type === 'price_drop' ||
                  formData.alert_type === 'price_increase') && (
                  <div className="space-y-2">
                    <Label htmlFor="threshold">
                      Порог изменения (%)
                    </Label>
                    <Input
                      id="threshold"
                      type="number"
                      step="0.1"
                      value={formData.threshold}
                      onChange={(e) =>
                        setFormData({ ...formData, threshold: e.target.value })
                      }
                      placeholder="Оставьте пустым для любого изменения"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    resetForm()
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit">
                  {editingAlert ? 'Сохранить' : 'Создать'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Алерты</TabsTrigger>
          <TabsTrigger value="logs">История уведомлений</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тип</TableHead>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Конкурент</TableHead>
                  <TableHead>Порог</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Нет алертов. Создайте первый алерт.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        {alert.alert_type === 'price_drop'
                          ? 'Падение цены'
                          : alert.alert_type === 'price_increase'
                          ? 'Рост цены'
                          : 'Целевая цена'}
                      </TableCell>
                      <TableCell>
                        {alert.product?.name || 'Все продукты'}
                      </TableCell>
                      <TableCell>
                        {alert.competitor?.name || 'Все конкуренты'}
                      </TableCell>
                      <TableCell>
                        {alert.threshold
                          ? `${alert.threshold}%`
                          : 'Любое изменение'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(alert)}
                        >
                          {alert.is_active ? (
                            <span className="text-green-600">Активен</span>
                          ) : (
                            <span className="text-gray-400">Неактивен</span>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(alert)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(alert.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Сообщение</TableHead>
                  <TableHead>Отправлено</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground"
                    >
                      Нет истории уведомлений
                    </TableCell>
                  </TableRow>
                ) : (
                  alertLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>
                        {new Date(log.sent_at).toLocaleString('ru-RU')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
