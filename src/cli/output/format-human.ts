import type { SkillListEntry } from "../../core/registry/index.js";
import type { Skill } from "../../core/schema/index.js";
import type { ValidationReport } from "../../core/validate/index.js";

/** ANSI color helpers. Disabled when NO_COLOR env is set or stdout is not a TTY. */
function useColor(): boolean {
  return process.stdout.isTTY === true && process.env.NO_COLOR === undefined;
}

function colorize(text: string, code: string): string {
  return useColor() ? `\x1b[${code}m${text}\x1b[0m` : text;
}

const c = {
  green: (t: string) => colorize(t, "32"),
  yellow: (t: string) => colorize(t, "33"),
  red: (t: string) => colorize(t, "31"),
  cyan: (t: string) => colorize(t, "36"),
  bold: (t: string) => colorize(t, "1"),
  dim: (t: string) => colorize(t, "2"),
};

/** Format a skill list entry row for tabular output. */
export function formatSkillListRow(entry: SkillListEntry): string {
  if (entry.kind === "error") {
    return `${c.red("[error]")} ${entry.skillId.padEnd(42)} ${c.red(entry.error.slice(0, 60))}`;
  }
  const { skill } = entry;
  const idCol = skill.id.slice(0, 42).padEnd(42);
  const nameCol = skill.name.slice(0, 28).padEnd(28);
  const versionCol = skill.version.slice(0, 12).padEnd(12);
  const stateCol = colorizeRegistryState(skill.status.registry_state).padEnd(8);
  const validCol = colorizeValidationState(skill.status.validation_state);
  return `${idCol} ${nameCol} ${versionCol} ${stateCol} ${validCol}`;
}

/** Format the skill list header. */
export function formatSkillListHeader(): string {
  const h = c.bold;
  return (
    `${h("ID".padEnd(42))} ${h("NAME".padEnd(28))} ${h("VERSION".padEnd(12))} ` +
    `${h("STATE".padEnd(8))} ${h("VALIDATION")}`
  );
}

/** Format full skill detail view. */
export function formatSkillDetail(skill: Skill): string {
  const lines: string[] = [
    c.bold(`Skill: ${skill.name}`) + c.dim(` (${skill.id})`),
    `  Version:    ${skill.version}`,
    `  Summary:    ${skill.summary}`,
  ];

  if (skill.description) lines.push(`  Description: ${skill.description}`);
  if (skill.author) lines.push(`  Author:     ${skill.author}`);
  if (skill.license) lines.push(`  License:    ${skill.license}`);
  if (skill.tags && skill.tags.length > 0) lines.push(`  Tags:       ${skill.tags.join(", ")}`);
  if (skill.categories && skill.categories.length > 0)
    lines.push(`  Categories: ${skill.categories.join(", ")}`);

  lines.push("");
  lines.push(c.bold("Origin:"));
  lines.push(`  Type:        ${skill.origin.type}`);
  lines.push(`  URI:         ${skill.origin.uri}`);
  lines.push(`  Imported at: ${skill.origin.imported_at}`);

  lines.push("");
  lines.push(c.bold("Status:"));
  lines.push(`  Registry:   ${colorizeRegistryState(skill.status.registry_state)}`);
  lines.push(`  Validation: ${colorizeValidationState(skill.status.validation_state)}`);

  lines.push("");
  lines.push(c.bold("Compatibility:"));
  lines.push(
    `  Agents: ${skill.compatibility.agents.length > 0 ? skill.compatibility.agents.join(", ") : c.dim("(none)")}`,
  );

  if (skill.adapters && Object.keys(skill.adapters).length > 0) {
    lines.push("");
    lines.push(c.bold("Adapters:"));
    for (const [name, adapterState] of Object.entries(skill.adapters)) {
      const supported = String(adapterState.supported);
      lines.push(`  ${c.cyan(name)}:`);
      lines.push(`    Supported:       ${supported}`);
      lines.push(`    Last exported:   ${adapterState.last_exported_at ?? c.dim("never")}`);
      lines.push(`    Last imported:   ${adapterState.last_imported_at ?? c.dim("never")}`);
      if (adapterState.target_path) {
        lines.push(`    Target path:     ${adapterState.target_path}`);
      }
    }
  }

  return lines.join("\n");
}

/** Format a validation report. */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];
  const icon = report.valid
    ? report.warnings.length > 0
      ? c.yellow("⚠")
      : c.green("✓")
    : c.red("✗");

  lines.push(`${icon}  ${c.bold(report.skillId)}`);
  lines.push(`   Skill:  ${report.skillName}`);
  lines.push(`   Result: ${colorizeValidationState(report.validationState)}`);

  if (report.errors.length > 0) {
    lines.push("   Errors:");
    for (const e of report.errors) lines.push(`     ${c.red("×")} ${e}`);
  }

  if (report.warnings.length > 0) {
    lines.push("   Warnings:");
    for (const w of report.warnings) lines.push(`     ${c.yellow("!")} ${w}`);
  }

  if (report.infos.length > 0) {
    lines.push("   Info:");
    for (const i of report.infos) lines.push(`     ${c.dim("-")} ${i}`);
  }

  return lines.join("\n");
}

function colorizeRegistryState(state: string): string {
  switch (state) {
    case "active":
      return c.green(state);
    case "disabled":
      return c.yellow(state);
    case "archived":
      return c.dim(state);
    default:
      return state;
  }
}

function colorizeValidationState(state: string): string {
  switch (state) {
    case "valid":
      return c.green(state);
    case "warning":
      return c.yellow(state);
    case "invalid":
      return c.red(state);
    default:
      return c.dim(state);
  }
}
