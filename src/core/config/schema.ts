import { z } from "zod";

export const SkillRelayConfigSchema = z.object({
  /** Default registry root path. Defaults to `~/.skillrelay`. */
  default_registry: z.string().optional(),
  /** Default adapter for export operations. */
  default_adapter: z.string().optional(),
  /** Whether to enable colored output by default. */
  color: z.boolean().optional(),
  /** Log level for internal diagnostics. */
  log_level: z.enum(["debug", "info", "warn", "error"]).optional(),
});

export type SkillRelayConfig = z.infer<typeof SkillRelayConfigSchema>;

export const DEFAULT_CONFIG: SkillRelayConfig = {};
