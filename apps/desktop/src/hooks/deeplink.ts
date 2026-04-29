import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useDeepLinkAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setup = async () => {
      try {
        unlisten = await onOpenUrl((urls: string[]) => {
          try {
            const url = new URL(urls[0]);
            const params = new URLSearchParams(url.search);

            navigate(`/auth/callback?${params.toString()}`, {
              replace: true,
            });
          } catch (err) {
            console.error("Deep link parse error:", err);
          }
        });
      } catch (err) {
        console.error("Listener error:", err);
      }
    };

    setup();

    return () => {
      if (unlisten) unlisten();
    };
  }, [navigate]);
};
