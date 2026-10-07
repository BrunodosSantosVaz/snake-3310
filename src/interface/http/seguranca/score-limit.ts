const windowMilliseconds = 60000;
const maxAttempts = 5;
type Counter = { attempts: number; expires: number };
function retrySeconds(expires: number, now: number): number {
  return Math.max(1, Math.min(60, Math.ceil((expires - now) / 1000)));
}

// RN-0006: process-local fixed windows; saturation denies new identities instead of evicting blocked clients.
export class ScoreLimit {
  private readonly counters = new Map<string, Counter>();
  constructor(private readonly now: () => number = Date.now, private readonly capacity = 4096) {}

  get activeClients(): number { return this.counters.size; }

  take(client: string): number | null {
    const now = this.now();
    for (const [key, counter] of this.counters) if (counter.expires <= now) this.counters.delete(key);
    let counter = this.counters.get(client);
    if (!counter) {
      if (this.counters.size >= this.capacity) {
        const earliest = Math.min(...[...this.counters.values()].map(({ expires }) => expires));
        return retrySeconds(earliest, now);
      }
      counter = { attempts: 0, expires: now + windowMilliseconds };
      this.counters.set(client, counter);
    }
    if (counter.attempts >= maxAttempts) return retrySeconds(counter.expires, now);
    counter.attempts++;
    return null;
  }
}
