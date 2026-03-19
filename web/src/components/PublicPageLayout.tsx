import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";

interface PublicPageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export function PublicPageLayout({
  children,
  showBackButton = true,
}: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            {showBackButton && <ArrowLeft className="h-4 w-4" />}
            <img src="/trackion_t.png" alt="Trackion" className="w-8 h-8" />
            <span className="font-bold text-xl">Trackion</span>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            Built with ❤️ by P8Labs. Released under the MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
