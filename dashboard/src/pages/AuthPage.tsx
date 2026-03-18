import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useStore } from "../store";
import { loginWithToken, getGithubLoginUrl } from "../lib/api";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Trackion</h1>
          <p className="text-muted-foreground">Analytics Dashboard</p>
        </div>

        <div className="rounded-2xl shadow-xl border border-border bg-card p-8">
          <form onSubmit={handleTokenLogin} className="space-y-4">
            <div>
              <Input
                // label="Server URL"
                type="url"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://localhost:8080"
                // icon={<Server size={20} />}
              />
            </div>

            <div>
              <Input
                // label="Admin Token"
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Enter your admin token"
                // icon={<Lock size={20} />}
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {enableGithubLogin && (
            <>
              <div className="my-6 flex items-center">
                <div className="grow border-t border-border" />
                <span className="px-3 text-sm text-muted-foreground">Or</span>
                <div className="grow border-t border-border" />
              </div>

              <Button
                type="button"
                onClick={handleGithubLogin}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                Login with GitHub
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
