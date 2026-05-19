/**
 * scaffold.ts — SDK adapter for `workshop scaffold`. Delegates to the bash
 * entrypoint via `extension/bin/workshop`.
 */
import { delegate } from "./index.js";
export default function scaffold(args: string[]): number {
  return delegate("scaffold", args);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(scaffold(process.argv.slice(2)));
}
