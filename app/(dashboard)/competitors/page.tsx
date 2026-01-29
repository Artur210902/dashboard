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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Competitor {
  id: string
  name: string
  website_url: string
  price_selector: string
  name_selector: string | null
  is_active: boolean
  created_at: string
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    price_selector: '',
    name_selector: '',
    is_active: true,
  })

  useEffect(() => {
    fetchCompetitors()
  }, [])

  const fetchCompetitors = async () => {
    try {
      const response = await fetch('/api/competitors')
      if (!response.ok) throw new Error('Failed to fetch competitors')
      const data = await response.json()
      setCompetitors(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCompetitor
        ? `/api/competitors/${editingCompetitor.id}`
        : '/api/competitors'
      const method = editingCompetitor ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save competitor')
      }

      toast.success(
        editingCompetitor ? 'Конкурент обновлен' : 'Конкурент создан'
      )
      setDialogOpen(false)
      resetForm()
      fetchCompetitors()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (competitor: Competitor) => {
    setEditingCompetitor(competitor)
    setFormData({
      name: competitor.name,
      website_url: competitor.website_url,
      price_selector: competitor.price_selector,
      name_selector: competitor.name_selector || '',
      is_active: competitor.is_active,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого конкурента?')) return

    try {
      const response = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete competitor')

      toast.success('Конкурент удален')
      fetchCompetitors()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setEditingCompetitor(null)
    setFormData({
      name: '',
      website_url: '',
      price_selector: '',
      name_selector: '',
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
          <h1 className="text-3xl font-bold">Конкуренты</h1>
          <p className="text-muted-foreground">
            Управление конкурентами для отслеживания цен
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
              Добавить конкурента
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCompetitor ? 'Редактировать' : 'Добавить'} конкурента
                </DialogTitle>
                <DialogDescription>
                  Заполните информацию о конкуренте для отслеживания цен
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">URL сайта</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) =>
                      setFormData({ ...formData, website_url: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_selector">CSS селектор цены</Label>
                  <Input
                    id="price_selector"
                    value={formData.price_selector}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_selector: e.target.value,
                      })
                    }
                    placeholder=".price, #price, [data-price]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_selector">CSS селектор названия (опционально)</Label>
                  <Input
                    id="name_selector"
                    value={formData.name_selector}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name_selector: e.target.value,
                      })
                    }
                    placeholder=".product-name, h1"
                  />
                </div>
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
                  {editingCompetitor ? 'Сохранить' : 'Создать'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Селектор цены</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Нет конкурентов. Добавьте первого конкурента.
                </TableCell>
              </TableRow>
            ) : (
              competitors.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell className="font-medium">{competitor.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {competitor.website_url}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {competitor.price_selector}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        competitor.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {competitor.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(competitor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(competitor.id)}
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
    </div>
  )
}
