/**
 * `waitForJob`: the 202 path, polled with exponential backoff.
 *
 * The clock and the sleep are injected, so the suite asserts the *sequence of
 * delays* rather than waiting them out: a backoff bug (a constant delay, a
 * missing cap, a timeout that never fires) is a failed expectation here and
 * the whole file still runs in milliseconds.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FakeGateway } from 'fake-gateway';

import {
  PdfEdit,
  PdfEditError,
  PdfEditTimeoutError,
  WAIT_FOR_JOB_DEFAULTS,
  type QueuedResponse,
} from '../src/index.js';

/** A fake clock whose only hands are the sleeps the client asks for. */
function fakeTimers() {
  const delays: number[] = [];
  let clock = 0;
  return {
    delays,
    now: () => clock,
    sleep: async (ms: number) => {
      delays.push(ms);
      clock += ms;
    },
  };
}

async function withGateway<T>(
  options: ConstructorParameters<typeof FakeGateway>[0],
  body: (client: PdfEdit, gateway: FakeGateway) => Promise<T>,
): Promise<T> {
  const gateway = new FakeGateway(options);
  const baseUrl = await gateway.start();
  try {
    return await body(new PdfEdit({ apiKey: 'sk_test_1', baseUrl }), gateway);
  } finally {
    await gateway.stop();
  }
}

let gateway: FakeGateway;
let client: PdfEdit;

beforeEach(async () => {
  gateway = new FakeGateway({ asyncEdit: true, runningPolls: 3 });
  const baseUrl = await gateway.start();
  client = new PdfEdit({ apiKey: 'sk_test_1', baseUrl });
});

afterEach(async () => {
  await gateway.stop();
});

describe('WAIT_FOR_JOB_DEFAULTS', () => {
  it('documents the published defaults', () => {
    expect(WAIT_FOR_JOB_DEFAULTS).toEqual({
      timeoutMs: 90_000,
      initialDelayMs: 500,
      maxDelayMs: 8_000,
      backoffFactor: 2,
    });
  });
});

describe('waitForJob', () => {
  it('follows a 202 to the finished job, with growing delays', async () => {
    const queued = (await client.edit({
      source: { file_id: 'f_in1' },
      edits: [{ find: 'a', replace: 'b' }],
      options: { async: true },
    })) as QueuedResponse;
    expect(queued.status).toBe('queued');

    const timers = fakeTimers();
    const job = await client.waitForJob(queued.job_id, timers);

    // `partial` is terminal (jobs.TERMINAL_STATUSES = done/partial/failed).
    expect(job.status).toBe('partial');
    expect(job.job_id).toBe('job_edit_1');

    // Four polls: three `running`, then the terminal one. Three sleeps between.
    expect(gateway.to('/v1/jobs/job_edit_1')).toHaveLength(4);
    expect(timers.delays).toEqual([500, 1000, 2000]);
    // Strictly growing, which is what "exponential backoff" has to mean.
    for (let index = 1; index < timers.delays.length; index += 1) {
      expect(timers.delays[index]!).toBeGreaterThan(timers.delays[index - 1]!);
    }
  });

  it('backs off from a zero initial delay instead of spinning', async () => {
    // 0 * backoffFactor is 0: without a floor this polls as fast as the
    // network allows until the timeout, which is the opposite of backoff.
    const timers = fakeTimers();
    const job = await client.waitForJob('job_edit_1', { ...timers, initialDelayMs: 0 });

    expect(job.status).toBe('partial');
    expect(timers.delays).toEqual([1, 2, 4]);
    expect(timers.delays.every((delay) => delay > 0)).toBe(true);
  });

  it('returns on the first poll when the job is already terminal', async () => {
    const timers = fakeTimers();
    await withGateway({}, async (ready) => {
      const job = await ready.waitForJob('job_batch_1', timers);
      expect(job.status).toBe('done');
    });
    expect(timers.delays).toEqual([]);
  });

  it('caps the delay at maxDelayMs', async () => {
    const timers = fakeTimers();
    await withGateway({ runningPolls: 6 }, async (slow) => {
      await slow.waitForJob('job_edit_1', {
        ...timers,
        initialDelayMs: 100,
        maxDelayMs: 300,
      });
    });
    expect(timers.delays).toEqual([100, 200, 300, 300, 300, 300]);
  });

  it('rejects with a typed timeout error instead of polling forever', async () => {
    const timers = fakeTimers();
    const error = await withGateway({ runningPolls: 1000 }, async (never) =>
      never
        .waitForJob('job_edit_1', { ...timers, timeoutMs: 1_000, initialDelayMs: 100 })
        .catch((e: unknown) => e),
    );

    expect(error).toBeInstanceOf(PdfEditTimeoutError);
    expect(error).toBeInstanceOf(PdfEditError);
    expect((error as PdfEditTimeoutError).code).toBe('job_timeout');
    expect((error as PdfEditTimeoutError).jobId).toBe('job_edit_1');
    expect((error as PdfEditTimeoutError).lastStatus).toBe('running');
    expect((error as PdfEditTimeoutError).hint).toContain('job_edit_1');
    // It gave up inside the budget rather than sleeping past it.
    expect(timers.now()).toBeLessThan(1_000);
  });
});
