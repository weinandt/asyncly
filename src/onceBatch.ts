export interface OnceBatchConfig<T, U> {
    maxSize: number
    asyncFunction: (batch: T[]) => Promise<U>
    maxWaitTimeInMS?: number
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
    private _canAddToBatch: boolean
    private maxWaitTimeInMS?: number
    private timeout?: NodeJS.Timeout

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
        this._canAddToBatch = true
        this.maxWaitTimeInMS = config.maxWaitTimeInMS
    }

    private markBatchAsFullAndExecute() {
        this._canAddToBatch = false
        if (this.timeout != null) {
            clearTimeout(this.timeout)
        }

        this.execute()
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

    private startTimer() {
        this.timeout = setTimeout(() => {
            this.markBatchAsFullAndExecute()
        }, this.maxWaitTimeInMS)
        this.timeout.unref()
    }

    public async addToBatchAndGetResult(item: InputType) {
        this.batch.push(item)

        // If this is the first item and timouts are configured, should start timer.
        if (this.batch.length == 1 && this.maxWaitTimeInMS != null) {
            this.startTimer()
        }

        if (this.batch.length >= this.maxBatchSize) {
            this.markBatchAsFullAndExecute()
        }

        return this.finalPromise
    }

    public get canAddToBatch(): boolean {
        return this._canAddToBatch
    }
}