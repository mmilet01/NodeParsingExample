import got from "got";
import { sleep } from "../utils/utils.js";
import { extractEmail, extractTitle, hashEmail } from "../utils/utils.js";

export async function fetchUrl(
  url: string,
  sleepFn: (ms: number) => Promise<void> = sleep
): Promise<{ success: boolean; url: string; data?: string }> {
  try {
    const response = await got(url, { timeout: { request: 30000 } });
    return { success: true, url, data: response.body };
  } catch (error: any) {
    await sleepFn(60000);
    try {
      const response = await got(url, { timeout: { request: 30000 } });
      return { success: true, url, data: response.body };
    } catch (error2: any) {
      console.error(`Error fetching ${url} with got: ${error2.message}`);
      return { success: false, url };
    }
  }
}

export function processUrl(url: string): () => Promise<void> {
  return async () => {
    const fullUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : "http://" + url;

    const result = await fetchUrl(fullUrl);
    if (result.success && result.data) {
      const title = extractTitle(result.data);
      const email = extractEmail(result.data);
      logResponse(url, title, email ? hashEmail(email) : null);
    }
  };
}

function logResponse(url: string, title: string | null, email: string | null) {
  const output: { url: string; title?: string; email?: string } = { url };
  if (title) output.title = title;
  if (email) output.email = email;
  console.log(JSON.stringify(output));
}
