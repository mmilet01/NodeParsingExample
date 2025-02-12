import fs from "fs";
import path from "path";
import { getTextDataInBetweenBrackets, extractUrl } from "./src/utils/utils.js";
import RequestQueue from "./src/queue/requestQueue.js";
import { processUrl } from "./src/network/urlService.js";
import { setupIntegrationTest } from "./src/test/setupIntegrationTest.js";

setupIntegrationTest();
main();

const delay = 1000;
const requestQueue = new RequestQueue(delay);
const processedUrls = new Set<string>();

function main() {
  const filePath = process.argv[2];

  if (filePath) {
    const absolutePath = path.resolve(process.cwd(), filePath);
    let buffer = "";

    const stream = fs.createReadStream(absolutePath, {
      encoding: "utf8",
      highWaterMark: 1024,
    });

    stream.on("data", (chunk) => {
      const textChunk = buffer + chunk.toString();
      buffer = processChunkOfTextData(textChunk);
    });

    stream.on("end", async () => {
      buffer = processChunkOfTextData(buffer);
      await requestQueue.waitForQueueToBeEmpty();
    });

    stream.on("error", (err) => {
      console.error("Error reading file:", err);
    });
  } else {
    let buffer = "";

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => {
      buffer += chunk;
      const { results, lastCompleteIndex } =
        getTextDataInBetweenBrackets(buffer);

      if (results.length > 0) {
        for (const textData of results) {
          const url = extractUrl(textData);
          if (url && !processedUrls.has(url)) {
            processedUrls.add(url);
            requestQueue.add(processUrl(url));
          }
        }
        buffer = buffer.slice(lastCompleteIndex);
      }
    });

    process.stdin.on("end", async () => {
      processChunkOfTextData(buffer);
      await requestQueue.waitForQueueToBeEmpty();
    });
  }
}

function processChunkOfTextData(text: string): string {
  const { results, lastCompleteIndex } = getTextDataInBetweenBrackets(text);

  for (const textData of results) {
    const url = extractUrl(textData);
    if (url && !processedUrls.has(url)) {
      processedUrls.add(url);
      requestQueue.add(processUrl(url));
    }
  }

  return text.slice(lastCompleteIndex);
}
