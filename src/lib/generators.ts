export const TONES = ["formal", "informal", "persuasive"] as const;
export const AUDIENCES = ["client", "manager", "team"] as const;

export type Tone = (typeof TONES)[number];
export type Audience = (typeof AUDIENCES)[number];

const splitPoints = (raw: string) =>
  raw
    .split(/\n|;|•/)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean);

const firstName = (to: string) => {
  const cleaned = (to.split(/[<(]/)[0] ?? "").trim();
  if (!cleaned) return "there";
  if (cleaned.includes("@")) {
    const local = (cleaned.split("@")[0] ?? "").replace(/[._-]+/g, " ");
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return cleaned.split(/\s+/)[0] ?? "there";
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replace(/\.$/, "");

export function generateEmail(input: {
  to: string;
  purpose: string;
  keyPoints: string;
  tone: Tone;
  audience: Audience;
  sender?: string;
}): string {
  const name = firstName(input.to);
  const purpose = input.purpose.trim() || "an update on our current work";
  const points = splitPoints(input.keyPoints);
  const sender = input.sender?.trim() || "Your Name";

  const greeting =
    input.tone === "informal"
      ? `Hi ${name},`
      : input.tone === "persuasive"
        ? `Hello ${name},`
        : `Dear ${name},`;

  const audienceFrame: Record<Audience, string> = {
    client:
      "Thank you for your continued partnership — I want to make sure you have everything you need on this.",
    manager:
      "I wanted to keep you informed and flag anything that needs your decision.",
    team: "Quick note so we're all working from the same picture.",
  };

  const opening: Record<Tone, string> = {
    formal: `I am writing regarding ${purpose.toLowerCase()}.`,
    informal: `Just reaching out about ${purpose.toLowerCase()}.`,
    persuasive: `I'd like to make the case for ${purpose.toLowerCase()} — I think the timing works strongly in our favour.`,
  };

  const closing: Record<Tone, string> = {
    formal: "Please let me know if you require any further detail.",
    informal: "Let me know what you think whenever you get a moment.",
    persuasive:
      "If you're happy with the direction, I can move this forward straight away — just say the word.",
  };

  const signOff: Record<Tone, string> = {
    formal: "Kind regards,",
    informal: "Thanks,",
    persuasive: "Best regards,",
  };

  const body = points.length
    ? points.map((point) => `• ${titleCase(point)}`).join("\n")
    : "• Full details to follow in a short follow-up note.";

  const subject = `Subject: ${titleCase(purpose)}`;

  return [
    subject,
    "",
    greeting,
    "",
    `${opening[input.tone]} ${audienceFrame[input.audience]}`,
    "",
    "Key points:",
    body,
    "",
    closing[input.tone],
    "",
    signOff[input.tone],
    sender,
  ].join("\n");
}

const DATE_PATTERN =
  /\b(?:mon|tues?|wed(?:nes)?|thur?s?|fri|sat(?:ur)?|sun)(?:day)?\b|\b\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}\b|\bQ[1-4]\b|\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b|\b(?:today|tomorrow|next week|end of (?:day|week|month))\b/i;

const ACTION_PATTERN =
  /\b(will|to do|action|assign|owns?|follow[- ]up|send|prepare|draft|review|confirm|schedule|share|update|deliver|investigate|fix)\b/i;

const DEADLINE_PATTERN = /\b(by|due|deadline|before|no later than|eod|eow)\b/i;

export type MeetingSummary = {
  summary: string[];
  actionItems: string[];
  deadlines: string[];
};

export function summarizeMeeting(transcript: string): MeetingSummary {
  const sentences = transcript
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 12);

  const actionItems: string[] = [];
  const deadlines: string[] = [];
  const summary: string[] = [];

  for (const sentence of sentences) {
    const hasDeadline = DEADLINE_PATTERN.test(sentence) || DATE_PATTERN.test(sentence);
    const hasAction = ACTION_PATTERN.test(sentence);

    if (hasDeadline && (hasAction || /\bdue\b|\bdeadline\b/i.test(sentence))) {
      deadlines.push(sentence);
      if (hasAction) actionItems.push(sentence);
      continue;
    }
    if (hasAction) {
      actionItems.push(sentence);
      continue;
    }
    summary.push(sentence);
  }

  const trimmedSummary = (summary.length ? summary : sentences).slice(0, 5);

  return {
    summary: trimmedSummary,
    actionItems: actionItems.slice(0, 8),
    deadlines: deadlines.slice(0, 8),
  };
}

export function formatSummary(result: MeetingSummary): string {
  const section = (title: string, items: string[], empty: string) =>
    [`${title}:`, ...(items.length ? items.map((item) => `• ${item}`) : [`• ${empty}`])].join(
      "\n",
    );

  return [
    section("Summary", result.summary, "No discussion captured."),
    "",
    section("Action Items", result.actionItems, "No explicit actions identified."),
    "",
    section("Deadlines", result.deadlines, "No dates mentioned."),
  ].join("\n");
}

export type Priority = "High" | "Medium" | "Low";

export type ScheduleBlock = {
  time: string;
  label: string;
  priority: Priority;
};

const SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

/** Builds an 8am–5pm schedule: high-priority work lands in the morning focus hours. */
export function buildSchedule(rawTasks: string): ScheduleBlock[] {
  const tasks = rawTasks
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/[([]?\s*(high|medium|low|p0|p1|p2|p3)\s*[)\]]?$/i);
      let priority: Priority = "Medium";
      let label = line;
      if (match) {
        const token = (match[1] ?? "").toLowerCase();
        priority =
          token === "high" || token === "p0" || token === "p1"
            ? "High"
            : token === "low" || token === "p3"
              ? "Low"
              : "Medium";
        label = line.slice(0, match.index).replace(/[-–:,]\s*$/, "").trim();
      }
      return { label: label || line, priority };
    });

  const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
  const sorted = [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);

  const blocks: ScheduleBlock[] = [];
  let slot = 0;

  for (const task of sorted) {
    if (slot >= SLOTS.length) break;
    if (SLOTS[slot] === "12:00") {
      blocks.push({ time: "12:00", label: "Lunch & reset", priority: "Low" });
      slot += 1;
      if (slot >= SLOTS.length) break;
    }
    blocks.push({
      time: SLOTS[slot] ?? "16:00",
      label: task.label,
      priority: task.priority,
    });
    slot += 1;
  }

  if (blocks.length && !blocks.some((block) => block.time === "16:00")) {
    blocks.push({
      time: "16:00",
      label: "Wrap-up: inbox, notes & tomorrow's list",
      priority: "Low",
    });
  }

  return blocks;
}

export function formatSchedule(blocks: ScheduleBlock[]): string {
  return blocks
    .map((block) => `${block.time} — ${block.label} [${block.priority}]`)
    .join("\n");
}
