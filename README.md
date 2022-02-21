# Asyncly

Javascript async utilities for async batch creation and once only function execution.

## Once Batch Manager
Queues items into a batch and executes an async function on the batch when desired batch size or timeout is met. The result of executing the batch is returned to the caller which pushed the item into the batch. The same result is returned for every operation in the same batch.

### Example Usage
````javascript

const { OnceBatchManager } = require('asyncly')
const axios = require('axios')

const makeBatchHttpCall = async (batch) => {
    const result = await axios.post('https://yourUrlHere.com', batch)

    return result
}

const onceBatchManager = new OnceBatchManager({
    asyncFunction: makeBatchHttpCall,
    maxSize: 2,
    maxWaitTimeInMS: 2000
})

setInterval(async () => {
    const result = await onceBatchManager.addToBatchAndGetResult(123)
    console.log(result)
}, 100)
````

### Notes
- Timers on a once batch will only be started after the first item is inserted into the batch.
- Errors thrown in the async function will result in promise rejections as long as the error did not occur in a separate timer method.
