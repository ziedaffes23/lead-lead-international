export type ConferencePageId =
  | "home"
  | "brief"
  | "principles"
  | "game"
  | "register";

const navigation = [
  ["brief", "/mission", "MISSION"],
  ["principles", "/principles", "CREED"],
  ["game", "/game", "TRIAL"],
] as const;

export function ConferenceHeader({
  current,
  onRegister,
}: {
  current: ConferencePageId;
  onRegister?: () => void;
}) {
  return (
    <header className="game-nav conference-nav">
      <a className="game-brand" href="/home" aria-label="Lead & Lead 2K26 home">
        <img
          src="/assets/lead-lead-2k26-logo.png"
          alt="Lead & Lead 2K26 logo"
        />
        <span>
          <b>LEAD &amp; LEAD 2K26</b>
          <small>LC THYNA / WORLD HUB</small>
        </span>
      </a>
      <div className="game-nav__status">
        <i /> SERVER ONLINE <span>EU-01</span>
      </div>
      <nav className="game-nav__links" aria-label="Conference pages">
        {navigation.map(([id, href, label]) => (
          <a
            href={href}
            key={id}
            aria-current={current === id ? "page" : undefined}
          >
            {label}
          </a>
        ))}
        <>
          {onRegister ? (
            <button
              className="game-nav__register"
              type="button"
              onClick={onRegister}
            >
              REGISTER <b>↗</b>
            </button>
          ) : (
            <a
              className="game-nav__register"
              href="/register"
              aria-current={current === "register" ? "page" : undefined}
            >
              REGISTER <b>↗</b>
            </a>
          )}
        </>
      </nav>
    </header>
  );
}
