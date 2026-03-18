import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your dashboard
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium mb-1 text-foreground">Version</p>
              <p>Trackion v1.0</p>
            </div>
            <div>
              <p className="font-medium mb-1 text-foreground">Built with</p>
              <p>React • TypeScript • Tailwind CSS</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              All tracking data is stored on your server. Trackion does not
              collect or transmit any data externally.
            </p>
            <p>For more information, visit our documentation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
