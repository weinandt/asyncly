export interface OnceBatchConfig<T, U> {
    maxSize: number;
    asyncFunction: (batch: T[]) => Promise<U>;
    maxWaitTimeInMS?: number;
}
/**
 * Asynchronously batches an input, then executes an async function over the entire batch, just once.
 */
export declare class OnceBatch<InputType, ResultType> {
    private batch;
    private maxBatchSize;
    private finalResolve;
    private finalReject;
    private finalPromise;
    private asyncFunction;
    private _canAddToBatch;
    private maxWaitTimeInMS?;
    private timeout?;
    constructor(config: OnceBatchConfig<InputType, ResultType>);
    private markBatchAsFullAndExecute;
    private execute;
    private startTimer;
    addToBatchAndGetResult(item: InputType): Promise<ResultType>;
    get canAddToBatch(): boolean;
}
