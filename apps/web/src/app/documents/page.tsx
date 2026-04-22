import { AppShell } from '@/components/layout/app-shell'
import { Topbar } from '@/components/layout/topbar'
import { Card, CardContent } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export default function Page() {
  return (
    <AppShell>
      <Topbar title="Documents" description="Site documents, reports, and attachments" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            <Construction className="w-8 h-8 mx-auto mb-4 opacity-30" />
            <div className="text-sm font-medium">Documents module</div>
            <div className="text-xs mt-1 opacity-60">Backend API is live — UI in progress</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
