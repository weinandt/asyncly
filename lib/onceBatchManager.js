"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnceBatchManager = void 0;
const onceBatch_1 = require("./onceBatch");
class OnceBatchManager {
    constructor(config) {
        this.batchConfig = config;
    }
    async addToBatchAndGetResult(item) {
        // If first one or batch expired, need to create a new batch.
        if (this.curBatch == null || !this.curBatch.canAddToBatch) {
            /**
             * If there was a previous batch, it could still be executing the async function.
             * That is fine as the code referencing the old batch will keep the old batch in memory
             * despite the pointer being lost by the manager.
             */
            this.curBatch = new onceBatch_1.OnceBatch(this.batchConfig);
        }
        return this.curBatch.addToBatchAndGetResult(item);
    }
}
exports.OnceBatchManager = OnceBatchManager;
//# sourceMappingURL=onceBatchManager.js.map