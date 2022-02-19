# Asyncly

Javascript async utilities for async batch creation and once only function execution.

## Once Batch Manager
Queues items into a batch and executes an async function on the batch when desired batch size or timeout is met. The result of executing the batch is returned to the caller which pushed the item into the batch.

### Example Usage
````javascript

const asyncFunction = async (batch) => {
    const result = await // Do some async work here

    // This will be the result returned to all batch inserts.
    return result
}

const maxBatchSize = 3
const maxWaitTimeInMS = 1000
const onceBatchManager = new OnceBatchManager({
    maxBatchSize,
    maxWaitTimeInMS,
    asyncFunction,
})

const firstInsertPromise = onceBatchMananger.insert(0)
const secondInsertPromise = onceBatchManager.insert(1)
const result = await Promise.all([firstInsertPromise, secondInsertPromise])
````

### Notes
- Timers on a once batch will only be started after the first item is inserted into the batch.

## TODO
- Publish to npm.
- Handle execeptions being throw in the async function passed by the caller.