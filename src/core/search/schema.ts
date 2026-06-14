import { z } from "zod";

export const SearchOptionsSchema = z.object({
  tag: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
});

export type SearchOptions = z.infer<typeof SearchOptionsSchema>;

export interface SearchResult {
  skill: import("../schema/index.js").Skill;
  score: number;
  matchReasons: string[];
}
