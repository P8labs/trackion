import { IsMobile } from "@/lib/flags";
import { oauthLogin, useGlobalStore } from "@/store";
import { Button, Paper, Text, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

type AuthOAuthButtonsProps = {
  layout?: "stack" | "row";
};

export function AuthCard({
  title,
  description,
  children,
  className = "",
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden px-4">
      <Paper p={IsMobile() ? "sm" : "xl"} className={className}>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm mt-2 text-muted-foreground">{description}</p>
        </div>

        {children}
        <AuthFooter />
      </Paper>
    </div>
  );
}

export function AuthFooter() {
  const { serverURL } = useGlobalStore();

  return (
    <div className="flex flex-col items-center justify-center fixed bottom-0 left-0 w-full p-4">
      <Text
        component="span"
        className="mt-4 flex items-center justify-center gap-1 text-sm"
      >
        Accessing:{" "}
        <Text component="span" c="cyan" className="cursor-pointer text-sm">
          {serverURL.replace(/(^\w+:|^)\/\//, "")}
        </Text>
      </Text>
      <Text
        component="span"
        className="mt-4 flex items-center justify-center gap-1 text-sm"
      >
        Change Server URL?{" "}
        <button
          className="text-(--mantine-color-cyan-text) cursor-pointer hover:underline"
          onClick={() => {
            const modalId = modals.open({
              title: "Set Server URL",
              centered: true,
              children: (
                <div className="space-y-4">
                  <p className="text-sm">
                    Please enter the URL of the server you want to connect to.
                    This should include the protocol (e.g., http:// or
                    https://).
                  </p>
                  <form
                    id="server-url-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      let formattedUrl = formData.get(
                        "server-url-input",
                      ) as string;
                      if (!formattedUrl) return;

                      if (!/^https?:\/\//i.test(formattedUrl)) {
                        formattedUrl = "http://" + formattedUrl;
                      }

                      useGlobalStore
                        .getState()
                        .actions.setServerUrl(formattedUrl);
                      modals.close(modalId);
                    }}
                  >
                    <TextInput
                      placeholder="Server URL"
                      type="url"
                      data-autofocus
                      id="server-url-input"
                      name="server-url-input"
                      required
                    />
                    <Button
                      fullWidth
                      type="submit"
                      mt="md"
                      form="server-url-form"
                    >
                      Save
                    </Button>
                  </form>
                </div>
              ),
            });
          }}
        >
          Update here
        </button>
      </Text>
    </div>
  );
}

export function AuthOAuthButtons({ layout = "stack" }: AuthOAuthButtonsProps) {
  const buttons = (
    <>
      <Button
        component="a"
        href={oauthLogin("google")}
        rel="noopener noreferrer"
        variant="default"
        size="lg"
        type="button"
        className={
          layout === "row" ? "w-full rounded-r-none!" : "rounded-b-none!"
        }
      >
        <FcGoogle className="size-7" />
      </Button>

      <Button
        component="a"
        href={oauthLogin("github")}
        rel="noopener noreferrer"
        variant="default"
        size="lg"
        type="button"
        className={
          layout === "row" ? "w-full rounded-l-none!" : "rounded-t-none!"
        }
      >
        <FaGithub className="size-7" />
      </Button>
    </>
  );

  if (layout === "row") {
    return <div className="grid grid-cols-2">{buttons}</div>;
  }

  return <div className="space-y-0.5 flex flex-col">{buttons}</div>;
}
