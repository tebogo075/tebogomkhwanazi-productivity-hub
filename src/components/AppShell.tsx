import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Mail, NotebookPen, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email-generator", label: "Email Generator", icon: Mail },
  { to: "/meeting-summarizer", label: "Meeting Summarizer", icon: NotebookPen },
  { to: "/task-planner", label: "Task Planner", icon: CalendarClock },
] as const;

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "font-display flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary ring-1 ring-primary/25"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", active && "glow-dot rounded-full")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border/70 bg-surface/60 p-5 md:flex">
          <div className="px-2 pb-7">
            <Brand />
          </div>

          <SidebarNav pathname={pathname} />

          <div className="glass mt-auto rounded-2xl p-4 ring-1 ring-border">
            <p className="mb-1 text-[11px] text-muted-foreground">Plan</p>
            <p className="font-display text-sm font-semibold">DoneZA Premium</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
              <div className="bg-lumen h-full w-2/3" />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              17 of 25 credits used
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-border/60 px-6 py-4 md:hidden">
            <SidebarNav pathname={pathname} />
          </div>
          {children}
        </main>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-border/60 px-6 py-5 md:px-10">
        <p className="text-xs text-muted-foreground">
          Responsible AI: AI-generated content, review before use.
        </p>
        <p className="font-display text-[11px] text-muted-foreground/70">
          Vanta · Lumen Pro
        </p>
      </footer>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border/60 px-6 pt-7 pb-5 md:px-10">
      <div>
        <p className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display text-lit text-2xl font-semibold">{title}</h1>
      </div>
      {meta ? (
        <span className="hidden text-xs text-muted-foreground sm:block">{meta}</span>
      ) : null}
    </header>
  );
}
