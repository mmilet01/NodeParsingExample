import { expect } from "chai";
import RequestQueue from "../queue/requestQueue.js";

describe("RequestQueue", function () {
  this.timeout(5000);

  it("should enforce delay between tasks", async () => {
    const delay = 1000;
    const queue = new RequestQueue(delay);
    const timestamps: number[] = [];
    const tasks: (() => Promise<void>)[] = [
      () => {
        timestamps.push(Date.now());
        return Promise.resolve();
      },
      () => {
        timestamps.push(Date.now());
        return Promise.resolve();
      },
    ];

    tasks.forEach((task) => queue.add(task));

    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(timestamps[1] - timestamps[0]).to.be.at.least(delay);
  });
});
