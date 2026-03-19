import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Server, Lock, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useStore } from "../store";
import { loginWithToken, getGithubLoginUrl } from "../lib/api";

export function AuthPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useStore();
  const [serverUrl, setServerUrl] = useState("http://localhost:8000");
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enableGithubLogin = import.meta.env.VITE_ENABLE_GITHUB_LOGIN === "true";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginWithToken(adminToken, serverUrl);
      setAuth(result.token, serverUrl, result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = () => {
    const githubLoginUrl = getGithubLoginUrl(serverUrl);
    window.location.href = githubLoginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Trackion</h1>
          <p className="text-muted-foreground text-lg">Analytics Dashboard</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Sign in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleTokenLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverUrl" className="text-sm font-medium">
                  Server URL
                </Label>
                <div className="relative">
                  <Server className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="serverUrl"
                    type="url"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminToken" className="text-sm font-medium">
                  Admin Token
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="adminToken"
                    type="password"
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    placeholder="Enter your admin token"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {enableGithubLogin && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGithubLogin}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Continue With GitHub
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
