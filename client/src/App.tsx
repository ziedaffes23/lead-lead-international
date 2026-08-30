import { lazy, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { BackgroundMusic } from "./components/BackgroundMusic";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/theme-ui.css";
import "./styles/site-layout-final-fixes.css";

const Home = lazy(() => import("./pages/Home"));
const ConferenceHome = lazy(() => import("./pages/ConferenceHome"));
const Game = lazy(() => import("./pages/Game"));
const Register = lazy(() => import("./pages/Register"));
const MissionBrief = lazy(() => import("./pages/MissionBrief"));
const Principles = lazy(() => import("./pages/Principles"));

function RouteLoading() {
  return (
    <main className="route-loading" aria-busy="true" aria-label="Loading">
      <span className="route-loading__signal" aria-hidden="true" />
    </main>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/home" component={ConferenceHome} />
        <Route path="/questions"><Redirect to="/home" /></Route>
        <Route path="/mission" component={MissionBrief} />
        <Route path="/principles" component={Principles} />
        <Route path="/delegate-prep"><Redirect to="/home" /></Route>
        <Route path="/game" component={Game} />
        <Route path="/register" component={Register} />
        <Route component={Home} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark" switchable={false}><BackgroundMusic /><Router /></ThemeProvider></ErrorBoundary>;
}
