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
import { Plus, Pencil, Trash2, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  sku: string | null
  target_price: number | null
  created_at: string
}

interface Competitor {
  id: string
  name: string
  website_url: string
}

interface ProductCompetitor {
  id: string
  product_id: string
  competitor_id: string
  product_url: string
  competitor: Competitor
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productCompetitors, setProductCompetitors] = useState<
    ProductCompetitor[]
  >([])
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    target_price: '',
  })
  const [linkFormData, setLinkFormData] = useState({
    competitor_id: '',
    product_url: '',
  })

  useEffect(() => {
    fetchProducts()
    fetchCompetitors()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompetitors = async () => {
    try {
      const response = await fetch('/api/competitors')
      if (!response.ok) throw new Error('Failed to fetch competitors')
      const data = await response.json()
      setCompetitors(data)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const fetchProductCompetitors = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/competitors`)
      if (!response.ok) throw new Error('Failed to fetch product competitors')
      const data = await response.json()
      setProductCompetitors(data)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = selectedProduct
        ? `/api/products/${selectedProduct.id}`
        : '/api/products'
      const method = selectedProduct ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          target_price: formData.target_price || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save product')
      }

      toast.success(selectedProduct ? 'Продукт обновлен' : 'Продукт создан')
      setDialogOpen(false)
      resetForm()
      fetchProducts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    try {
      const response = await fetch(
        `/api/products/${selectedProduct.id}/competitors`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkFormData),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to link competitor')
      }

      toast.success('Конкурент привязан к продукту')
      setLinkDialogOpen(false)
      setLinkFormData({ competitor_id: '', product_url: '' })
      fetchProductCompetitors(selectedProduct.id)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku || '',
      target_price: product.target_price?.toString() || '',
    })
    setDialogOpen(true)
  }

  const handleLink = async (product: Product) => {
    setSelectedProduct(product)
    await fetchProductCompetitors(product.id)
    setLinkDialogOpen(true)
  }

  const handleUnlink = async (productId: string, competitorId: string) => {
    if (!confirm('Удалить связь с конкурентом?')) return

    try {
      const response = await fetch(
        `/api/products/${productId}/competitors?competitor_id=${competitorId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) throw new Error('Failed to unlink competitor')

      toast.success('Связь удалена')
      fetchProductCompetitors(productId)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот продукт?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete product')

      toast.success('Продукт удален')
      fetchProducts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setSelectedProduct(null)
    setFormData({
      name: '',
      sku: '',
      target_price: '',
    })
  }

  if (loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Продукты</h1>
          <p className="text-muted-foreground">
            Управление продуктами для отслеживания цен
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
              Добавить продукт
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {selectedProduct ? 'Редактировать' : 'Добавить'} продукт
                </DialogTitle>
                <DialogDescription>
                  Заполните информацию о продукте
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
                  <Label htmlFor="sku">SKU (опционально)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_price">Целевая цена (€)</Label>
                  <Input
                    id="target_price"
                    type="number"
                    step="0.01"
                    value={formData.target_price}
                    onChange={(e) =>
                      setFormData({ ...formData, target_price: e.target.value })
                    }
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
                  {selectedProduct ? 'Сохранить' : 'Создать'}
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
              <TableHead>SKU</TableHead>
              <TableHead>Целевая цена</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  Нет продуктов. Добавьте первый продукт.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || '-'}</TableCell>
                  <TableCell>
                    {product.target_price
                      ? `€${product.target_price.toFixed(2)}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLink(product)}
                        title="Привязать конкурента"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
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

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Привязать конкурентов к продукту</DialogTitle>
            <DialogDescription>
              Свяжите продукт с конкурентами для отслеживания цен
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="competitor_id">Конкурент</Label>
                <Select
                  value={linkFormData.competitor_id}
                  onValueChange={(value) =>
                    setLinkFormData({ ...linkFormData, competitor_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите конкурента" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitors.map((competitor) => (
                      <SelectItem key={competitor.id} value={competitor.id}>
                        {competitor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_url">URL продукта у конкурента</Label>
                <Input
                  id="product_url"
                  type="url"
                  value={linkFormData.product_url}
                  onChange={(e) =>
                    setLinkFormData({
                      ...linkFormData,
                      product_url: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <Button type="submit">Привязать</Button>
            </form>

            <div className="mt-6 space-y-2">
              <Label>Привязанные конкуренты</Label>
              {productCompetitors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Нет привязанных конкурентов
                </p>
              ) : (
                <div className="space-y-2">
                  {productCompetitors.map((pc) => (
                    <div
                      key={pc.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{pc.competitor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pc.product_url}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleUnlink(pc.product_id, pc.competitor_id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
