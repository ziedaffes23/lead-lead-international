import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CinematicBackground } from "@/components/CinematicBackground";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import { ConferenceFooter } from "@/components/ConferenceFooter";
import { CINEMATIC_ASSETS } from "@/game/assets";
import "@/styles/game-home.css";
import "@/styles/homepage-upgrades.css";
import "@/styles/chapter-accessibility.css";
import "@/styles/lighthouse-hero.css";
import "@/styles/lighthouse-reference-tower.css";
import "@/styles/lighthouse-restore.css";
import "@/styles/conference-navigation.css";
import "@/styles/single-screen-home.css";
import "@/styles/mobile-layout.css";
import "@/styles/homepage-final-fixes.css";
import "@/styles/mobile-final-fixes.css";
import "@/styles/layout-system.css";
import "@/styles/game-home-redesign.css";
import "@/styles/mobile-overhaul.css";
import "@/styles/home-animated-refresh.css";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function ConferenceHome() {
  const [, navigate] = useLocation();
  const eventTime = new Date("2026-09-10T09:00:00+01:00").getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const openRegistration = (lc?: string) => {
    navigate(`/register${lc ? `?lc=${encodeURIComponent(lc)}` : ""}`);
  };

  const remaining = Math.max(0, eventTime - now);
  const totalMinutes = Math.floor(remaining / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;
  const eventStarted = remaining === 0;

  return (
    <main className="game-home game-home--single-screen">
      <CinematicBackground tone="home" />
      <div className="game-home__scanlines" aria-hidden="true" />
      <div className="home-route-atmosphere" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <ConferenceHeader current="home" onRegister={() => openRegistration()} />

      <section className="world-hero" aria-labelledby="world-title">
        <div
          className="world-hero__backdrop"
          style={{
            backgroundImage: `url(${CINEMATIC_ASSETS.thynaRooftopBackground})`,
          }}
          aria-hidden="true"
        />
        <div className="world-hero__grid" aria-hidden="true" />
        <div className="world-hero__moon" aria-hidden="true" />
        <div className="world-hero__sentinel" aria-hidden="true">
          <span className="sentinel-aura" />
          <span className="sentinel-hood" />
          <span className="sentinel-cloak" />
          <span className="sentinel-blade" />
          <span className="sentinel-glyph">◇</span>
        </div>
        <div className="world-hero__coordinates" aria-hidden="true">
          36° 48′ N / 10° 10′ E
        </div>

        <div className="world-hero__copy">
          <p className="game-kicker">
            <span>MISSION 01</span>
            <i /> THE GATHERING
          </p>
          <h1 id="world-title">
            LEAD <em>&amp;</em> LEAD <small>2K26</small>
          </h1>
          <p className="world-hero__directive">
            <span>ANSWER THE CALL</span>
            <i aria-hidden="true" />
          </p>
          <div className="world-hero__facts" aria-label="Event facts">
            <span>
              <small>STARTS</small>
              <b>10 SEP 2026</b>
            </span>
            <span>
              <small>MMB DURATION</small>
              <b>3 DAYS</b>
            </span>
            <span>
              <small>EB DURATION</small>
              <b>4 DAYS</b>
            </span>
            <span>
              <small>HOST</small>
              <b>LC THYNA</b>
            </span>
            <span>
              <small>LOCATION</small>
              <b>AMIR PALACE</b>
            </span>
            <span>
              <small>CREED COSTS</small>
              <b>€90 · 3 DAYS</b>
            </span>
          </div>
          <div className="world-hero__actions">
            <button
              className="game-primary"
              type="button"
              onClick={() => openRegistration()}
            >
              <span>START REGISTRATION</span>
              <b>→</b>
            </button>
            <button
              className="game-secondary"
              type="button"
              onClick={() => navigate("/game")}
            >
              <span>PLAY ROOFTOP TRIAL</span>
              <b>↗</b>
            </button>
          </div>
        </div>

        <aside className="mission-console" aria-label="Mission status">
          <div className="mission-console__top">
            <span>WORLD HUB / PLAYER 01</span>
            <b>LIVE</b>
          </div>
          <div className="mission-console__radar" aria-hidden="true">
            <span />
            <i />
            <b>01</b>
          </div>
          <p className="mission-console__label">CURRENT OBJECTIVE</p>
          <h2>FOLLOW THE SIGNAL</h2>
          <div className="mission-console__progress">
            <div>
              <span>MISSION PROGRESS</span>
              <b>01 / 03</b>
            </div>
            <i>
              <b />
            </i>
          </div>
          <div
            className="mission-console__missions"
            aria-label="Mission select"
          >
            <button type="button" onClick={() => navigate("/mission")}>
              <span>01</span>
              <strong>MISSION</strong>
              <b>↗</b>
            </button>
            <button type="button" onClick={() => navigate("/principles")}>
              <span>02</span>
              <strong>CREED</strong>
              <b>↗</b>
            </button>
            <button type="button" onClick={() => navigate("/game")}>
              <span>03</span>
              <strong>TRIAL</strong>
              <b>↗</b>
            </button>
          </div>
          <div className="mission-console__footer">
            <span>
              <small>COUNTDOWN</small>
              <strong aria-live="polite">
                {eventStarted
                  ? "LIVE"
                  : `${pad(days)}:${pad(hours)}:${pad(minutes)}`}
              </strong>
            </span>
            <span>
              <small>STATUS</small>
              <strong>OPEN</strong>
            </span>
          </div>
        </aside>
        <div
          className="world-hero__hud world-hero__hud--left"
          aria-hidden="true"
        >
          <span>ROOFTOP ASSEMBLY</span>
          <i />
        </div>
        <div
          className="world-hero__hud world-hero__hud--right"
          aria-hidden="true"
        >
          <span>BUILD 2K26.09</span>
          <i />
        </div>
      </section>
      <ConferenceFooter compact />
    </main>
  );
}
