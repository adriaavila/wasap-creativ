import { Card } from "@/components/ui/card";

function boolToStatus(value: string | undefined) {
  return value ? "Connected" : "Missing";
}

export default function SettingsPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4">
        <h2 className="text-lg font-semibold">Organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">Manage org profile, member roles, and permissions in Clerk dashboard.</p>
      </Card>
      <Card className="p-4">
        <h2 className="text-lg font-semibold">WhatsApp Connection Status</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>Access token: {boolToStatus(process.env.WHATSAPP_ACCESS_TOKEN)}</li>
          <li>Phone number ID: {boolToStatus(process.env.WHATSAPP_PHONE_NUMBER_ID)}</li>
          <li>Verify token: {boolToStatus(process.env.WHATSAPP_VERIFY_TOKEN)}</li>
          <li>App secret: {boolToStatus(process.env.WHATSAPP_APP_SECRET)}</li>
        </ul>
      </Card>
    </div>
  );
}
