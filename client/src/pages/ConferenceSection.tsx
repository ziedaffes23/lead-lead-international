import { useState } from "react";
import { useLocation } from "wouter";
import { CinematicBackground } from "@/components/CinematicBackground";
import {
  ConferenceHeader,
  type ConferencePageId,
} from "@/components/ConferenceHeader";
import { ConferenceFooter } from "@/components/ConferenceFooter";
import {
  conferenceFactions,
  leadershipPrinciples,
  missionValues,
  pad,
  registrationReadiness,
} from "@/data/conferenceSections";
import { buildLeaderboardPodium } from "@shared/leaderboardPodium";
import { trpc } from "@/lib/trpc";
import "@/styles/game-home.css";
import "@/styles/homepage-upgrades.css";
import "@/styles/chapter-accessibility.css";
import "@/styles/true-chapter-tabs.css";
import "@/styles/section-pages.css";
import "@/styles/conference-navigation.css";
import "@/styles/hall-since-details.css";
import "@/styles/mobile-layout.css";
import "@/styles/mobile-final-fixes.css";
import "@/styles/layout-system.css";
import "@/styles/mirage-redesign.css";
import "@/styles/route-page-polish.css";
import "@/styles/mobile-overhaul.css";

type SectionId = "brief" | "principles" | "prep" | "banners" | "mirage";
type Faction = (typeof conferenceFactions)[number];

function FactionCard({
  faction,
  index,
  active,
  onOpen,
  onToggle,
  onClose,
}: {
  faction: Faction;
  index: number;
  active: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onClose: () => void;
}) {
  const profileId = `faction-profile-${faction.id}`;
  return (
    <article
      className={`faction-card ${active ? "is-active" : ""}`}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        className="faction-card__trigger"
        type="button"
        aria-expanded={active}
        aria-controls={profileId}
        aria-label={`${faction.name}. ${faction.established}.`}
        onClick={onToggle}
      >
        <span className="faction-card__index">{pad(index + 1)}</span>
        <span
          className={`faction-card__logo faction-card__logo--${faction.logoTreatment}`}
        >
          <img src={faction.logo} alt="" />
        </span>
        <strong>{faction.name}</strong>
        <b aria-hidden="true">+</b>
      </button>
      <div
        className="faction-card__info"
        id={profileId}
        aria-hidden={!active}
        style={{
          opacity: active ? 1 : 0,
          pointerEvents: active ? "auto" : "none",
          transform: `translateY(${active ? "0" : ".7rem"})`,
        }}
      >
        <p
          className="faction-card__slogan"
          lang={faction.id === "bullaregia" ? "en" : "ar"}
        >
          {faction.slogan}
        </p>
        <span className="faction-card__since">{faction.established}</span>
      </div>
    </article>
  );
}

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
  banners: {
    kicker: "FACTION MAP",
    chapter: "PAGE 04",
    title: "Hall of banners.",
  },
  mirage: {
    kicker: "LIVE RANKING",
    chapter: "PAGE 05",
    title: "Registration mirage.",
  },
};

const rehearsalLeaderboard = [
  { lc: "LC Thyna", registrations: 42 },
  { lc: "LC Carthage", registrations: 31 },
  { lc: "LC University", registrations: 24 },
] as const;

