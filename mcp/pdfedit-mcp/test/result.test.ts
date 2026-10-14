/** The preview byte budget: what `fetchPreviews` will and will not attach. */
import { describe, expect, it } from 'vitest';

import type { GatewayClient } from '../src/client.js';
import { MAX_PREVIEWS, PREVIEW_BUDGET_BYTES, fetchPreviews } from '../src/result.js';

/** A client whose previews are all `size` bytes, counting the downloads. */
function clientOf(size: number): { client: GatewayClient; urls: string[] } {
  const urls: string[] = [];
  const client = {
    async getUrl(url: string) {
      urls.push(url);
      return { bytes: new Uint8Array(size), contentType: 'image/png' };
    },
  } as unknown as GatewayClient;
  return { client, urls };
}

function responseOf(count: number): unknown {
  return { changes: Array.from({ length: count }, (_, index) => ({ preview_url: `https://x/p${index}.png` })) };
}

describe('fetchPreviews', () => {
  it('states the budget the spec gives it', () => {
    expect(PREVIEW_BUDGET_BYTES).toBe(600 * 1024);
  });

  it('attaches every preview that fits inside the 600 KB budget', async () => {
    const { client, urls } = clientOf(200 * 1024);
    const images = await fetchPreviews(responseOf(MAX_PREVIEWS), client);
    expect(images).toHaveLength(MAX_PREVIEWS);
    expect(urls).toHaveLength(MAX_PREVIEWS);
    const total = images.reduce((sum, image) => sum + Buffer.from(image.data, 'base64').byteLength, 0);
    expect(total).toBeLessThanOrEqual(PREVIEW_BUDGET_BYTES);
  });

  it('stops at the preview that would cross the budget', async () => {
    // 250 KB each: two fit (500 KB), the third would reach 750 KB.
    const { client } = clientOf(250 * 1024);
    const images = await fetchPreviews(responseOf(MAX_PREVIEWS), client);
    expect(images).toHaveLength(2);
  });

  it('attaches nothing when the first preview alone exceeds the budget', async () => {
    const { client } = clientOf(PREVIEW_BUDGET_BYTES + 1);
    expect(await fetchPreviews(responseOf(1), client)).toEqual([]);
  });
});
