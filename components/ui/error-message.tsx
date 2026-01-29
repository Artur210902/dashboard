import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function ErrorMessage({ message }: { message: string }) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center space-x-2 p-4">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  )
}
