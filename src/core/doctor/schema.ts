export type DoctorCheckLevel = "ok" | "warn" | "error" | "info";

export interface DoctorIssue {
  level: DoctorCheckLevel;
  category: string;
  message: string;
  suggestion?: string;
}

export interface DoctorReport {
  registryRoot: string;
  registryInitialized: boolean;
  skillCount: number;
  softDeletedCount: number;
  issues: DoctorIssue[];
  /** True if no error-level issues were found. */
  healthy: boolean;
}
