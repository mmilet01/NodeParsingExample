class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing = false;
  private delayMs: number;

  constructor(delayMs = 1000) {
    this.delayMs = delayMs;
  }

  add(processUrlFunction: () => Promise<void>) {
    this.queue.push(processUrlFunction);
    this.process();
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const processUrlFunction = this.queue.shift();
      if (processUrlFunction) {
        await processUrlFunction();
        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
    }

    this.isProcessing = false;
  }
}

export default RequestQueue;
