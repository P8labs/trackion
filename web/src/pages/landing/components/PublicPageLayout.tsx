import { Footer } from "./Footer";
import Header from "./Header";

interface PublicPageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="mx-auto relative md:max-w-5xl *:[[id]]:scroll-mt-22">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}
