import { Cloud } from './Cloud'
import { SchedulingStrategy } from '../scheduling/SchedulingStrategy'
import { Interval } from '../../lib/Interval';
import { IntervalExecution } from '../../lib/IntervalExecution';

/**
 * A `CloudController` takes a `Cloud` and a `SchedulingStrategy`. 
 * It spawns the `Cloud` and reschedules at a certain interval by calling `SchedulingStrategy.schedule()`.
 */
export class CloudController<T extends Cloud> {

    private cloud: T
    private strategy: SchedulingStrategy<T>
    private interval: Interval

    constructor(cloud: T, strategy: SchedulingStrategy<T>, interval: Interval) {
        this.cloud = cloud
        this.strategy = strategy
        this.interval = interval
    }

    start(): Promise<IntervalExecution> {
        console.log('CloudController: start')
        return this.cloud.spawn()
                .then(() => {
                    this.tick()
                    return this.interval.onEvery(this.tick.bind(this))
                })
    }

    /** At a certain interval, adjust the schedule */
    async tick() {
        console.log('CloudController: tick')
        this.strategy.schedule(this.cloud)
    }

}
