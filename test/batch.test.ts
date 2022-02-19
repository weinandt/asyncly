import * as assert from 'assert'
import { OnceBatch } from '../src/onceBatch'
import FakeTimers from '@sinonjs/fake-timers'

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
        const batch = new OnceBatch<number, boolean>({
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
    it('Should execute on timeout, even if batch is not full', async () => {
        // Arrange.
        const fakeTimers = FakeTimers.install()
        const resolveValue = true
        const asyncFunction = (batch: number[]): Promise<boolean> => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(resolveValue)
                }, 0)
            })
        }

        const batchSize = 3
        const waitTime = 2_000
        const batch = new OnceBatch<number, boolean>({
            maxSize: batchSize,
            asyncFunction: asyncFunction,
            maxWaitTimeInMS: waitTime
        })

        // Act
        const batchPromise = batch.addToBatchAndGetResult(1)
        fakeTimers.tick(waitTime + 1)
        const result = await batchPromise

        assert.equal(result, true, 'result should have been true')

        // Clean Up
        fakeTimers.uninstall()
    })
    it('Should execute when batch is full and timeout has not expired.', async () => {
        // Arrange.
        const resolveValue = true
        const asyncFunction = (batch: number[]): Promise<boolean> => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(resolveValue)
                }, 0)
            })
        }

        const batchSize = 2
        const waitTime = 2_000_000
        const batch = new OnceBatch<number, boolean>({
            maxSize: batchSize,
            asyncFunction: asyncFunction,
            maxWaitTimeInMS: waitTime
        })

        // Act
        const batch1Promise = batch.addToBatchAndGetResult(1)
        const batch2Promise = batch.addToBatchAndGetResult(1)
        const result = await Promise.all([batch1Promise, batch2Promise])

        assert.deepEqual(result, [true, true], 'result should have been true')
    })
    it('Can add to batch should return false if batch is full.', async () => {
        // Arrange.
        const resolveValue = true
        const asyncFunction = (batch: number[]): Promise<boolean> => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(resolveValue)
                }, 0)
            })
        }

        const batchSize = 2
        const waitTime = 2_000_000
        const batch = new OnceBatch<number, boolean>({
            maxSize: batchSize,
            asyncFunction: asyncFunction,
            maxWaitTimeInMS: waitTime
        })

        // Act
        batch.addToBatchAndGetResult(1)
        batch.addToBatchAndGetResult(1)

        // Assert
        assert.deepEqual(batch.canAddToBatch, false, 'Should not be able to add to batch.')
    })
    it('Can add to batch should return false if timer has expired.', async () => {
        // Arrange.
        const fakeTimers = FakeTimers.install()
        const resolveValue = true
        const asyncFunction = (batch: number[]): Promise<boolean> => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(resolveValue)
                }, 0)
            })
        }

        const batchSize = 2
        const waitTime = 2_000
        const batch = new OnceBatch<number, boolean>({
            maxSize: batchSize,
            asyncFunction: asyncFunction,
            maxWaitTimeInMS: waitTime
        })

        // Act
        batch.addToBatchAndGetResult(1)

        await fakeTimers.tickAsync(waitTime + 1)

        // Assert
        assert.deepEqual(batch.canAddToBatch, false, 'Should not be able to add to batch.')

        // Clean Up
        fakeTimers.uninstall()
    })
})