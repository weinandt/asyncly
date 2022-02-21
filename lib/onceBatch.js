"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnceBatch = void 0;
/**
 * Asynchronously batches an input, then executes an async function over the entire batch, just once.
 */
class OnceBatch {
    constructor(config) {
        if (config == null) {
            throw new Error('Config cannot be null.');
        }
        this.maxBatchSize = config.maxSize;
        if (this.maxBatchSize == null || this.maxBatchSize < 1) {
            throw new Error('Batch size must be a number greater than 0.');
        }
        this.asyncFunction = config.asyncFunction;
        if (this.asyncFunction == null) {
            throw new Error('Async function must be supplied to batch.');
        }
        this.finalPromise = new Promise((resolve, reject) => {
            this.finalResolve = resolve;
            this.finalReject = reject;
        });
        this.batch = [];
        this._canAddToBatch = true;
        this.maxWaitTimeInMS = config.maxWaitTimeInMS;
    }
    markBatchAsFullAndExecute() {
        this._canAddToBatch = false;
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
        this.execute();
    }
    async execute() {
        try {
            const result = await this.asyncFunction(this.batch);
            this.finalResolve(result);
        }
        catch (err) {
            this.finalReject(err);
        }
    }
    startTimer() {
        this.timeout = setTimeout(() => {
            this.markBatchAsFullAndExecute();
        }, this.maxWaitTimeInMS);
        this.timeout.unref();
    }
    async addToBatchAndGetResult(item) {
        this.batch.push(item);
        // If this is the first item and timouts are configured, should start timer.
        if (this.batch.length == 1 && this.maxWaitTimeInMS != null) {
            this.startTimer();
        }
        if (this.batch.length >= this.maxBatchSize) {
            this.markBatchAsFullAndExecute();
        }
        return this.finalPromise;
    }
    get canAddToBatch() {
        return this._canAddToBatch;
    }
}
exports.OnceBatch = OnceBatch;
//# sourceMappingURL=onceBatch.js.map