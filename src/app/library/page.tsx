import { LibraryDesk } from "@/components/library-desk";
import { loadLibrary } from "@/lib/payloads";

export default function LibraryPage() {
  return <LibraryDesk initial={loadLibrary()} />;
}
