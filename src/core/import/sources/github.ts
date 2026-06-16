import { SourceError } from "../../errors/index.js";

/**
 * Parsed representation of a `github:` URI.
 *
 * Accepted formats:
 *   github:<owner>/<repo>/<path>[@<ref>]
 *
 * Examples:
 *   github:acme/my-skills/review.md
 *   github:acme/my-skills/skills/code-review.md@main
 *   github:acme/my-skills/skills/code-review.md@v1.2.3
 */
export interface GithubSkillRef {
  owner: string;
  repo: string;
  path: string;
  /** Branch, tag, or commit SHA. Defaults to "main". */
  ref: string;
  /** The resolved raw.githubusercontent.com URL. */
  rawUrl: string;
}

const GITHUB_PREFIX = "github:";

/**
 * Parse a `github:` URI into its components and compute the raw content URL.
 *
 * @throws `SourceError` if the URI does not conform to the expected format.
 */
export function parseGithubUri(uri: string): GithubSkillRef {
  if (!uri.startsWith(GITHUB_PREFIX)) {
    throw new SourceError(`Not a github: URI: ${uri}`);
  }

  const rest = uri.slice(GITHUB_PREFIX.length);

  // Split off optional @ref suffix
  const atIdx = rest.lastIndexOf("@");
  let pathPart: string;
  let ref: string;

  if (atIdx !== -1) {
    pathPart = rest.slice(0, atIdx);
    ref = rest.slice(atIdx + 1);
    if (ref.length === 0) {
      throw new SourceError(`Empty ref in github: URI: ${uri}`);
    }
  } else {
    pathPart = rest;
    ref = "main";
  }

  // Expect at least owner/repo/path
  const slashIdx = pathPart.indexOf("/");
  if (slashIdx === -1) {
    throw new SourceError(
      `github: URI must be in the form github:<owner>/<repo>/<path>[@<ref>], got: ${uri}`,
    );
  }

  const owner = pathPart.slice(0, slashIdx);
  const afterOwner = pathPart.slice(slashIdx + 1);

  const slashIdx2 = afterOwner.indexOf("/");
  if (slashIdx2 === -1) {
    throw new SourceError(
      `github: URI must be in the form github:<owner>/<repo>/<path>[@<ref>], got: ${uri}`,
    );
  }

  const repo = afterOwner.slice(0, slashIdx2);
  const path = afterOwner.slice(slashIdx2 + 1);

  if (owner.length === 0 || repo.length === 0 || path.length === 0) {
    throw new SourceError(`github: URI has empty owner, repo, or path: ${uri}`);
  }

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;

  return { owner, repo, path, ref, rawUrl };
}
