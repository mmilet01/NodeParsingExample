import { expect } from "chai";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testData = `
      test file.
      [ www.test.com ]
      Some text.
      [ some text www.second.com text ]
    `;

describe("Integration Tests", function () {
  this.timeout(30000);

  it("should process a file and output correct JSON lines", function (done) {
    const tmpFilePath = path.join(__dirname, "temp_test_data.txt");
    fs.writeFileSync(tmpFilePath, testData, "utf8");

    const child = spawn("node", [path.join("dist", "index.js"), tmpFilePath], {
      env: { ...process.env, USE_NOCK: "true" },
    });

    let output = "";
    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", () => {
      try {
        assertions(output);
        fs.unlinkSync(tmpFilePath);
        done();
      } catch (err) {
        fs.unlinkSync(tmpFilePath);
        done(err);
      }
    });
  });

  it("should process input from stdin and output correct JSON lines", function (done) {
    const child = spawn("node", [path.join("dist", "index.js")], {
      env: { ...process.env, USE_NOCK: "true" },
    });

    let output = "";
    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stdin.write(testData);

    child.on("close", () => {
      try {
        assertions(output);
        done();
      } catch (err) {
        done(err);
      }
    });

    child.stdin.end();
  });
});

function assertions(output: string) {
  const lines = output
    .trim()
    .split("\n")
    .filter((line) => line);
  expect(lines).to.have.lengthOf(2);
  const results = lines.map((line) => JSON.parse(line));
  const page1 = results.find((r) => r.url === "www.test.com");
  const page2 = results.find((r) => r.url === "www.second.com");

  expect(page1).to.exist;
  expect(page1.title).to.equal("Test Page");
  expect(page1.email).to.be.a("string");
  expect(page1.email).to.have.lengthOf(64);

  expect(page2).to.exist;
  expect(page2.title).to.equal("Second Page");
  expect(page2.email).to.be.undefined;
}
