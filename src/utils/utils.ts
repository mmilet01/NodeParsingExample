import crypto from "crypto";

export function getTextDataInBetweenBrackets(text: string): {
  results: string[];
  lastCompleteIndex: number;
} {
  let results: string[] = [];
  let bracketCounter = 0;
  let start = 0;
  let escapedChar = false;
  let lastCompleteIndex = 0;

  let lastIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (escapedChar) {
      escapedChar = false;
      continue;
    }
    if (char === "\\") {
      escapedChar = true;
      continue;
    }
    if (char === "[") {
      if (bracketCounter === 0) start = i + 1;
      bracketCounter++;
    } else if (char === "]") {
      if (bracketCounter > 0) {
        bracketCounter--;
        if (bracketCounter === 0) {
          const content = text.substring(start, i);
          results.push(content);
          lastCompleteIndex = i + 1;
        }
      }
    }

    lastIndex = i;
  }
  if (bracketCounter === 0) lastCompleteIndex = lastIndex;

  return { results, lastCompleteIndex };
}

export function extractTitle(html: string): string | null {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

export function extractEmail(html: string): string | null {
  const match = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return match ? match[0] : null;
}

export function hashEmail(email: string): string {
  return crypto
    .createHmac("sha256", process.env.IM_SECRET || "default_secret")
    .update(email)
    .digest("hex");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function extractUrl(content: string): string | null {
  const regex =
    /(?:(?:https?:\/\/)?(?:www\.)[\w.-]+\.[A-Za-z]{2,}(?:\/[^\s\]]*)?)/gi;
  let matches: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[0].trim());
  }
  return matches.length > 0 ? matches[matches.length - 1] : null;
}
