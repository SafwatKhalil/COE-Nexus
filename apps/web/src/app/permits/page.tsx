import { AppShell } from '@/components/layout/app-shell'
import { Topbar } from '@/components/layout/topbar'
import { Card, CardContent } from '@/components/ui/card'

export default function Page() {
  return (
    <AppShell>
      <Topbar title="permits" description="Coming in the next sprint" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            <div className="text-4xl mb-4">🚧</div>
            <div className="text-sm font-medium">permits module</div>
            <div className="text-xs mt-1">Backend API is live — UI in progress</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
