import { OnceBatchConfig } from './onceBatch';
export interface OnceBatchManagerConfig<InputType, OutputType> extends OnceBatchConfig<InputType, OutputType> {
}
export declare class OnceBatchManager<InputType, OutputType> {
    private curBatch?;
    private batchConfig;
    constructor(config: OnceBatchManagerConfig<InputType, OutputType>);
    addToBatchAndGetResult(item: InputType): Promise<OutputType>;
}
