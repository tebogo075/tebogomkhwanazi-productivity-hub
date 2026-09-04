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

const lowerFirst = (value: string) =>
  /^[A-Z]{2,}/.test(value) ? value : value.charAt(0).toLowerCase() + value.slice(1);

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replace(/\.$/, "");

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "for",
  "of",
  "on",
  "in",
  "at",
  "and",
  "or",
  "with",
  "about",
  "that",
  "this",
  "please",
  "kindly",
  "regarding",
  "my",
  "our",
  "your",
  "their",
  "is",
  "are",
  "be",
  "can",
  "could",
  "would",
  "we",
  "i",
  "them",
  "him",
  "her",
  "it",
]);

/** Strips meta-prompt scaffolding like "write a professional email to X about ...". */
const cleanPurpose = (raw: string) => {
  let value = raw.trim().replace(/\s+/g, " ");
  value = value.replace(
    /^(?:please\s+|kindly\s+|can you\s+|could you\s+)?(?:help me\s+)?(?:write|draft|compose|generate|create|send|prepare)\s+(?:me\s+)?(?:a|an|the)?\s*(?:short|brief|quick|nice|polite|friendly|professional|formal|informal|persuasive)*\s*(?:e-?mail|message|note|letter)\s*/i,
    "",
  );
  value = value.replace(/^(?:to|for)\s+[^,]{1,40}?\s+(?:about|regarding|asking|to)\s+/i, "");
  value = value.replace(/^(?:about|regarding|asking(?:\s+them)?\s+to|saying that|saying)\s+/i, "");
  value = value.replace(/^(?:that|which)\s+/i, "");
  return value.replace(/[.\s]+$/, "");
};

const TIME_PATTERN =
  /\b(?:(today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)\s*)?(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;

/** Pulls a meeting time such as "tomorrow 10am" out of a free-text purpose. */
export function extractMeetingTime(raw: string): string | null {
  const match = TIME_PATTERN.exec(raw);
  if (!match) return null;
  const dayRaw = (match[1] ?? "").toLowerCase();
  const dayMap: Record<string, string> = {
    mon: "Monday",
    tue: "Tuesday",
    tues: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    thur: "Thursday",
    thurs: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };
  const day = dayRaw
    ? (dayMap[dayRaw] ?? dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1))
    : "";
  const hour = match[2];
  const minutes = match[3] ? `:${match[3]}` : "";
  const meridiem = (match[4] ?? "").toLowerCase();
  const time = `${hour}${minutes}${meridiem}`;
  if (!day) return time;
  const relative = /^(today|tomorrow|tonight)$/i.test(day);
  return relative ? `${day.toLowerCase()} at ${time}` : `on ${day} at ${time}`;
}

type Intent =
  | "reschedule"
  | "follow-up"
  | "proposal"
  | "approval"
  | "meeting"
  | "update"
  | "thanks"
  | "request"
  | "general";

const detectIntent = (value: string): Intent => {
  const text = value.toLowerCase();
  if (/reschedul|move (?:the|our) (?:meeting|call)|postpone|new time/.test(text)) return "reschedule";
  if (/follow[- ]?up|checking in|circle back|chase/.test(text)) return "follow-up";
  if (/proposal|quote|pitch|offer|pricing/.test(text)) return "proposal";
  if (/approv|sign[- ]?off|permission|authoris|authoriz/.test(text)) return "approval";
  if (/meeting|call|catch[- ]?up|schedule|book|invite/.test(text)) return "meeting";
  if (/update|status|progress|report/.test(text)) return "update";
  if (/thank|apprecia/.test(text)) return "thanks";
  if (/request|ask(?:ing)? for|need|require/.test(text)) return "request";
  return "general";
};

const INTENT_LABEL: Record<Intent, string> = {
  reschedule: "Rescheduling",
  "follow-up": "Follow-Up",
  proposal: "Proposal",
  approval: "Approval",
  meeting: "Meeting",
  update: "Update",
  thanks: "Thank You",
  request: "Request",
  general: "Quick Note",
};

