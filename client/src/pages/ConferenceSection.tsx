import { useLocation } from "wouter";
import { CinematicBackground } from "@/components/CinematicBackground";
import {
  ConferenceHeader,
  type ConferencePageId,
} from "@/components/ConferenceHeader";
import { ConferenceFooter } from "@/components/ConferenceFooter";
import { leadershipPrinciples, missionValues, registrationReadiness } from "@/data/conferenceSections";
import "@/styles/game-home.css";
import "@/styles/homepage-upgrades.css";
import "@/styles/chapter-accessibility.css";
import "@/styles/true-chapter-tabs.css";
import "@/styles/section-pages.css";
import "@/styles/conference-navigation.css";
import "@/styles/mobile-layout.css";
import "@/styles/mobile-final-fixes.css";
import "@/styles/layout-system.css";
import "@/styles/route-page-polish.css";
import "@/styles/mobile-overhaul.css";

type SectionId = "brief" | "principles" | "prep";

const headings: Record<
  SectionId,
  { kicker: string; chapter: string; title: string }
> = {
  brief: {
    kicker: "MISSION DATA",
    chapter: "PAGE 01",
    title: "The room is waiting.",
  },
  principles: {
    kicker: "SKILL TREE",
    chapter: "PAGE 02",
    title: "Choose what you level up.",
  },
  prep: {
    kicker: "DELEGATE PREP",
    chapter: "PAGE 03",
    title: "Know the route before you enter.",
  },
};

export default function ConferenceSection({ section }: { section: SectionId }) {
  const [, navigate] = useLocation();
  const heading = headings[section];
  const openRegistration = () => navigate("/register");

  return (
    <main
      className={`game-home conference-section-page conference-section-page--${section}`}
    >
      <CinematicBackground tone="home" />
      <div className="game-home__scanlines" aria-hidden="true" />
      <div className="home-route-atmosphere" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <ConferenceHeader
        current={section as ConferencePageId}
        onRegister={openRegistration}
      />
      <section
        className={`game-section conference-section-page__main game-section--${section === "principles" ? "skills" : section}`}
        aria-labelledby={`${section}-title`}
      >
        <div className="section-intro-row">
          <div>
            <p className="game-kicker">
              <span>{heading.kicker}</span>
              <i /> {heading.chapter}
            </p>
            <h1 id={`${section}-title`}>{heading.title}</h1>
          </div>
        </div>
        {section === "brief" && (
          <div className="quest-cards">
            {missionValues.map(value => (
              <article className="quest-card" key={value.code}>
                <div className="quest-card__top">
                  <span>{value.code}</span>
                  <b>{value.tag}</b>
                </div>
                <div className="quest-card__icon" aria-hidden="true">
                  +
                </div>
                <h2>{value.title}</h2>
                <p>{value.copy}</p>
                <span className="quest-card__link">
                  MISSION DETAIL <b>→</b>
                </span>
              </article>
            ))}
          </div>
        )}
        {section === "principles" && (
          <div className="skill-grid">
            {leadershipPrinciples.map(([code, title, copy]) => (
              <article className="skill-node" key={code}>
                <div className="skill-node__header">
                  <b>{code}</b>
                  <span>UNLOCKED</span>
                </div>
                <h2>{title}</h2>
                <p>{copy}</p>
                <div className="skill-node__meter">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </article>
            ))}
          </div>
        )}
        {section === "prep" && (
          <div className="readiness-layout">
            <div className="readiness-console">
              <p className="readiness-console__eyebrow">
                REGISTRATION STATUS <span>OPEN</span>
              </p>
              <h2>Ready when you are.</h2>
              <p>
                Your record is sent to the official registration sheet only when
                you choose submit. You remain in control of each step before
                then.
              </p>
              <button
                className="game-primary"
                type="button"
                onClick={openRegistration}
              >
                <span>OPEN DELEGATE DOSSIER</span>
                <b>→</b>
              </button>
              <small>
                STARTS 10 SEP 2026 · MMB 3 DAYS · EB 4 DAYS · LC THYNA
              </small>
            </div>
            <div className="readiness-grid">
              {registrationReadiness.map(([code, title, copy]) => (
                <article className="readiness-card" key={code}>
                  <span>{code}</span>
                  <h2>{title}</h2>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
      <section
        className="route-deck conference-section-page__route"
        aria-labelledby="section-route-title"
      >
        <div className="route-deck__signal">
          <span>NEXT DESTINATION</span>
          <i />
        </div>
        <h2 id="section-route-title">Your next move.</h2>
        <div className="route-deck__actions">
          <button
            className="game-primary"
            type="button"
            onClick={openRegistration}
          >
            <span>REGISTER FOR THE GATHERING</span>
            <b>→</b>
          </button>
          <button
            className="game-secondary"
            type="button"
            onClick={() => navigate("/home")}
          >
            <span>RETURN TO THE GATHERING</span>
            <b>↗</b>
          </button>
        </div>
      </section>
      <ConferenceFooter />
      <button
        className="mobile-register-dock"
        type="button"
        onClick={openRegistration}
      >
        <span>
          <small>LEAD &amp; LEAD 2K26</small>
          <b>START REGISTRATION</b>
        </span>
        <i aria-hidden="true">→</i>
      </button>
    </main>
  );
}
