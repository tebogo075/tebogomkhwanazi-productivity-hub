import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import {
  Field,
  OutputActions,
  OutputSurface,
  Panel,
  PrimaryButton,
  PriorityTag,
  TextArea,
} from "@/components/ui-kit";
import { buildSchedule, formatSchedule, type ScheduleBlock } from "@/lib/generators";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "Task Planner — Vanta Workplace Assistant" },
      {
        name: "description",
        content:
          "Drop in your to-do list and get a realistic 8am–5pm daily schedule with priority tags you can copy or edit.",
      },
      { property: "og:title", content: "Task Planner — Vanta" },
      {
        property: "og:description",
        content: "Turn a task list into an 8am–5pm plan with priority tags.",
      },
    ],
  }),
  component: TaskPlanner,
});

function TaskPlanner() {
  const [tasks, setTasks] = useState("");
  const [blocks, setBlocks] = useState<ScheduleBlock[] | null>(null);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);

  const run = () => {
    const schedule = buildSchedule(tasks);
    setBlocks(schedule);
    setText(formatSchedule(schedule));
    setEditing(false);
  };

  return (
    <>
      <PageHeader eyebrow="Assistant" title="Task Planner" meta="08:00 – 17:00" />
      <div className="grid gap-6 px-6 py-7 md:px-10 lg:grid-cols-2">
        <Panel title="Today's tasks" aside="Input">
          <div className="space-y-4">
            <Field label="Task list" hint="one per line · add (high/medium/low)">
              <TextArea
                rows={12}
                value={tasks}
                onChange={(event) => setTasks(event.target.value)}
                placeholder={
                  "Review pull requests (high)\nDesign sync (medium)\nDraft pricing memo (high)\nUpdate documentation (low)"
                }
              />
            </Field>
            <PrimaryButton onClick={run} disabled={!tasks.trim()}>
              Build 8am–5pm plan
            </PrimaryButton>
          </div>
        </Panel>

        <Panel
          title="Daily schedule"
          badge={blocks?.length ? "Generated" : undefined}
          aside="Output"
          className="flex flex-col"
        >
          {editing || !blocks?.length ? (
            <OutputSurface
              value={text}
              editing={editing}
              onChange={setText}
              placeholder="Your 8am–5pm plan will appear here, highest priority first."
            />
          ) : (
            <ul className="well flex-1 space-y-2 rounded-2xl p-4 text-sm">
              {blocks.map((block) => (
                <li
                  key={block.time}
                  className="flex items-center gap-3 rounded-lg bg-background/50 px-3 py-2.5 ring-1 ring-border"
                >
                  <span className="w-12 shrink-0 text-xs text-muted-foreground">
                    {block.time}
                  </span>
                  <span className="text-foreground/85">{block.label}</span>
                  <span className="ml-auto shrink-0">
                    <PriorityTag level={block.priority} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          <OutputActions
            text={text}
            editing={editing}
            onToggleEdit={() => setEditing((state) => !state)}
          />
        </Panel>
      </div>
    </>
  );
}
