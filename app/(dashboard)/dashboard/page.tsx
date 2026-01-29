'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Users, Package, TrendingUp, Activity } from 'lucide-react'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'

interface Stats {
  competitors: number
  products: number
  priceRecords: number
  recentPrices: any[]
}

interface PriceData {
  scraped_at: string
  price: number
  competitor: { name: string }
  product: { name: string }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [competitors, setCompetitors] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    fetchProducts()
    fetchCompetitors()
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      fetchPriceData()
    }
  }, [selectedProduct, selectedCompetitor])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Ошибка загрузки данных')
      }
    } catch (error: any) {
      setError('Ошибка подключения к серверу')
      console.error('Failed to fetch stats:', error)
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

  const fetchPriceData = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedProduct !== 'all') {
        params.append('product_id', selectedProduct)
      }
      if (selectedCompetitor !== 'all') {
        params.append('competitor_id', selectedCompetitor)
      }
      params.append('days', '30')

      const response = await fetch(`/api/dashboard/prices?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPriceData(data)
      }
    } catch (error) {
      console.error('Failed to fetch price data:', error)
    }
  }

  // Prepare chart data
  const chartData = priceData.reduce((acc: any, item) => {
    const date = format(new Date(item.scraped_at), 'MMM dd')
    const key = `${item.product.name} - ${item.competitor.name}`

    const existing = acc.find((d: any) => d.date === date)
    if (existing) {
      existing[key] = item.price
    } else {
      acc.push({
        date,
        [key]: item.price,
      })
    }

    return acc
  }, [])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Дашборд</h1>
        <p className="text-muted-foreground">
          Обзор отслеживания цен конкурентов
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конкуренты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.competitors || 0}</div>
            <p className="text-xs text-muted-foreground">Активных</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Продукты</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.products || 0}</div>
            <p className="text-xs text-muted-foreground">Отслеживается</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Записей цен</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.priceRecords || 0}</div>
            <p className="text-xs text-muted-foreground">Всего</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Изменений</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.recentPrices.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">За 7 дней</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Продукт</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все продукты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все продукты</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Конкурент</Label>
              <Select
                value={selectedCompetitor}
                onValueChange={setSelectedCompetitor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все конкуренты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все конкуренты</SelectItem>
                  {competitors.map((competitor) => (
                    <SelectItem key={competitor.id} value={competitor.id}>
                      {competitor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>График изменения цен</CardTitle>
            <CardDescription>Последние 30 дней</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Array.from(
                  new Set(
                    priceData.map(
                      (d) => `${d.product.name} - ${d.competitor.name}`
                    )
                  )
                ).map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Prices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Последние изменения цен</CardTitle>
          <CardDescription>Последние 10 записей</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Продукт</TableHead>
                <TableHead>Конкурент</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.recentPrices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Нет данных о ценах
                  </TableCell>
                </TableRow>
              ) : (
                stats?.recentPrices.map((price: any) => (
                  <TableRow key={price.id}>
                    <TableCell className="font-medium">
                      {price.product.name}
                    </TableCell>
                    <TableCell>{price.competitor.name}</TableCell>
                    <TableCell>€{price.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {format(new Date(price.scraped_at), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
