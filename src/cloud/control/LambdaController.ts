import { Lambda } from 'aws-sdk';
import { HasMetrics } from '../metrics/HasMetrics'
import { LambdaMetrics } from '../metrics/LambdaMetrics'

/**
 * A `LambdaController` controls the amount of "workers" by invoking the `Lambda` it represents.
 * The amount of concurrent invocations is controlled by `LambdaController.setGoal(number)`.
 * 
 * Along with each invocation it passes the `Dependencies` which are the `QueueName`s
 * of the `Queue`s this `Lambda` depends upon.
 * 
 * For monitoring and scheduling, it can return `LambdaMetrics`
 */
export class LambdaController<T extends Object> implements HasMetrics<LambdaMetrics> {
    private deps: T
    private lambdaClient: Lambda
    private name: string
    private invocations: any[] = []
    private pending: number = 0
    private goal = 0

    constructor(lambdaClient: Lambda, lambdaName: string, dependencies: T) {
        this.deps = dependencies
        this.name = lambdaName
        this.lambdaClient = lambdaClient
    }


    run() {
        if (this.invocations.length < this.goal) {
            this.spawnWorker().then(() => this.run())
        }
    }

    /** Add workers until goal is satisfied */
    async scaleUpUntil(numberOfWorkers: number) {
        // Adjust the goal
        this.goal = numberOfWorkers

        // Spawn until goal reached
        while (this.invocations.length + this.pending < numberOfWorkers) {
            await this.spawnWorker()
        }
    }

    private spawnWorker() {
        this.pending++
        console.log(`LambdaController(${this.name}): spawning..`)
        return new Promise((resolve, reject) => {
            this.lambdaClient.invoke({
                FunctionName: this.name,
                InvocationType: "Event",
                Payload: JSON.stringify(this.deps) }, (err, data) => {
                if (err) {
                    console.error(`LambdaController(${this.name}): could not invoke.`, err)
                    reject(err)
                } else {
                    console.log(`LambdaController(${this.name}): successfully invoked.`)
                    this.invocations.push(data)
                    resolve(data)
                }
                this.pending--
            })
        })
    }

    getMetrics(): LambdaMetrics {
        return new LambdaMetrics(this.invocations.length)
    }

}
