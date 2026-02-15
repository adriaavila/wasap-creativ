import { Card } from "@/components/ui/card";

const cards = ["Total conversations", "Total messages", "Median response latency", "24h volume"];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((title) => (
          <Card key={title} className="p-4">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h2 className="text-lg font-medium">Daily owner report</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The backend action compiles org metrics every 24h and can push summary notifications to the org owner.
        </p>
      </Card>
    </div>
  );
}
