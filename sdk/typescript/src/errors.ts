/**
 * The gateway's error envelope as an exception.
 *
 * Every failure the API reports is `{"error": {"code", "message", "hint?"}}`
 * and `code` is the stable part -- the string
 * a caller switches on (`quota_exceeded`, `signed_document`, `rate_limited`),
 * while `message` is prose and `hint` is the sentence to show a human.
 * `PdfEditError` keeps all three plus the HTTP status.
 *
 * A body that is *not* that envelope still has to arrive as a `PdfEditError`:
 * a load balancer's HTML 502 or a truncated response otherwise surfaces as a
 * `SyntaxError` from `JSON.parse`, losing the status code, which is the one
 * piece of information a retry decision needs. Hence `code` falls back to
 * `http_<status>`.
 */

/** A failure the PDF Edit API reported, or a non-JSON response standing in for one. */
export class PdfEditError extends Error {
  /** The envelope's `error.code`, or `http_<status>` when there was no envelope. */
  readonly code: string;
  /** The envelope's `error.hint`, when the gateway sent one. */
  readonly hint: string | undefined;
  /** The HTTP status, when the failure came from a response at all. */
  readonly status: number | undefined;

  constructor(code: string, message: string, hint?: string, status?: number) {
    super(message);
    this.name = 'PdfEditError';
    this.code = code;
    this.hint = hint;
    this.status = status;
  }

  /** `code: message (hint)` -- what a CLI or a tool result shows. */
  toString(): string {
    const head = `${this.name}: ${this.code}: ${this.message}`;
    return this.hint ? `${head} (${this.hint})` : head;
  }

  /** Parse a non-2xx `Response` into an error, consuming its body. */
  static async fromResponse(response: Response): Promise<PdfEditError> {
    let code = `http_${response.status}`;
    let message = `${response.status} ${response.statusText}`.trim();
    let hint: string | undefined;
    try {
      const body = (await response.json()) as { error?: unknown };
      const error = body?.error;
      if (error && typeof error === 'object') {
        const envelope = error as { code?: unknown; message?: unknown; hint?: unknown };
        if (typeof envelope.code === 'string') code = envelope.code;
        if (typeof envelope.message === 'string') message = envelope.message;
        if (typeof envelope.hint === 'string') hint = envelope.hint;
      }
    } catch {
      /* not JSON (a proxy error page, a truncated body): keep the status line */
    }
    return new PdfEditError(code, message, hint, response.status);
  }
}

/**
 * `waitForJob` gave up before the job reached a terminal status.
 *
 * Not a failure of the job: it may still finish. `jobId` and `lastStatus` are
 * carried so the caller can keep polling (or report the id to support)
 * instead of having to re-derive them.
 */
export class PdfEditTimeoutError extends PdfEditError {
  readonly jobId: string;
  /** The last status the poll saw -- `queued` or `running`. */
  readonly lastStatus: string;
  readonly timeoutMs: number;

  constructor(jobId: string, lastStatus: string, timeoutMs: number) {
    super(
      'job_timeout',
      `Job ${jobId} was still '${lastStatus}' after ${timeoutMs} ms`,
      `the job is still running; poll client.job('${jobId}') or raise timeoutMs`,
    );
    this.name = 'PdfEditTimeoutError';
    this.jobId = jobId;
    this.lastStatus = lastStatus;
    this.timeoutMs = timeoutMs;
  }
}