/** Builds a compact 5–7 word subject line from the cleaned purpose. */
export function buildSubject(cleaned: string, intent: Intent): string {
  const keywords = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9\s&/-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .filter((word) => !/^(?:email|message|note|write|draft|send|professional)$/.test(word));

  const seen = new Set<string>();
  const topic = keywords
    .filter((word) => (seen.has(word) ? false : (seen.add(word), true)))
    .slice(0, 5)
    .map((word) =>
      /^(?:q[1-4]|[a-z]{1,4}\d+|\d+[a-z]{1,3})$/.test(word)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");

  const label = INTENT_LABEL[intent];
  if (!topic) return label;
  const combined = /reschedul|follow|proposal|approv|meeting|update|thank/i.test(topic)
    ? topic
    : `${label}: ${topic}`;
  return combined.split(/\s+/).slice(0, 7).join(" ");
};

export function generateEmail(input: {
  to: string;
  purpose: string;
  keyPoints: string;
  tone: Tone;
  audience: Audience;
  sender?: string;
}): string {
  const name = firstName(input.to);
  const cleaned = cleanPurpose(input.purpose) || "a quick update on our current work";
  const intent = detectIntent(cleaned);
  const meetingTime = extractMeetingTime(cleaned);
  const points = splitPoints(input.keyPoints);
  const sender = input.sender?.trim() || "Your Name";

  const greeting =
    input.tone === "informal" ? `Hi ${name},` : input.tone === "persuasive" ? `Hello ${name},` : `Dear ${name},`;

  const topicBase = cleaned
    .replace(/\.$/, "")
    .replace(TIME_PATTERN, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^(?:to|for)\s+/i, "")
    .replace(/\s+(?:at|on)$/i, "")
    .trim();
  const rawTopic = lowerFirst(topicBase || cleaned);
  const topic =
    intent === "reschedule" || intent === "meeting"
      ? /\b(meeting|call|catch[- ]?up|session)\b/i.test(rawTopic)
        ? "our upcoming meeting"
        : `our plans around ${rawTopic}`
      : rawTopic;

  const openers: Record<Tone, string> = {
    formal: `I hope this message finds you well. I'm getting in touch about ${topic}.`,
    informal: `Hope you're doing well! I wanted to touch base about ${topic}.`,
    persuasive: `I hope you're having a good week. I'd love your thoughts on ${topic} — I think there's a real opportunity here.`,
  };

  const intentLine: Record<Intent, string> = {
    reschedule: meetingTime
      ? `Would it be possible to move our meeting to ${meetingTime}? If that doesn't suit, I'm happy to work around your calendar.`
      : "Would it be possible to find an alternative time? I'm happy to work around your calendar.",
    "follow-up": "I wanted to follow up so nothing slips through the cracks on this.",
    proposal: "I've outlined the essentials below so you can see the shape of it at a glance.",
    approval: "When you have a moment, I'd appreciate your go-ahead so we can keep things moving.",
    meeting: meetingTime
      ? `Would ${meetingTime} work for you? I'm flexible if another slot is easier.`
      : "Let me know a time that suits you and I'll send an invite across.",
    update: "Here's a short summary of where things stand right now.",
    thanks: "I really appreciate the time and support you've given this.",
    request: "I've kept the ask as simple as possible below.",
    general: "I've pulled the main details together below for easy reference.",
  };

  const audienceFrame: Record<Audience, string> = {
    client: "Thanks as always for the partnership — I want to make sure you have everything you need.",
    manager: "Flagging it here so you have full visibility and can weigh in where needed.",
    team: "Sharing it with everyone so we're all working from the same picture.",
  };

  const closing: Record<Tone, string> = {
    formal: "Please do let me know if you'd like any further detail.",
    informal: "Let me know what you think whenever you get a moment.",
    persuasive: "If you're happy with the direction, just say the word and I'll move it forward.",
  };

  const signOff: Record<Tone, string> = {
    formal: "Kind regards,",
    informal: "Thanks,",
    persuasive: "Best regards,",
  };

  const lines = [
    `Subject: ${buildSubject(cleaned, intent)}`,
    "",
    greeting,
    "",
    openers[input.tone],
    "",
    `${intentLine[intent]} ${audienceFrame[input.audience]}`,
  ];

  if (points.length) {
    lines.push("", "A few key points:", points.map((point) => `• ${titleCase(point)}`).join("\n"));
  }

  lines.push("", closing[input.tone], "", signOff[input.tone], sender);

  return lines.join("\n");
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
