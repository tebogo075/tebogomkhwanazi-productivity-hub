import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import {
  Field,
  OutputActions,
  OutputSurface,
  Panel,
  PrimaryButton,
  Segmented,
  TextArea,
  TextInput,
} from "@/components/ui-kit";
import {
  AUDIENCES,
  TONES,
  generateEmail,
  type Audience,
  type Tone,
} from "@/lib/generators";

export const Route = createFileRoute("/email-generator")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — DoneZA" },
      {
        name: "description",
        content:
          "Draft professional emails in seconds: set recipient, purpose, key points, tone and audience, then copy or edit the result.",
      },
      { property: "og:title", content: "Smart Email Generator — DoneZA" },
      {
        property: "og:description",
        content:
          "Generate formal, informal or persuasive emails tailored to clients, managers or your team.",
      },
    ],
  }),
  component: EmailGenerator,
});

function EmailGenerator() {
  const [to, setTo] = useState("");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [sender, setSender] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [audience, setAudience] = useState<Audience>("client");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  const generate = () => {
    setDraft(generateEmail({ to, purpose, keyPoints, tone, audience, sender }));
    setEditing(false);
  };

  return (
    <>
      <PageHeader eyebrow="Assistant" title="Smart Email Generator" meta="Tone-aware drafting" />
      <div className="grid gap-6 px-6 py-7 md:px-10 lg:grid-cols-2">
        <Panel title="Compose brief" aside="Input">
          <div className="space-y-4">
            <Field label="To">
              <TextInput
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="Priya Nair · Head of Design"
              />
            </Field>
            <Field label="Purpose">
              <TextInput
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                placeholder="Request sign-off on the Q3 design brief"
              />
            </Field>
            <Field label="Key points" hint="one per line">
              <TextArea
                rows={4}
                value={keyPoints}
                onChange={(event) => setKeyPoints(event.target.value)}
                placeholder={"Timeline confirmed for June 3\nBudget scope is $48K\nTwo open questions on pricing tiers"}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tone">
                <Segmented options={TONES} value={tone} onChange={setTone} />
              </Field>
              <Field label="Audience">
                <Segmented options={AUDIENCES} value={audience} onChange={setAudience} />
              </Field>
            </div>
            <Field label="Sign-off name">
              <TextInput
                value={sender}
                onChange={(event) => setSender(event.target.value)}
                placeholder="Adrian Cole"
              />
            </Field>
            <PrimaryButton onClick={generate} disabled={!purpose.trim() && !keyPoints.trim()}>
              Generate email
            </PrimaryButton>
          </div>
        </Panel>

        <Panel
          title="Draft"
          badge={draft ? "Generated" : undefined}
          aside="Output"
          className="flex flex-col"
        >
          <OutputSurface
            value={draft}
            editing={editing}
            onChange={setDraft}
            placeholder="Your generated email will appear here. Fill in the brief and press Generate."
          />
          <OutputActions
            text={draft}
            editing={editing}
            onToggleEdit={() => setEditing((state) => !state)}
          />
        </Panel>
      </div>
    </>
  );
}
