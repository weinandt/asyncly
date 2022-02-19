import { OnceBatch, OnceBatchConfig } from './onceBatch'

export interface OnceBatchManagerConfig<InputType, OutputType> extends OnceBatchConfig<InputType, OutputType> {}

export class OnceBatchManager<InputType, OutputType> {
    private curBatch?: OnceBatch<InputType, OutputType>
    private batchConfig: OnceBatchConfig<InputType, OutputType>

    constructor(config: OnceBatchManagerConfig<InputType, OutputType>) {
        this.batchConfig = config
    }

    public async addToBatchAndGetResult(item: InputType): Promise<OutputType> {
        // If first one or batch expired, need to create a new batch.
        if (this.curBatch == null || !this.curBatch.canAddToBatch) {
            /**
             * If there was a previous batch, it could still be executing the async function.
             * That is fine as the code referencing the old batch will keep the old batch in memory
             * despite the pointer being lost by the manager.
             */
            this.curBatch = new OnceBatch<InputType, OutputType>(this.batchConfig)
        }

        return this.curBatch.addToBatchAndGetResult(item)
    }
}