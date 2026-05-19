/**
 * coach.ts — SDK-only inferential coach command. Delegates to the bash
 * entrypoint at `extension/bin/workshop` when offline; the SDK pathway (when
 * available) augments the bash output with model-generated critique categories.
 */
import { delegate } from "./index.js";
export default function coach(args: string[]): number {
  return delegate("coach", args);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(coach(process.argv.slice(2)));
}
