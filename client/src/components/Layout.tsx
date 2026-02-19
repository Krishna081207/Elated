import { Link, useLocation } from "wouter";
import { Compass, Map, PlusCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-16 md:w-64 flex-shrink-0 bg-card border-r flex flex-col items-center md:items-stretch py-6 z-20">
        <div className="mb-8 px-0 md:px-6 flex items-center justify-center md:justify-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
            <Compass className="text-white w-6 h-6" />
          </div>
          <h1 className="hidden md:block font-display font-bold text-2xl tracking-tight text-foreground">
            VibeCheck
          </h1>
        </div>

        <nav className="flex-1 px-2 md:px-4 space-y-2 w-full">
          <NavItem href="/" icon={Map} active={location === "/"}>
            Explore Map
          </NavItem>
          <NavItem href="/add" icon={PlusCircle} active={location === "/add"}>
            Add Place
          </NavItem>
        </nav>

        <div className="px-2 md:px-6 mt-auto">
          <div className="p-4 rounded-xl bg-secondary/50 hidden md:block">
            <p className="text-xs font-medium text-secondary-foreground mb-1">Crowd Prediction</p>
            <p className="text-[10px] text-muted-foreground">AI-powered estimates based on historical data and live reports.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, children, active }: { href: string, icon: any, children: React.ReactNode, active: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}>
      <Icon className={cn("w-6 h-6 md:w-5 md:h-5", active ? "text-white" : "text-current")} />
      <span className="hidden md:block font-medium">{children}</span>
    </Link>
  );
}
