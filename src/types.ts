export type PullStatus = "ok" | "skipped-dirty" | "error";

export interface TrackedRepo {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  path: string;
  clonedAt: string;
  lastPullAt?: string;
  lastPullStatus?: PullStatus;
  lastError?: string;
}

export interface CommonOptions {
  token?: string;
  root: string;
  db: string;
  repo?: string;
  verbose: boolean;
}

export interface RemoteRepo {
  owner: string;
  name: string;
  fullName: string;
  cloneUrl: string;
}
