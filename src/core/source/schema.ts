import { z } from "zod";

export const SourceTypeSchema = z.enum(["local_dir", "local_file", "git", "skillhub", "url"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const SourceStateSchema = z.enum(["enabled", "disabled"]);
export type SourceState = z.infer<typeof SourceStateSchema>;

export const SourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: SourceTypeSchema,
  uri: z.string().min(1),
  state: SourceStateSchema.default("enabled"),
  added_at: z.string().min(1),
  description: z.string().optional(),
});
export type Source = z.infer<typeof SourceSchema>;
