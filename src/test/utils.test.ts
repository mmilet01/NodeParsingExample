import { expect } from "chai";
import {
  getTextDataInBetweenBrackets,
  extractUrl,
  extractTitle,
  extractEmail,
  hashEmail,
} from "../utils/utils.js";

process.env.IM_SECRET = "test_secret";

describe("Utility Functions", () => {
  describe("getTextDataInBetweenBrackets", () => {
    it("should ignore escaped brackets", () => {
      const text = "asdf \\[www.google.com]";
      const { results } = getTextDataInBetweenBrackets(text);
      expect(results).to.have.lengthOf(0);
    });

    it("should detect URL in a simple bracket pair", () => {
      const text = "[ www.google.com ]";
      const { results } = getTextDataInBetweenBrackets(text);
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.equal(" www.google.com ");
    });

    it("should return no results for an incomplete bracket pair", () => {
      const text = "Start [ www.google.com with no closing";
      const { results } = getTextDataInBetweenBrackets(text);
      expect(results).to.have.lengthOf(0);
    });

    it("should handle multiple bracket pairs", () => {
      const text = "Text [ first.com ] more text [ second.com ] end";
      const { results } = getTextDataInBetweenBrackets(text);
      expect(results).to.have.lengthOf(2);
      expect(results[0]).to.equal(" first.com ");
      expect(results[1]).to.equal(" second.com ");
    });

    it("should flatten nested brackets", () => {
      const text = "multiple levels[ [www.first.com] www.second.com]";
      const { results } = getTextDataInBetweenBrackets(text);
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.equal(" [www.first.com] www.second.com");
    });
  });

  describe("extractUrl", () => {
    it("should extract a URL from a string", () => {
      const content = "Visit www.google.com for info";
      const url = extractUrl(content);
      expect(url).to.equal("www.google.com");
    });

    it("should extract the last URL if multiple URLs are present", () => {
      const content = "Check www.first.com then www.second.com";
      const url = extractUrl(content);
      expect(url).to.equal("www.second.com");
    });

    it("should return null if no URL is found", () => {
      const content = "No URL here!";
      const url = extractUrl(content);
      expect(url).to.be.null;
    });
  });

  describe("extractTitle", () => {
    it("should extract title from HTML", () => {
      const html =
        "<html><head><title> My Page Title </title></head><body></body></html>";
      const title = extractTitle(html);
      expect(title).to.equal("My Page Title");
    });

    it("should return null if no title tag is present", () => {
      const html = "<html><head></head><body></body></html>";
      const title = extractTitle(html);
      expect(title).to.be.null;
    });
  });

  describe("extractEmail", () => {
    it("should extract the first email from text", () => {
      const text = "Contact us at support@example.com or sales@example.com";
      const email = extractEmail(text);
      expect(email).to.equal("support@example.com");
    });

    it("should return null if no email is present", () => {
      const text = "No emails here!";
      const email = extractEmail(text);
      expect(email).to.be.null;
    });
  });

  describe("hashEmail", () => {
    it("should return a SHA-256 hash string of 64 hex characters", () => {
      const email = "support@example.com";
      const hash = hashEmail(email);
      expect(hash).to.be.a("string");
      expect(hash).to.have.lengthOf(64);
    });

    it("should produce different hashes for different emails", () => {
      const hash1 = hashEmail("a@example.com");
      const hash2 = hashEmail("b@example.com");
      expect(hash1).to.not.equal(hash2);
    });
  });
});
