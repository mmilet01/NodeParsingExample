import fs from "fs";
import path from "path";
import { getTextDataInBetweenBrackets, extractUrl } from "./src/utils/utils.js";
import RequestQueue from "./src/queue/requestQueue.js";
import { processUrl } from "./src/network/urlService.js";

// for integration test
import { createRequire } from "module";
const require = createRequire(import.meta.url);

if (process.env.USE_NOCK === "true") {
  const nock = require("nock");
  nock("http://www.test.com")
    .persist()
    .get("/")
    .reply(
      200,
      `<html><head><title>Test Page</title></head><body>Contact: test@example.com</body></html>`
    );
  nock("http://www.second.com")
    .persist()
    .get("/")
    .reply(
      200,
      `<html><head><title>Second Page</title></head><body>No email here</body></html>`
    );
}
// till here

const requestQueue = new RequestQueue(1000);
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
      const textChunk = chunk.toString() + buffer;
      buffer = processChunkOfTextData(textChunk);
    });

    stream.on("end", () => {
      buffer = processChunkOfTextData(buffer);
      setTimeout(() => process.exit(0), 2000);
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

    process.stdin.on("end", () => {
      processChunkOfTextData(buffer);
      setTimeout(() => process.exit(0), 2000);
    });
  }
}

main();

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
