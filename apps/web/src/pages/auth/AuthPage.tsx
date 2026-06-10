import { IsMobile } from "@/lib/flags";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { useGlobal } from "@/providers/global-provider";
import { Button, Paper, TextInput, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useStore } from "@/store";

export function AuthPage() {
  const { loginUrls } = useGlobal();
  const { serverUrl, setServerUrl } = useStore();

  const handleGithubLogin = () => {
    const githubLoginUrl = loginUrls.github;
    window.location.href = githubLoginUrl;
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = loginUrls.google;
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden">
      <Paper p={IsMobile() ? "sm" : "xl"} className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Continue to Dashboard
        </h2>
        <p className="text-sm -mt-2 text-muted-foreground">
          Choose a provider or expand self-host credentials in the same system
          flow.
        </p>

        <div className="space-y-0.5 flex flex-col">
          <Button
            leftSection={<FcGoogle className="size-4" />}
            onClick={handleGoogleLogin}
            variant="default"
            size="lg"
            type="button"
            className="rounded-b-none!"
          >
            Continue with Google
          </Button>

          <Button
            leftSection={<FaGithub className="size-4" />}
            onClick={handleGithubLogin}
            variant="default"
            size="lg"
            type="button"
            className="rounded-t-none!"
          >
            Continue with GitHub
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center fixed bottom-0 left-0 w-full p-4">
          <Text
            component="span"
            className="mt-4 flex items-center justify-center gap-1 text-sm"
          >
            Accessing:{" "}
            <Text component="span" c="cyan" className="cursor-pointer text-sm">
              {serverUrl.replace(/(^\w+:|^)\/\//, "")}
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
                const modelId = modals.open({
                  title: "Set Server URL",
                  centered: true,
                  children: (
                    <div className="space-y-4">
                      <p className="text-sm">
                        Please enter the URL of the server you want to connect
                        to. This should include the protocol (e.g., http:// or
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

                          // Ensure the URL starts with http:// or https://
                          if (!/^https?:\/\//i.test(formattedUrl)) {
                            formattedUrl = "http://" + formattedUrl;
                          }

                          setServerUrl(formattedUrl);
                          modals.close(modelId);
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
      </Paper>
    </div>
  );
}
