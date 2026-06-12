import { Footer } from "./Footer";
import { Header } from "./Header";

interface PublicPageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen overflow-hidden select-text">
      <div className="mx-auto relative md:max-w-6xl">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}
