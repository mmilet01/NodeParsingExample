import { createRequire } from "module";
const require = createRequire(import.meta.url);

export function setupIntegrationTest() {
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
}
