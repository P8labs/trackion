import { Link } from "react-router-dom";
import { Button } from "@trackion/ui/button";
import { flags } from "@/lib/flags";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { SelfHostAuthForm } from "./components/self-host-auth-form";
import { useGlobal } from "@/providers/global-provider";
import { FullLine, PlusDecor } from "@trackion/ui/decoration";

export function AuthPage() {
  const { loginUrls } = useGlobal();
  const showOAuthSection = flags.isSaaS;

  const handleGithubLogin = () => {
    const githubLoginUrl = loginUrls.github;
    window.location.href = githubLoginUrl;
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = loginUrls.google;
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,var(--accent-soft),transparent_55%),radial-gradient(circle_at_80%_100%,var(--accent-soft),transparent_50%)] opacity-30 dark:opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[80px_80px]" />
        <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <section className="relative z-10 mx-auto w-full max-w-3xl border border-border/60 bg-background/95 backdrop-blur-[2px] dark:bg-background/80">
        <FullLine direction="vertical" />
        <PlusDecor position="top" />
        <FullLine />
        <div className="relative overflow-hidden px-6 py-10 lg:px-8 lg:py-12">
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Unified authentication
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Continue to Dashboard
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a provider or expand self-host credentials in the same
              system flow.
            </p>

            <div className="mt-7 border border-border/60">
              {showOAuthSection && (
                <div className="space-y-3 border-b border-border/60 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Managed OAuth
                  </p>
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="h-11 w-full cursor-pointer justify-start gap-2 rounded-md border-border/60 bg-background px-3.5 text-sm font-medium transition hover:bg-muted/30 dark:bg-muted/20 dark:hover:bg-muted/35"
                    type="button"
                  >
                    <FcGoogle className="size-4" />
                    Continue with Google
                  </Button>

                  <Button
                    onClick={handleGithubLogin}
                    variant="outline"
                    className="h-11 w-full cursor-pointer justify-start gap-2 rounded-md border-border/60 bg-background px-3.5 text-sm font-medium transition hover:bg-muted/30 dark:bg-muted/20 dark:hover:bg-muted/35"
                    type="button"
                  >
                    <FaGithub className="size-4" />
                    Continue with GitHub
                  </Button>
                </div>
              )}

              <div className="p-4">
                <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Self-host override
                </p>
                <SelfHostAuthForm />
              </div>
            </div>

            <div className="mt-5 space-y-1 text-xs text-muted-foreground">
              <p>
                By logging in, you agree to our{" "}
                <Link
                  to="/terms"
                  className="text-foreground underline underline-offset-4"
                >
                  Terms
                </Link>
                <span> and </span>
                <Link
                  to="/privacy"
                  className="text-foreground underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </p>
              <p>For self-host mode, use your admin token and server URL.</p>
            </div>
          </div>
        </div>
        <FullLine />
        <PlusDecor />
      </section>
    </div>
  );
}
