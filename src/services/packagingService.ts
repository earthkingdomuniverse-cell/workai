// Simple Packaging Service (in-memory state) to track packaging status
export type PackagingStatus = 'idle' | 'building' | 'ready' | 'deploying' | 'published';

export interface PackagingState {
  status: PackagingStatus;
  lastUpdated: string;
  version?: string;
  note?: string;
}

class PackagingService {
  private state: PackagingState = {
    status: 'idle',
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
  };

  getState(): PackagingState {
    return this.state;
  }

  startBuild(note?: string) {
    this.state.status = 'building';
    this.state.lastUpdated = new Date().toISOString();
    this.state.note = note;
  }

  markReady(version?: string) {
    this.state.status = 'ready';
    this.state.lastUpdated = new Date().toISOString();
    if (version) this.state.version = version;
  }

  deploy(note?: string) {
    this.state.status = 'deploying';
    this.state.lastUpdated = new Date().toISOString();
    this.state.note = note;
  }

  publish(version?: string) {
    this.state.status = 'published';
    this.state.lastUpdated = new Date().toISOString();
    if (version) this.state.version = version;
  }
}

export const packagingService = new PackagingService();
export default packagingService;
