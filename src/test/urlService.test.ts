import { expect } from "chai";
import nock from "nock";
import { fetchUrl } from "../network/urlService.js";

// Create a fast sleep function that resolves immediately.
const fastSleep = (ms: number) => Promise.resolve();

describe("URL Service Retry Logic", function () {
  this.timeout(5000);

  afterEach(() => {
    nock.cleanAll();
  });

  it("should retry once and succeed if the first attempt fails", async () => {
    let callCount = 0;
    nock("http://www.retrytest.com")
      .get("/")
      .times(2)
      .reply(() => {
        callCount++;
        if (callCount === 1) {
          return [500, "Server error"];
        } else {
          return [
            200,
            `<html><head><title>Retry Test</title></head><body>Contact: retry@example.com</body></html>`,
          ];
        }
      });

    const result = await fetchUrl("http://www.retrytest.com", fastSleep);
    expect(result.success).to.be.true;
    expect(result.data).to.include("Retry Test");
  });

  it("should fail if both attempts fail", async () => {
    nock("http://www.retryfail.com")
      .get("/")
      .times(2)
      .reply(500, "Server error");

    const result = await fetchUrl("http://www.retryfail.com", fastSleep);
    expect(result.success).to.be.false;
  });
});
