import { Footer } from "./Footer";
import Header from "./Header";

interface PublicPageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
