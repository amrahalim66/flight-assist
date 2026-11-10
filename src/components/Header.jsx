import { useState, useEffect, useRef } from 'react';

// Mirrors the modules the home page advertises. `page` routes to a real page;
// the rest deep-link to the section that describes them.
const SERVICE_GROUPS = [
    {
        label: 'Core modules',
        items: [
            { name: 'Operations Control', desc: 'Real-time monitoring, dispatch and movement messaging', page: 'operations' },
            { name: 'Commercial Planning', desc: 'Route optimisation, charter sales and revenue planning', page: 'commercial' },
            { name: 'Crew Management', desc: 'FTL engine, qualifications and flexible rostering', hash: '#solutions' },
        ],
    },
    {
        label: 'Extended capabilities',
        items: [
            { name: 'Fleet Maintenance', desc: 'Airworthiness tracking and scheduled maintenance', hash: '#modules' },
            { name: 'Flight Reporting', desc: 'Schedule reporting, EUROCONTROL and ARINC feeds', hash: '#modules' },
            { name: 'Charter Sales & Quotation', desc: 'Quotation tools and marketplace connectivity', hash: '#modules' },
        ],
    },
];

export default function Header({ currentPage, onNavigate, signedIn = false }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(
        () => document.documentElement.getAttribute('data-theme') || 'light'
    );
    // Previous scroll position lives in a ref: as state it was a dependency of
    // the effect below, which re-bound the scroll listener on every frame.
    const lastScrollY = useRef(0);
    const menuButtonRef = useRef(null);
    const [servicesOpen, setServicesOpen] = useState(false);
    const servicesRef = useRef(null);
    const servicesTriggerRef = useRef(null);
    // Closing is deferred so the pointer can cross the gap between the trigger
    // and the panel without the menu collapsing underneath it.
    const closeTimer = useRef(null);
    // Read by the scroll handler, which must not retract the header while the
    // dropdown is open — the panel is anchored to it.
    const servicesOpenRef = useRef(false);

    const openServices = () => {
        clearTimeout(closeTimer.current);
        setServicesOpen(true);
    };

    const closeServices = (immediate = false) => {
        clearTimeout(closeTimer.current);
        if (immediate) setServicesOpen(false);
        else closeTimer.current = setTimeout(() => setServicesOpen(false), 180);
    };

    // Sticky-header styling plus hide-on-scroll-down / show-on-scroll-up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setIsScrolled(currentScrollY > 40);

            if (servicesOpenRef.current) {
                setIsHidden(false);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsHidden(true);
            } else if (currentScrollY < lastScrollY.current) {
                setIsHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync theme to <html> tag. The initial value is set by an inline script in
    // index.html so the page never paints in the wrong theme first.
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        // Opened straight from disk the page has a null origin, where Chrome can
        // refuse storage access. The theme still applies; it just won't persist.
        try {
            localStorage.setItem('theme', theme);
        } catch {
            /* storage unavailable — non-fatal */
        }
    }, [theme]);

    // While the mobile drawer is open: lock body scroll, pin the header in
    // place, and close on Escape.
    useEffect(() => {
        if (!mobileMenuOpen) return;

        setIsHidden(false);

        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setMobileMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [mobileMenuOpen]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // While the panel is open: keep the header on screen, close on Escape, and
    // close on any click outside the trigger/panel pair.
    useEffect(() => {
        servicesOpenRef.current = servicesOpen;
        if (!servicesOpen) return;
        setIsHidden(false);

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeServices(true);
                servicesTriggerRef.current?.focus();
            }
        };
        const onPointerDown = (e) => {
            if (!servicesRef.current?.contains(e.target)) closeServices(true);
        };
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [servicesOpen]);

    useEffect(() => () => clearTimeout(closeTimer.current), []);

    const handleLinkClick = (e, page, targetId) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        onNavigate(page, targetId);
    };

    // The two service pages are reached through Services & Products, so that
    // nav item carries the active state while either is open.
    const onSolutionsPage = currentPage === 'operations' || currentPage === 'commercial';

    return (
        <>
        <header className={`site-header ${isScrolled ? 'is-scrolled' : ''} ${isHidden ? 'is-hidden' : ''}`} id="header">
            <div className="container header-inner">
                <a
                    href="#"
                    className="logo"
                    aria-label="FlightAssist home"
                    onClick={(e) => handleLinkClick(e, 'home', null)}
                >
                    <span className="logo-text">FlightAssist</span>
                    <img src="./assets/logo.png" alt="FlightAssist" width="40" height="40" />
                </a>

                <nav className="main-nav" aria-label="Main navigation">
                    <div
                        className={`nav-item ${servicesOpen ? 'is-open' : ''}`}
                        ref={servicesRef}
                        onMouseEnter={openServices}
                        onMouseLeave={() => closeServices()}
                        onFocus={openServices}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) closeServices(true);
                        }}
                    >
                        <a
                            href="#solutions"
                            ref={servicesTriggerRef}
                            className={`nav-link ${onSolutionsPage ? 'is-active' : ''}`}
                            aria-current={onSolutionsPage ? 'page' : undefined}
                            aria-expanded={servicesOpen}
                            aria-haspopup="true"
                            aria-controls="servicesMenu"
                            onClick={(e) => {
                                closeServices(true);
                                handleLinkClick(e, 'home', '#solutions');
                            }}
                        >
                            Services &amp; Products
                            <svg className="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </a>

                        <div className="nav-dropdown" id="servicesMenu" hidden={!servicesOpen}>
                            <div className="nav-dropdown-inner">
                                {SERVICE_GROUPS.map((group) => (
                                    <div className="nav-dropdown-group" key={group.label}>
                                        <p className="nav-dropdown-label">{group.label}</p>
                                        {group.items.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.page ? `#${item.page}` : item.hash}
                                                className="nav-dropdown-item"
                                                onClick={(e) => {
                                                    closeServices(true);
                                                    handleLinkClick(e, item.page || 'home', item.hash || null);
                                                }}
                                            >
                                                <span className="nav-dropdown-item-name">{item.name}</span>
                                                <span className="nav-dropdown-item-desc">{item.desc}</span>
                                            </a>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <a
                        href="#platform"
                        className="nav-link"
                        onClick={(e) => handleLinkClick(e, 'home', '#platform')}
                    >
                        Platform
                    </a>
                    <a
                        href="#benefits"
                        className="nav-link"
                        onClick={(e) => handleLinkClick(e, 'home', '#benefits')}
                    >
                        Why FlightAssist
                    </a>
                    <a
                        href="#pricing"
                        className={`nav-link ${currentPage === 'pricing' ? 'is-active' : ''}`}
                        aria-current={currentPage === 'pricing' ? 'page' : undefined}
                        onClick={(e) => handleLinkClick(e, 'pricing', null)}
                    >
                        Pricing
                    </a>
                    <a
                        href="#contact"
                        className="nav-link"
                        onClick={(e) => handleLinkClick(e, 'home', '#contact')}
                    >
                        Support
                    </a>
                </nav>

                <div className="header-actions">
                    {/* Takes the slot "Pay Invoice" used to have: the header only
                        fits two buttons beside the nav. Pay Invoice stays in the
                        mobile drawer, the footer and the contact form. */}
                    <a
                        href={signedIn ? '#dashboard' : '#login'}
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => handleLinkClick(e, signedIn ? 'dashboard' : 'login', null)}
                    >
                        {signedIn ? 'Dashboard' : 'Sign In'}
                    </a>
                    <a
                        href="#contact"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => handleLinkClick(e, 'home', '#contact')}
                    >
                        Request Demo
                    </a>

                    <button
                        className="theme-toggle"
                        id="themeToggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                        <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    </button>

                    <button
                        className="menu-toggle"
                        id="menuToggle"
                        ref={menuButtonRef}
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobileNav"
                        onClick={() => setMobileMenuOpen(prev => !prev)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

        </header>

        {/* Rendered as a sibling of <header>, not a child — see note above. */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'is-open' : ''}`} id="mobileNav" aria-label="Mobile navigation">
                <a
                    href="#solutions"
                    onClick={(e) => handleLinkClick(e, 'home', '#solutions')}
                >
                    Services &amp; Products
                </a>
                <a
                    href="#platform"
                    onClick={(e) => handleLinkClick(e, 'home', '#platform')}
                >
                    Platform
                </a>
                <a
                    href="#benefits"
                    onClick={(e) => handleLinkClick(e, 'home', '#benefits')}
                >
                    Why FlightAssist
                </a>
                <a
                    href="#pricing"
                    onClick={(e) => handleLinkClick(e, 'pricing', null)}
                >
                    Pricing
                </a>
                <a
                    href="#contact"
                    onClick={(e) => handleLinkClick(e, 'home', '#contact')}
                >
                    Support
                </a>
                <div className="mobile-nav-actions">
                    <a
                        href={signedIn ? '#dashboard' : '#login'}
                        className="btn btn-ghost"
                        onClick={(e) => handleLinkClick(e, signedIn ? 'dashboard' : 'login', null)}
                    >
                        {signedIn ? 'Open Dashboard' : 'Sign In'}
                    </a>
                    <a
                        href="#contact"
                        className="btn btn-ghost"
                        onClick={(e) => handleLinkClick(e, 'home', '#contact')}
                    >
                        Pay Invoice
                    </a>
                    <a
                        href="#contact"
                        className="btn btn-primary"
                        onClick={(e) => handleLinkClick(e, 'home', '#contact')}
                    >
                        Request Demo
                    </a>
                </div>
        </nav>
        </>
    );
}
