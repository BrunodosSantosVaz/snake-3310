// Readiness: the app is ready when the database answers (OBS-04). Liveness never depends on it.
export interface DatabaseProbe {
  ping(): Promise<void>;
}

export class CheckReadiness {
  constructor(private readonly probe: DatabaseProbe) {}

  async execute(): Promise<boolean> {
    try {
      await this.probe.ping();
      return true;
    } catch {
      return false;
    }
  }
}
