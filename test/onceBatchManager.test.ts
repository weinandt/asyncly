import * as assert from 'assert'
import { OnceBatchManager } from '../src/onceBatchManager'
import FakeTimers from '@sinonjs/fake-timers'

describe('OnceBatchManager', () => {
    it('Multiple batches can execute in parallel', async () => {
        const asyncFunction = (batch: number[]): Promise<boolean> => {
            return new Promise(resolve => {
                setTimeout(() => {
                    if (batch[0] == 0) {
                        resolve(true)
                    }
                    else {
                        resolve(false)
                    }
                }, 0)
            })
        }

        const batchSize = 1
        const batch = new OnceBatchManager<number, boolean>({
            maxSize: batchSize,
            asyncFunction: asyncFunction
        })

        // Act
        const batchPromise1 = batch.addToBatchAndGetResult(0)
        const batchPromise2 = batch.addToBatchAndGetResult(1)
        const result = await Promise.all([batchPromise1, batchPromise2])

        assert.deepEqual(result, [true, false], 'result should have been true')
    })
})