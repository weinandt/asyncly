export interface BatchConfig<T, U> {
    maxSize: number
    asyncFunction: (batch: T[]) => Promise<U>
}

export class Batch<InputType, ResultType> {
    private batch: InputType[]
    private maxBatchSize: number
    private finalResolve!: (value: ResultType) => void
    private finalReject!: (reason?: any) => void
    private finalPromise: Promise<ResultType>
    private asyncFunction: (batch: InputType[]) => Promise<ResultType>

    constructor(config: BatchConfig<InputType,ResultType>) {
        this.maxBatchSize = config.maxSize
        this.asyncFunction = config.asyncFunction

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