import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import OperationsControl from './pages/OperationsControl';
import CommercialPlanning from './pages/CommercialPlanning';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { getSession, logout } from './lib/auth';

const PAGE_HASHES = {
  '#operations': 'operations',
  '#commercial': 'commercial',
  '#pricing': 'pricing',
  '#login': 'login',
};

const PAGE_TITLES = {
  home: 'FlightAssist | Airline Management System',
  operations: 'Operations Control | FlightAssist',
  commercial: 'Commercial Planning | FlightAssist',
  pricing: 'Pricing | FlightAssist',
  login: 'Sign in | FlightAssist',
  dashboard: 'Admin Dashboard | FlightAssist',
};

// The admin console owns everything under #dashboard (e.g. #dashboard/invoices)
// and manages those sub-routes itself; this router only needs the page.
function pageFromHash(hash) {
  if (hash === '#dashboard' || hash.startsWith('#dashboard/')) return 'dashboard';
  return PAGE_HASHES[hash] || 'home';
}

// Pages rendered without the marketing header and footer.
const STANDALONE = new Set(['login', 'dashboard']);

function headerOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
  return parseInt(raw, 10) || 72;
}

function scrollToSection(hash) {
  if (!hash || hash === '#home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.querySelector(hash);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top, behavior: 'smooth' });
}

function App() {
  const [currentPage, setCurrentPage] = useState(() => pageFromHash(window.location.hash));
  // Signed-in admin, restored from storage on load. Null when signed out.
  const [user, setUser] = useState(() => getSession());
  // Section to scroll to once the target page has actually rendered.
  const pendingScroll = useRef(null);
  // Mirrors currentPage so the hash listener can read it without resubscribing.
  const pageRef = useRef(currentPage);
  pageRef.current = currentPage;

  // Flush a queued scroll after the new page has committed to the DOM.
  useEffect(() => {
    if (pendingScroll.current === null) return;
    const target = pendingScroll.current;
    pendingScroll.current = null;
    requestAnimationFrame(() => scrollToSection(target));
  });

  useEffect(() => {
    document.title = PAGE_TITLES[currentPage] || PAGE_TITLES.home;
  }, [currentPage]);

  const goTo = useCallback((page, hash) => {
    const nextHash = page === 'home' ? hash || '#home' : `#${page}`;

    if (page === currentPage) {
      // Already on this page — scroll now. Assigning an unchanged hash fires
      // no hashchange event, so we must not depend on the listener here.
      scrollToSection(page === 'home' ? nextHash : null);
    } else {
      pendingScroll.current = page === 'home' ? nextHash : '#home';
      setCurrentPage(page);
    }

    // Keep the URL in sync without re-entering through the hash listener.
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash);
    }
  }, [currentPage]);

  // Deep links, back/forward, and hashes typed straight into the address bar.
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      const page = pageFromHash(hash);

      if (page === pageRef.current) {
        if (page === 'home') scrollToSection(hash);
        return;
      }
      pendingScroll.current = page === 'home' ? hash : '#home';
      setCurrentPage(page);
    };

    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);

    // Honour a section hash present on first load.
    const initial = window.location.hash;
    if (pageFromHash(initial) === 'home' && initial && initial !== '#home') {
      pendingScroll.current = initial;
    }

    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  // Already signed in and landing on #login — straight through to the console.
  useEffect(() => {
    if (currentPage === 'login' && user) goTo('dashboard');
  }, [currentPage, user, goTo]);

  const handleSignedIn = (signedInUser) => {
    setUser(signedInUser);
    goTo('dashboard');
  };

  const handleSignOut = () => {
    logout();
    setUser(null);
    goTo('login');
  };

  if (STANDALONE.has(currentPage)) {
    const showDashboard = currentPage === 'dashboard' && user;
    return (
      <>
        <a href="#main" className="skip-link">Skip to main content</a>
        {showDashboard ? (
          <Dashboard user={user} onSignOut={handleSignOut} onNavigate={goTo} />
        ) : (
          <Login
            onNavigate={goTo}
            onSignedIn={handleSignedIn}
            notice={currentPage === 'dashboard' ? 'Sign in to open the admin dashboard.' : undefined}
          />
        )}
      </>
    );
  }

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>

      <Header currentPage={currentPage} onNavigate={goTo} signedIn={Boolean(user)} />

      {currentPage === 'home' && <Home onNavigate={goTo} />}
      {currentPage === 'operations' && <OperationsControl onNavigate={goTo} />}
      {currentPage === 'commercial' && <CommercialPlanning onNavigate={goTo} />}
      {currentPage === 'pricing' && <Pricing onNavigate={goTo} />}

      <Footer onNavigate={goTo} />
    </>
  );
}

export default App;
