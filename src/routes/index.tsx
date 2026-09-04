import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, CalendarClock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Panel, PriorityTag } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DoneZA - Your day, DoneZA" },
      {
        name: "description",
        content:
          "Draft emails, summarize meetings and plan your 8am–5pm day in one workspace. Every output is copyable and editable.",
      },
      { property: "og:title", content: "DoneZA - Your day, DoneZA" },
      {
        property: "og:description",
        content:
          "One workspace for email drafting, meeting summaries and daily schedule planning.",
      },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  {
    to: "/email-generator",
    icon: Mail,
    title: "Smart Email Generator",
    body: "Recipient, purpose and key points in — a tone-matched draft out. Formal, informal or persuasive.",
  },
  {
    to: "/meeting-summarizer",
    icon: NotebookPen,
    title: "Meeting Summarizer",
    body: "Paste a transcript and get a summary, action items and deadlines separated for you.",
  },
  {
    to: "/task-planner",
    icon: CalendarClock,
    title: "Task Planner",
    body: "Turn a raw task list into a realistic 8am–5pm schedule with priority tags.",
  },
] as const;

function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Assistant"
        title="Your workday, drafted"
        meta="Three tools · one workspace"
      />

      <div className="grid gap-6 px-6 py-7 md:px-10 lg:grid-cols-3">
        {FEATURES.map(({ to, icon: Icon, title, body }) => (
          <Link key={to} to={to} className="group block">
            <div className="glass h-full rounded-3xl p-6 ring-1 ring-border transition-colors group-hover:ring-primary/30">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="size-5" />
              </div>
              <h2 className="font-display mt-4 text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <span className="font-display mt-5 inline-flex items-center gap-1.5 text-xs text-primary">
                Open <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 px-6 pb-8 md:px-10 lg:grid-cols-2">
        <Panel title="How it works" aside="Overview">
          <ol className="space-y-3 text-sm leading-relaxed text-foreground/80">
            <li className="flex gap-3">
              <span className="font-display text-primary">01</span>
              <span>Fill in the Input Section of any tool with your own context.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-display text-primary">02</span>
              <span>Generate a draft in the Output Section, structured and ready to use.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-display text-primary">03</span>
              <span>Copy it straight to your clipboard, or edit it inline before you send.</span>
            </li>
          </ol>
        </Panel>

        <Panel title="Sample day · 08:00 – 17:00" aside="Task Planner">
          <ul className="space-y-2 text-sm">
            {[
              { time: "08:00", label: "Review pull requests", level: "High" as const },
              { time: "09:00", label: "Draft pricing memo", level: "High" as const },
              { time: "11:00", label: "Design sync", level: "Medium" as const },
              { time: "12:00", label: "Lunch & reset", level: "Low" as const },
              { time: "14:00", label: "Update documentation", level: "Low" as const },
            ].map((block) => (
              <li
                key={block.time}
                className="flex items-center gap-3 rounded-lg bg-background/50 px-3 py-2 ring-1 ring-border"
              >
                <span className="w-12 shrink-0 text-xs text-muted-foreground">
                  {block.time}
                </span>
                <span className="text-foreground/85">{block.label}</span>
                <span className="ml-auto">
                  <PriorityTag level={block.level} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
