import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useFleet } from "../../hooks/FleetContext";

const PROMPTS = [
  "Which vessels are approaching Marunda?",
  "Show tankers near Jakarta.",
  "Where is MT ARUN WAVE?",
  "What vessels are currently anchored?",
];

export function AssistantPanel() {
  const { ask } = useFleet();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ q: string; a: string }[]>([]);

  function submit(q: string) {
    const question = q.trim();
    if (!question) return;
    const answer = ask(question);
    setLog((prev) => [...prev, { q: question, a: answer.text }]);
    setInput("");
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-20 right-3 z-20 flex h-8 items-center gap-2 border border-[#2a3a4c] bg-[#0b1219] px-3 text-[10px] tracking-[0.12em] text-[#d7dee6] md:bottom-4"
        >
          <MessageSquare className="size-3.5" />
          Ask Marine Intelligence
        </button>
      )}
      {open && (
        <aside className="sheet-enter absolute inset-x-0 bottom-0 z-30 flex max-h-[72vh] flex-col border-t border-[#243140] bg-[#0b1219] md:inset-y-0 md:right-0 md:bottom-auto md:left-auto md:w-[340px] md:border-l md:border-t-0">
          <div className="flex items-start justify-between px-4 pt-3">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-[#96f878]">MARINE INTELLIGENCE</p>
              <p className="mt-1 text-[12px] tracking-[0.12em] text-white">AI ASSISTANT</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-[#7d8a97]">
              <X className="size-4" />
            </button>
          </div>
          <p className="px-4 pt-2 text-[11px] leading-5 text-[#7d8a97]">
            Answers only from the vessels currently loaded. This is a local assistant, not a live model.
          </p>
          <div className="mi-scroll mt-3 flex-1 space-y-3 overflow-auto px-4">
            {log.map((row, i) => (
              <div key={i}>
                <p className="text-[11px] text-[#8a97a4]">{row.q}</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-[12px] leading-5 text-[#e8eef4]">{row.a}</pre>
              </div>
            ))}
            {!log.length && (
              <div className="space-y-1.5">
                {PROMPTS.map((p) => (
                  <button key={p} type="button" onClick={() => submit(p)} className="block w-full border border-[#243140] px-2 py-1.5 text-left text-[11px] text-[#c5d0dc] hover:bg-[#14202c]">
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            className="border-t border-[#1c2834] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the current picture…"
              className="h-8 w-full border border-[#243140] bg-[#0a1016] px-2 text-[12px] outline-none"
            />
          </form>
        </aside>
      )}
    </>
  );
}
