import * as assert from 'assert'
import { Batch } from '../src/batch'

describe('Batch tests.', () => {
    it('Function should only execute once.', async () => {
        // Arrange.
        let numExecutions = 0
        const resolveValue = true
        const asyncFunction = (batch: number[]): Promise<boolean> => {
            numExecutions++
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(resolveValue)
                }, 0)
            })
        }

        const batchSize = 3
        const batch = new Batch<number, boolean>({
            maxSize: batchSize,
            asyncFunction: asyncFunction
        })

        // Act.
        const promises: Promise<boolean>[] = []
        for (let i = 0; i < batchSize; i++) {
            promises.push(batch.addToBatchAndGetResult(i))
        }

        const results = await Promise.all(promises)

        // Assert
        results.forEach(result => assert.equal(result, true, 'Result should have been true'))
        assert.equal(numExecutions, 1, 'function should only be called once.')
    })
})