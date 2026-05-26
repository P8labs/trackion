import { Link } from "react-router-dom";
import { Button } from "@trackion/ui/button";
import { flags } from "@/lib/flags";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { SelfHostAuthForm } from "./components/self-host-auth-form";
import { useGlobal } from "@/providers/global-provider";
import { openUrl } from "@tauri-apps/plugin-opener";
import { IS_ANDROID } from "@/lib/constants";

export function AuthPage() {
  const { loginUrls } = useGlobal();
  const showOAuthSection = flags.isSaaS;

  const handleGithubLogin = async () => {
    await openUrl(loginUrls.github);
  };

  const handleGoogleLogin = async () => {
    await openUrl(loginUrls.google);
  };

  if (IS_ANDROID) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <section className="w-full bg-background/95 backdrop-blur-[2px] dark:bg-background/80">
          <div className="relative overflow-hidden px-6 py-10 lg:px-8 lg:py-12">
            <div className="relative">
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Continue to Dashboard
              </h2>

              {showOAuthSection && (
                <div className="border-b border-border/60 pt-4">
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="h-11 w-full cursor-pointer justify-start gap-2 rounded-md rounded-b-none border-border/60 bg-background px-3.5 text-sm font-medium transition hover:bg-muted/30 dark:bg-muted/20 dark:hover:bg-muted/35"
                    type="button"
                  >
                    <FcGoogle className="size-4" />
                    Continue with Google
                  </Button>

                  <Button
                    onClick={handleGithubLogin}
                    variant="outline"
                    className="h-11 w-full cursor-pointer justify-start gap-2 rounded-none border-t-0 border-border/60 bg-background px-3.5 text-sm font-medium transition hover:bg-muted/30 dark:bg-muted/20 dark:hover:bg-muted/35"
                    type="button"
                  >
                    <FaGithub className="size-4" />
                    Continue with GitHub
                  </Button>
                </div>
              )}

              <SelfHostAuthForm />

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
        </section>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <section className="relative z-10 mx-auto w-full max-w-3xl border border-border/60 bg-background/95 backdrop-blur-[2px] dark:bg-background/80">
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
      </section>
    </div>
  );
}
