import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import {
  Field,
  OutputActions,
  OutputSurface,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/ui-kit";
import { formatSummary, summarizeMeeting, type MeetingSummary } from "@/lib/generators";

export const Route = createFileRoute("/meeting-summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Vanta Workplace Assistant" },
      {
        name: "description",
        content:
          "Paste any meeting transcript or notes and get a clean summary, action items and deadlines you can copy or edit.",
      },
      { property: "og:title", content: "Meeting Summarizer — Vanta" },
      {
        property: "og:description",
        content: "Turn messy meeting notes into a summary, action items and deadlines.",
      },
    ],
  }),
  component: MeetingSummarizer,
});

function MeetingSummarizer() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<MeetingSummary | null>(null);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);

  const run = () => {
    const summary = summarizeMeeting(transcript);
    setResult(summary);
    setText(formatSummary(summary));
    setEditing(false);
  };

  return (
    <>
      <PageHeader eyebrow="Assistant" title="Meeting Summarizer" meta="Transcript → structure" />
      <div className="grid gap-6 px-6 py-7 md:px-10 lg:grid-cols-2">
        <Panel title="Meeting notes" aside="Input">
          <div className="space-y-4">
            <Field label="Transcript or notes" hint="paste anything">
              <TextArea
                rows={16}
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                placeholder={
                  "Paste your transcript here.\n\ne.g. Team aligned on the pricing pivot. Mara will circulate the final timeline by Friday. Localization deferred to Q4."
                }
              />
            </Field>
            <PrimaryButton onClick={run} disabled={transcript.trim().length < 20}>
              Summarize meeting
            </PrimaryButton>
          </div>
        </Panel>

        <Panel
          title="Structured summary"
          badge={result ? "Generated" : undefined}
          aside="Output"
          className="flex flex-col"
        >
          {editing || !result ? (
            <OutputSurface
              value={text}
              editing={editing}
              onChange={setText}
              placeholder="Summary, action items and deadlines will appear here."
            />
          ) : (
            <div className="well flex-1 space-y-5 rounded-2xl p-5">
              <SummaryBlock title="Summary" items={result.summary} empty="No discussion captured." />
              <SummaryBlock
                title="Action Items"
                items={result.actionItems}
                empty="No explicit actions identified."
              />
              <SummaryBlock
                title="Deadlines"
                items={result.deadlines}
                empty="No dates mentioned."
              />
            </div>
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

function SummaryBlock({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] tracking-wider text-primary uppercase">{title}</p>
      <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/85">
        {(items.length ? items : [empty]).map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="text-primary/70">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
