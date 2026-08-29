/** Tactical Rooftop Trial: a playable courier run with a compact command-deck page frame. */
import { CinematicBackground } from "@/components/CinematicBackground";
import { RooftopRun } from "@/components/RooftopRun";
import { SiteMotion } from "@/components/SiteMotion";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import { ConferenceFooter } from "@/components/ConferenceFooter";
import { CINEMATIC_ASSETS } from "@/game/assets";
import "@/styles/game.css";
import "@/styles/motion.css";
import "@/styles/cinematic-polish.css";
import "@/styles/rooftop-chase-pages.css";
import "@/styles/rooftop-chase-refinement.css";
import "@/styles/route-world-overhaul.css";
import "@/styles/conference-navigation.css";
import "@/styles/rooftop-command-deck.css";
import "@/styles/mobile-layout.css";
import "@/styles/mobile-final-fixes.css";
import "@/styles/layout-system.css";
import "@/styles/game-lifecycle.css";
import "@/styles/route-photo-background.css";
import "@/styles/mobile-overhaul.css";

// prettier-ignore
const RegisterArrow = () => <>REGISTER <b>→</b></>;

export default function Game() {
  return (
    <main className="game-page chase-route chase-game cinematic-world-root">
      <CinematicBackground tone="trials" />
      <div
        className="game-photo-backdrop"
        style={{
          backgroundImage: `url(${CINEMATIC_ASSETS.thynaRooftopBackground})`,
        }}
        aria-hidden="true"
      />
      <div className="route-entry-wipe" aria-hidden="true" />
      <div className="route-pressure-lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <SiteMotion />
      <ConferenceHeader current="game" />
      <section className="trial-command-deck" data-reveal>
        <div className="trial-command-deck__heading">
          <p className="trial-command-deck__eyebrow">
            <span>CHAPTER VI</span> / ROOFTOP TRIAL
          </p>
          <h1>
            Rooftops
            <br />
            of <em>Thyna</em>
          </h1>
        </div>
        <aside
          className="trial-command-deck__panel"
          aria-label="Trial briefing"
        >
          <div className="trial-command-deck__panel-head">
            <span>RUN PROTOCOL</span>
            <i>LIVE</i>
          </div>
          <div className="trial-command-deck__objective">
            <small>CURRENT OBJECTIVE</small>
            <strong>KEEP THE ROUTE</strong>
          </div>
          <dl className="trial-command-deck__stats">
            <div>
              <dt>PRIMARY STRIKE</dt>
              <dd>
                <kbd>F</kbd>
              </dd>
            </div>
            <div>
              <dt>RUN STATE</dt>
              <dd>READY</dd>
            </div>
          </dl>
        </aside>
      </section>
      <div className="game-chase-frame" data-reveal>
        <RooftopRun />
      </div>
      <section className="game-after" data-reveal>
        <button
          className="bronze-button"
          type="button"
          onClick={() => window.location.assign("/register")}
        >
          <RegisterArrow />
        </button>
      </section>
      <ConferenceFooter />
    </main>
  );
}
