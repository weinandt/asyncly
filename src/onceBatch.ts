export interface OnceBatchConfig<T, U> {
    maxSize: number
    asyncFunction: (batch: T[]) => Promise<U>
}

/**
 * Asynchronously batches an input, then executes an async function over the entire batch, just once.
 */
export class OnceBatch<InputType, ResultType> {
    private batch: InputType[]
    private maxBatchSize: number
    private finalResolve!: (value: ResultType) => void
    private finalReject!: (reason?: any) => void
    private finalPromise: Promise<ResultType>
    private asyncFunction: (batch: InputType[]) => Promise<ResultType>

    constructor(config: OnceBatchConfig<InputType,ResultType>) {
        if (config == null) {
            throw new Error('Config cannot be null.')
        }

        this.maxBatchSize = config.maxSize
        if (this.maxBatchSize == null || this.maxBatchSize < 1) {
            throw new Error('Batch size must be a number greater than 0.')
        }

        this.asyncFunction = config.asyncFunction
        if (this.asyncFunction == null) {
            throw new Error('Async function must be supplied to batch.')
        }

        this.finalPromise = new Promise<ResultType>((resolve, reject) => {
            this.finalResolve = resolve 
            this.finalReject = reject
        })

        this.batch = []
    }

    private async execute() {
        try {
            const result = await this.asyncFunction(this.batch)
            this.finalResolve(result)
        }
        catch(err) {
            this.finalReject(err)
        }
    }

    public async addToBatchAndGetResult(item: InputType) {
        this.batch.push(item)

        if (this.batch.length >= this.maxBatchSize) {
            this.execute()
        }

        return this.finalPromise
    }
}