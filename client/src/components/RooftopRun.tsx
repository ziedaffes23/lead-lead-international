/**
 * Moonlit limestone trial contract: an original delegate courier runs a layered rooftop matte-painting
 * with double-jump, slide, strike, Relic Gold objectives, local high score, keyboard, touch, and controls.
 */
import { useEffect, useRef, useState } from "react";

type GameState = "idle" | "playing" | "over";
type Obstacle = {
  x: number;
  width: number;
  height: number;
  type: "crate" | "beam" | "guard";
  cleared?: boolean;
};
type Fragment = { x: number; y: number; taken?: boolean };
const WIDTH = 960;
const HEIGHT = 440;
const GROUND = HEIGHT - 76;
const TARGET_FRAME_MS = 1000 / 60;
const BEST_SCORE_KEY = "lead-lead-rooftop-best";

export function RooftopRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>("idle");
  const resetRef = useRef<() => void>(() => undefined);
  const startRef = useRef<() => void>(() => undefined);
  const [state, setState] = useState<GameState>("idle");
  const [canvasReady, setCanvasReady] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [remainingLives, setRemainingLives] = useState(3);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? 0);
      if (Number.isFinite(saved) && saved > 0) setBest(saved);
    } catch {
      // The game remains playable when storage is blocked or unavailable.
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;
    setCanvasReady(true);
    let frame = 0;
    let lastTime = 0;
    let tick = 0;
    let distance = 0;
    let fragments = 0;
    let lives = 3;
    let speed = 7.3;
    let nextSpawn = 110;
    let strikeFrames = 0;
    let invincible = 0;
    const player = { x: 156, y: GROUND, velocity: 0, jumps: 0, slide: 0 };
    let obstacles: Obstacle[] = [];
    let tokens: Fragment[] = [];
    const syncTelemetry = (lastAction?: "jump" | "slide" | "strike") => {
      canvas.dataset.gameState = stateRef.current;
      canvas.dataset.currentSpeed = speed.toFixed(2);
      canvas.dataset.playerY = player.y.toFixed(1);
      canvas.dataset.slideActive = String(player.slide > 0);
      canvas.dataset.strikeActive = String(strikeFrames > 0);
      canvas.dataset.obstacleCount = String(obstacles.length);
      canvas.dataset.lives = String(lives);
      if (lastAction) canvas.dataset.lastAction = lastAction;
    };
    const far = Array.from({ length: 18 }, () => Math.random());
    const near = Array.from({ length: 12 }, () => Math.random());
    const dust = Array.from({ length: 26 }, () => ({
      x: Math.random() * WIDTH,
      y: 20 + Math.random() * (GROUND - 70),
      size: 0.25 + Math.random() * 1.35,
      speed: 0.08 + Math.random() * 0.35,
    }));

    const reset = () => {
      tick = 0;
      distance = 0;
      fragments = 0;
      lives = 3;
      setRemainingLives(3);
      speed = 7.3;
      nextSpawn = 110;
      strikeFrames = 0;
      invincible = 0;
      player.y = GROUND;
      player.velocity = 0;
      player.jumps = 0;
      player.slide = 0;
      obstacles = [];
      tokens = [];
      syncTelemetry();
    };
    resetRef.current = reset;
    const beginRun = () => {
      reset();
      stateRef.current = "playing";
      setScore(0);
      setState("playing");
    };
    startRef.current = beginRun;
    const launch = () => {
      if (stateRef.current !== "playing") return;
      if (player.jumps < 2) {
        player.velocity = player.jumps === 0 ? -15 : -12.4;
        player.jumps += 1;
        player.slide = 0;
        syncTelemetry("jump");
      }
    };
    const duck = () => {
      if (stateRef.current !== "playing") return;
      if (player.y >= GROUND - 1) {
        player.slide = 35;
        syncTelemetry("slide");
      } else {
        player.velocity = 15;
        syncTelemetry("slide");
      }
    };
    const strike = () => {
      if (stateRef.current === "playing") {
        strikeFrames = 17;
        syncTelemetry("strike");
      }
    };
    const spawn = () => {
      const roll = Math.random();
      obstacles.push(
        roll < 0.37
          ? { x: WIDTH + 40, width: 42, height: 48, type: "crate" }
          : roll < 0.7
            ? { x: WIDTH + 40, width: 94, height: 28, type: "beam" }
            : { x: WIDTH + 40, width: 36, height: 66, type: "guard" }
      );
      if (Math.random() < 0.74) {
        const y = GROUND - (Math.random() < 0.55 ? 44 : 130);
        for (let index = 0; index < 3; index += 1)
          tokens.push({ x: WIDTH + 118 + index * 34, y });
      }
      nextSpawn = Math.max(74, 120 - speed * 3) + Math.random() * 48;
    };
    const fail = () => {
      if (invincible > 0) return;
      lives -= 1;
      setRemainingLives(lives);
      invincible = 70;
      if (lives <= 0) {
        const result = Math.floor(distance / 10) + fragments * 12;
        setScore(result);
        setBest(current => {
          const next = Math.max(current, result);
          try {
            window.localStorage.setItem(BEST_SCORE_KEY, String(next));
          } catch {
            // Best score persistence is optional; never interrupt a run.
          }
          return next;
        });
        stateRef.current = "over";
        setState("over");
      }
    };
    const skyline = (
      samples: number[],
      color: string,
      scale: number,
      offset: number
    ) => {
      context.fillStyle = color;
      const span = WIDTH / samples.length;
      samples.forEach((sample, index) => {
        const x =
          ((index * span - distance * scale + offset) % (WIDTH + span)) - span;
        const height = 60 + sample * 135;
        context.fillRect(x, GROUND - height, span * 0.82, height);
        context.beginPath();
        context.moveTo(x, GROUND - height);
        context.lineTo(x + span * 0.41, GROUND - height - 26 - sample * 16);
        context.lineTo(x + span * 0.82, GROUND - height);
        context.fill();
      });
    };
    const templeMass = () => {
      const shift = (distance * 0.18) % 90;
      context.save();
      context.translate(WIDTH - 296 + shift, 0);
      context.fillStyle = "rgba(66,91,113,.55)";
      context.fillRect(0, GROUND - 170, 184, 170);
      context.beginPath();
      context.moveTo(-18, GROUND - 170);
      context.lineTo(92, GROUND - 239);
      context.lineTo(202, GROUND - 170);
      context.closePath();
      context.fill();
      context.fillStyle = "rgba(177,203,210,.28)";
      for (let column = 0; column < 4; column += 1) {
        const x = 16 + column * 46;
        context.fillRect(x, GROUND - 160, 16, 142);
        context.fillRect(x - 4, GROUND - 166, 24, 7);
        context.fillStyle = "rgba(224,235,232,.1)";
        context.fillRect(x + 3, GROUND - 154, 3, 132);
        context.fillStyle = "rgba(177,203,210,.28)";
      }
      context.strokeStyle = "rgba(211,228,229,.23)";
      context.lineWidth = 1;
      for (let course = 0; course < 5; course += 1) {
        const y = GROUND - 28 - course * 28;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(184, y);
        context.stroke();
      }
      context.restore();
    };
    const limestoneParapets = () => {
      const span = 250;
      const shift = (distance * 0.3) % span;
      context.save();
      context.translate(-shift, 0);
      for (let index = -1; index < 6; index += 1) {
        const x = index * span;
        context.fillStyle = "rgba(27,48,65,.82)";
        context.beginPath();
        context.moveTo(x - 24, GROUND + 14);
        context.lineTo(x + 28, GROUND - 37);
        context.lineTo(x + span - 42, GROUND - 23);
        context.lineTo(x + span + 24, GROUND + 14);
        context.closePath();
        context.fill();
        context.strokeStyle = "rgba(161,190,199,.22)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x + 4, GROUND - 11);
        context.lineTo(x + span - 4, GROUND - 1);
        context.stroke();
      }
      context.restore();
    };
    const drawPlayer = () => {
      const sliding = player.slide > 0;
      const body = sliding ? 26 : 50;
      context.save();
      context.translate(player.x, player.y);
      if (invincible > 0 && Math.floor(invincible / 4) % 2 === 0)
        context.globalAlpha = 0.42;
      context.fillStyle = "#13243a";
      context.beginPath();
      if (sliding) context.ellipse(0, -body / 2, 34, 14, 0, 0, Math.PI * 2);
      else {
        context.moveTo(-17, 0);
        context.lineTo(-12, -body);
        context.lineTo(0, -body - 24);
        context.lineTo(12, -body);
        context.lineTo(19, 0);
        context.lineTo(0, 8);
      }
      context.fill();
      context.fillStyle = "#070d18";
      context.beginPath();
      context.arc(0, -body - 10, 8, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#91bbca";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(-15, -13);
      context.lineTo(15, -20);
      context.stroke();
      if (!sliding) {
        const stride = Math.sin(tick * (0.26 + speed * 0.014)) * 12;
        context.strokeStyle = "#c9d7dc";
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(0, -2);
        context.lineTo(stride, 16);
        context.moveTo(0, -2);
        context.lineTo(-stride, 16);
        context.stroke();
      }
      if (strikeFrames > 0) {
        context.strokeStyle = "#ffe2a2";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(10, -23);
        context.lineTo(62, -29);
        context.stroke();
      }
      context.restore();
    };
    const drawObstacle = (obstacle: Obstacle) => {
      const base = GROUND + 14;
      if (obstacle.type === "crate") {
        context.fillStyle = "#40576b";
        context.fillRect(
          obstacle.x,
          base - obstacle.height,
          obstacle.width,
          obstacle.height
        );
        context.strokeStyle = "#9ab8c4";
        context.strokeRect(
          obstacle.x + 3,
          base - obstacle.height + 3,
          obstacle.width - 6,
          obstacle.height - 6
        );
      }
      if (obstacle.type === "beam") {
        context.fillStyle = "#536d7b";
        context.fillRect(
          obstacle.x,
          base - 86,
          obstacle.width,
          obstacle.height
        );
        context.fillStyle = "rgba(210,229,229,.24)";
        context.fillRect(obstacle.x + 6, base - 80, obstacle.width - 12, 4);
      }
      if (obstacle.type === "guard") {
        context.fillStyle = obstacle.cleared ? "rgba(61,79,91,.35)" : "#233041";
        context.beginPath();
        context.arc(
          obstacle.x + obstacle.width / 2,
          base - obstacle.height + 11,
          10,
          0,
          Math.PI * 2
        );
        context.fill();
        context.fillRect(
          obstacle.x + 9,
          base - obstacle.height + 19,
          18,
          obstacle.height - 19
        );
        context.strokeStyle = "#98bac6";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(obstacle.x + 8, base - obstacle.height + 28);
        context.lineTo(obstacle.x - 9, base - 17);
        context.stroke();
      }
    };
    const loop = (timestamp: number) => {
      const delta =
        lastTime === 0
          ? TARGET_FRAME_MS
          : Math.min(50, Math.max(0, timestamp - lastTime));

      lastTime = timestamp;
      const frameScale = Math.min(2.5, delta / TARGET_FRAME_MS);
      frame = window.requestAnimationFrame(loop);
      tick += frameScale;
      const gradient = context.createLinearGradient(0, 0, 0, HEIGHT);
      gradient.addColorStop(0, "#030813");
      gradient.addColorStop(0.48, "#0e1f36");
      gradient.addColorStop(1, "#050a13");
      context.fillStyle = gradient;
      context.fillRect(0, 0, WIDTH, HEIGHT);
      const moonGlow = context.createRadialGradient(
        WIDTH - 156,
        86,
        4,
        WIDTH - 156,
        86,
        118
      );
      moonGlow.addColorStop(0, "rgba(239,239,217,.34)");
      moonGlow.addColorStop(0.3, "rgba(162,196,212,.15)");
      moonGlow.addColorStop(1, "rgba(17,42,66,0)");
      context.fillStyle = moonGlow;
      context.fillRect(0, 0, WIDTH, HEIGHT);
      dust.forEach(point => {
        const x = (point.x - distance * point.speed + WIDTH) % WIDTH;
        context.fillStyle = "rgba(214,234,239,.42)";
        context.globalAlpha =
          0.18 + (Math.sin(tick * 0.025 + point.x) + 1) * 0.16;
        context.fillRect(x, point.y, point.size, point.size);
      });
      context.globalAlpha = 1;
      skyline(far, "rgba(117,153,176,.2)", 0.12, 0);
      skyline(near, "rgba(19,36,58,.79)", 0.42, 60);
      templeMass();
      limestoneParapets();
      context.fillStyle = "#07111e";
      context.fillRect(0, GROUND + 14, WIDTH, HEIGHT - GROUND);
      context.strokeStyle = "rgba(171,208,219,.54)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, GROUND + 14);
      context.lineTo(WIDTH, GROUND + 14);
      context.stroke();
      context.strokeStyle = "rgba(154,196,211,.19)";
      context.lineWidth = 1;
      for (let index = 0; index < 20; index += 1) {
        const x = ((index * 60 - distance) % (WIDTH + 60)) - 60;
        context.beginPath();
        context.moveTo(x, GROUND + 14);
        context.lineTo(x - 22, HEIGHT);
        context.stroke();
      }
      context.strokeStyle = "rgba(188,222,232,.35)";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(-20, GROUND + 54);
      context.lineTo(WIDTH * 0.44, GROUND + 19);
      context.lineTo(WIDTH + 30, GROUND + 54);
      context.stroke();
      if (stateRef.current === "playing") {
        distance += speed * frameScale;
        speed = Math.min(16.5, 7.45 + distance / 2300);
        nextSpawn -= frameScale;
        if (nextSpawn <= 0) spawn();
        player.velocity += 0.8 * frameScale;
        player.y += player.velocity * frameScale;
        if (player.y >= GROUND) {
          player.y = GROUND;
          player.velocity = 0;
          player.jumps = 0;
        }
        if (player.slide > 0) player.slide -= frameScale;
        if (strikeFrames > 0) strikeFrames -= frameScale;
        if (invincible > 0) invincible -= frameScale;
      }
      const playerHeight = player.slide > 0 ? 26 : 62;
      obstacles.forEach(obstacle => {
        if (stateRef.current === "playing") obstacle.x -= speed * frameScale;
        drawObstacle(obstacle);
        if (
          stateRef.current === "playing" &&
          !obstacle.cleared &&
          obstacle.x < player.x + 18 &&
          obstacle.x + obstacle.width > player.x - 18
        ) {
          const onSamePlane =
            player.y > GROUND - playerHeight && obstacle.type !== "beam";
          const beamCollision =
            obstacle.type === "beam" &&
            player.slide <= 0 &&
            player.y > GROUND - 5;
          if (obstacle.type === "guard" && strikeFrames > 0)
            obstacle.cleared = true;
          else if (onSamePlane || beamCollision) {
            obstacle.cleared = true;
            fail();
          }
        }
      });
      obstacles = obstacles.filter(
        obstacle => obstacle.x > -100 && !obstacle.cleared
      );
      if (tokens[0]) {
        context.save();
        context.setLineDash([6, 10]);
        context.lineDashOffset = -tick * 0.8;
        context.strokeStyle = "rgba(255,221,149,.42)";
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(player.x + 20, player.y - 42);
        context.quadraticCurveTo(
          WIDTH * 0.54,
          GROUND - 126,
          tokens[0].x,
          tokens[0].y
        );
        context.stroke();
        context.restore();
      }
      tokens.forEach(token => {
        if (stateRef.current === "playing") token.x -= speed * frameScale;
        context.save();
        context.translate(token.x, token.y);
        context.rotate(tick * 0.03);
        context.strokeStyle = "#ffe1a0";
        context.shadowColor = "#cfa258";
        context.shadowBlur = 14;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, -10);
        context.lineTo(8, 0);
        context.lineTo(0, 10);
        context.lineTo(-8, 0);
        context.closePath();
        context.stroke();
        context.restore();
        if (
          stateRef.current === "playing" &&
          Math.abs(token.x - player.x) < 25 &&
          Math.abs(token.y - (player.y - 28)) < 42
        ) {
          token.taken = true;
          fragments += 1;
        }
      });
      tokens = tokens.filter(token => token.x > -50 && !token.taken);
      drawPlayer();
      context.fillStyle = "rgba(220,235,236,.92)";
      context.font = "600 15px monospace";
      context.fillText(`DISTANCE ${Math.floor(distance / 10)}m`, 20, 30);
      context.fillText(`FRAGMENTS ${fragments}`, 20, 52);
      context.fillText(`LIVES ${lives}/3`, WIDTH - 142, 34);
      for (let index = 0; index < 3; index += 1) {
        context.globalAlpha = index < lives ? 1 : 0.22;
        context.fillStyle = "#c4dbe2";
        context.fillText("◇", WIDTH - 38 - index * 26, 34);
        context.globalAlpha = 1;
      }
      syncTelemetry();
    };
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        stateRef.current !== "playing"
      )
        return;
      if (
        [
          "Space",
          "ArrowUp",
          "KeyW",
          "ArrowDown",
          "KeyS",
          "KeyF",
          "KeyJ",
          "KeyX",
        ].includes(event.code)
      )
        event.preventDefault();
      if (["Space", "ArrowUp", "KeyW"].includes(event.code)) launch();
      if (["ArrowDown", "KeyS"].includes(event.code)) duck();
      if (["KeyF", "KeyJ", "KeyX"].includes(event.code)) strike();
    };
    const onVisibilityChange = () => {
      if (!document.hidden) lastTime = 0;
    };
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const rx = (event.clientX - rect.left) / rect.width;
      const ry = (event.clientY - rect.top) / rect.height;
      if (ry > 0.72) duck();
      else if (rx > 0.7) strike();
      else launch();
    };
    window.addEventListener("keydown", onKey, { passive: false });
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("pointerdown", onPointer);
    loop(0);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointerdown", onPointer);
      resetRef.current = () => undefined;
      startRef.current = () => undefined;
    };
  }, []);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("demo"))
      return undefined;
    const timer = window.setTimeout(() => startRef.current(), 80);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="rooftop-run" aria-label="Rooftops of Thyna game">
      <div className="rooftop-run__status" aria-hidden="true">
        <span>FIELD RUN / THYNA</span>
        <span>GUARD CLEARANCE ENABLED</span>
      </div>
      <div className="game-frame">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="game-canvas"
          aria-describedby="rooftop-control-guide"
        />
        {state !== "playing" && (
          <div
            className={`game-overlay game-overlay--${state}`}
            role="status"
            aria-live="polite"
          >
            <p>CHAPTER VI / THE TRIALS</p>
            <h2>
              {state === "over" ? "YOUR RUN ENDS HERE" : "ROOFTOPS OF THYNA"}
            </h2>
            <span>
              {state === "over"
                ? `Score ${score} · Best ${best}`
                : "Use START GAME above to enter the route. Leap, double-jump, slide under beams, strike guards, and collect creed fragments."}
            </span>
          </div>
        )}
        <div className="game-frame__hud">
          <div
            className="game-frame__lives"
            aria-label={`${remainingLives} of 3 lives remaining`}
          >
            <span>LIVES</span>
            <strong>{remainingLives}/3</strong>
            <div aria-hidden="true">
              <i className={remainingLives > 0 ? "is-full" : "is-empty"}>◇</i>
            </div>
          </div>
          {state !== "playing" && (
            <button
              type="button"
              className="game-frame__start"
              onClick={() => startRef.current()}
              disabled={!canvasReady}
            >
              <span>
                {canvasReady
                  ? state === "over"
                    ? "RUN AGAIN"
                    : "START GAME"
                  : "CALIBRATING…"}
              </span>
              <b>→</b>
            </button>
          )}
        </div>
      </div>
      <p className="game-control-guide" id="rooftop-control-guide">
        <span>KEYBOARD LOADOUT</span>
        <span>
          <kbd>SPACE</kbd> / <kbd>W</kbd> JUMP
        </span>
        <span>
          <kbd>↓</kbd> / <kbd>S</kbd> SLIDE
        </span>
        <span>
          <kbd>F</kbd> STRIKE
        </span>
      </p>
      <div className="game-controls" aria-label="Touch controls">
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent("keydown", { code: "Space" })
            )
          }
        >
          <span>JUMP</span>
          <kbd>SPACE</kbd>
        </button>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent("keydown", { code: "ArrowDown" })
            )
          }
        >
          <span>SLIDE</span>
          <kbd>↓</kbd>
        </button>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyF" }))
          }
        >
          <span>STRIKE</span>
          <kbd>F</kbd>
        </button>
      </div>
    </section>
  );
}
