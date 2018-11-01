import { SimpleJobParams } from '../../job/SimpleJobRequest';

// TODO Move to Lambda Implementation??
export type FeedDeps = {
    step_one: string,
    JobRequest: SimpleJobParams,
}

export type OneDeps = {
    step_one: string,
    step_two: string,
    JobRequest: SimpleJobParams,
}

export type WordCountDeps = {
    input_queue: string,
    output_queue: string,
    JobRequest: SimpleJobParams,
}

export type ReduceDeps = {
    input_queue: string,
    JobRequest: SimpleJobParams,
}
