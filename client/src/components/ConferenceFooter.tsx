import "@/styles/conference-footer.css";

export function ConferenceFooter({ compact = false }: { compact?: boolean }) {
  return <footer className={`conference-footer${compact ? " conference-footer--compact" : ""}`}><span>LEAD &amp; LEAD 2K26</span><i aria-hidden="true" /><span>MADE BY THE IMPERIUM DEPARTMENT</span></footer>;
}
