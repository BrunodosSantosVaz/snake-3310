// Readiness: the app is ready when the database answers (RN-0003). Liveness never depends on it.
export interface DatabaseProbe {
  ping(): Promise<void>;
}

export class CheckReadiness {
  // report tells the operator why the app is not ready; the client never sees it (OBS-05, SEG-13).
  constructor(
    private readonly probe: DatabaseProbe,
    private readonly report: (error: unknown) => void = () => undefined,
  ) {}

  async execute(): Promise<boolean> {
    try {
      await this.probe.ping();
      return true;
    } catch (error) {
      this.report(error);
      return false;
    }
  }
}