export default function ConferenceSection({ section }: { section: SectionId }) {
  const [, navigate] = useLocation();
  const [activeFaction, setActiveFaction] = useState<string | null>(null);
  const leaderboard = trpc.registration.leaderboard.useQuery(undefined, {
    enabled: section === "mirage",
    refetchInterval: 30_000,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
  const heading = headings[section];
  const isRehearsalBoard = section === "mirage" && leaderboard.isError;
  const podium = buildLeaderboardPodium(
    isRehearsalBoard ? rehearsalLeaderboard : (leaderboard.data ?? [])
  );
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
        className={`game-section conference-section-page__main game-section--${section === "principles" ? "skills" : section === "banners" ? "factions" : section === "mirage" ? "leaderboard" : section}`}
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
        {section === "banners" && (
          <div className="faction-grid">
            {conferenceFactions.map((faction, index) => (
              <FactionCard
                key={faction.id}
                faction={faction}
                index={index}
                active={activeFaction === faction.id}
                onOpen={() => setActiveFaction(faction.id)}
                onToggle={() =>
                  setActiveFaction(current =>
                    current === faction.id ? null : faction.id
                  )
                }
                onClose={() => setActiveFaction(null)}
              />
            ))}
          </div>
        )}
        {section === "mirage" &&
          (leaderboard.isLoading ? (
            <div
              className="leaderboard-status leaderboard-status--loading"
              role="status"
            >
              <span className="leaderboard-status__pulse" aria-hidden="true" />
              <strong>SYNCING LIVE REGISTRATIONS</strong>
              <small>CONTACTING THE MIRAGE SERVER…</small>
            </div>
          ) : leaderboard.data?.length || isRehearsalBoard ? (
            <div
              className={`leaderboard-board ${isRehearsalBoard ? "leaderboard-board--rehearsal" : ""}`}
            >
              <div className="leaderboard-board__header">
                <div>
                  <span>LIVE SIGNAL / TOP THREE</span>
                  <strong>
                    {isRehearsalBoard
                      ? "REHEARSAL BOARD"
                      : "AUTO-REFRESH 30 SEC"}
                  </strong>
                </div>
                <div className="leaderboard-board__legend">
                  <i />{" "}
                  <span>
                    {isRehearsalBoard ? "OFFLINE PREVIEW" : "SHEET CONNECTED"}
                  </span>
                </div>
              </div>
              {isRehearsalBoard && (
                <div className="leaderboard-board__notice" role="status">
                  <b>!</b>
                  <span>
                    Live registration data is temporarily unavailable. Showing a
                    clearly labeled preview board so the mission screen remains
                    usable.
                  </span>
                </div>
              )}
              <div className="leaderboard-grid leaderboard-grid--podium">
                {podium.map(({ entry, rank, slot }) => {
                  const faction = conferenceFactions.find(
                    item => item.name === entry.lc
                  );
                  return (
                    <article
                      className={`leaderboard-card leaderboard-card--${rank} leaderboard-card--slot-${slot}`}
                      key={entry.lc}
                    >
                      <div className="leaderboard-card__cap">
                        <p>RANK {pad(rank)}</p>
                        <span>{rank === 1 ? "TOP SIGNAL" : "LIVE BOARD"}</span>
                      </div>
                      <div
                        className={`leaderboard-card__logo faction-card__logo--${faction?.logoTreatment ?? "paper"}`}
                      >
                        {faction ? (
                          <img src={faction.logo} alt="" />
                        ) : (
                          <span aria-hidden="true">◆</span>
                        )}
                      </div>
                      <div className="leaderboard-card__identity">
                        <h2>{entry.lc}</h2>
                        <span>
                          {rank === 1
                            ? "LEAD SIGNAL"
                            : rank === 2
                              ? "RISING SIGNAL"
                              : "ACTIVE SIGNAL"}
                        </span>
                      </div>
                      <strong>
                        {entry.registrations}
                        <small>REGISTRATIONS</small>
                      </strong>
                      <span className="leaderboard-card__live">
                        <i /> SIGNAL LOCKED
                      </span>
                      <i aria-hidden="true" />
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="leaderboard-empty">
              <span aria-hidden="true">◇</span>
              <h2>THE MIRAGE IS WAITING.</h2>
              <p>
                No active registrations are currently listed in the dedicated
                registration sheet. Add or remove rows there and this board will
                reflect current totals after its next refresh.
              </p>
              <button
                type="button"
                className="game-secondary"
                onClick={openRegistration}
              >
                <span>BE THE FIRST SIGNAL</span>
                <b>→</b>
              </button>
            </div>
          ))}
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
