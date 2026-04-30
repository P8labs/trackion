import { Button } from "@trackion/ui/button";
import { PlusDecor } from "@trackion/ui/decoration";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between border-b">
        <div className="absolute inset-0 border-l border-r dark:border-card pointer-events-none"></div>
        <PlusDecor />
        <Link to="/">
          <div className="flex items-center">
            <img src="/trackion_t.png" alt="Trackion" className="w-8 h-8" />
            <span className="font-bold text-xl">Trackion</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="/docs/"
            target="_blank"
            className="text-muted-foreground hover:text-foreground"
          >
            Docs
          </a>
          <a
            href="https://github.com/P8labs/trackion"
            className="text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
          <Link to="/auth">
            <Button variant="outline">Let's Begin</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
