import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlobeFlights } from '../components/ui/GlobeFlights';
import HeroBackdrop from '../components/HeroBackdrop';

// Hoisted to module scope: GlobeFlights keys its init effect on this array,
// so an inline literal would tear down and rebuild the globe on every render.
const HERO_AIRPORTS = [
    { id: "apt-jfk", location: [40.64, -73.78] },
    { id: "apt-lhr", location: [51.47, -0.46] },
    { id: "apt-dxb", location: [25.25, 55.36] },
    { id: "apt-nrt", location: [35.55, 139.78] },
    { id: "apt-sfo", location: [37.62, -122.38] },
    { id: "apt-sin", location: [1.36, 103.99] },
    { id: "apt-nbo", location: [-1.29, 36.82] },
    { id: "apt-bom", location: [19.08, 72.88] },
];

// Integration areas shown on the home page. Wording mirrors how scope is
// agreed with each operator during discovery.
const INTEGRATION_AREAS = [
    {
        title: 'Operational data',
        text: 'Plan controlled exchanges with approved flight, aircraft, and operational data sources.',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
    },
    {
        title: 'Identity and access',
        text: 'Define account lifecycle, roles, tenant boundaries, and any approved identity-provider connection.',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><circle cx="12" cy="10" r="2.5" /><path d="M8.5 16a3.5 3.5 0 0 1 7 0" /></svg>,
    },
    {
        title: 'Communications',
        text: 'Configure authorised email and notification channels without placing secrets in application code.',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    },
    {
        title: 'Commercial systems',
        text: 'Connect billing or payment workflows only after ownership, validation, and audit requirements are agreed.',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
    },
];

const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { 
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
    }
};

export default function Home({ onNavigate }) {
    const [submittingSubscribe, setSubmittingSubscribe] = useState(false);
    const [subscribeStatus, setSubscribeStatus] = useState('');
    const [submittingContact, setSubmittingContact] = useState(false);
    const [contactStatus, setContactStatus] = useState('');

    const handleSubscribeSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        setSubmittingSubscribe(true);
        setSubscribeStatus('Sent!');
        setTimeout(() => {
            setSubmittingSubscribe(false);
            setSubscribeStatus('');
            form.reset();
        }, 2500);
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        setSubmittingContact(true);
        setContactStatus('Sent!');
        setTimeout(() => {
            setSubmittingContact(false);
            setContactStatus('');
            form.reset();
        }, 2500);
    };

    const handleNavClick = (e, page, targetId) => {
        e.preventDefault();
        onNavigate(page, targetId);
    };

    return (
        <main id="main" tabIndex={-1}>
            {/* Hero */}
            <section className="hero" id="hero">
                <HeroBackdrop />
                <div className="hero-overlay" aria-hidden="true"></div>

                <div className="container hero-content">
                    <motion.span
                        className="eyebrow"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Airline Management System
                    </motion.span>
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                    >
                        Power your fleet with <span>FlightAssist</span>
                    </motion.h1>
                    <motion.p
                        className="hero-description"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        FlightAssist is a comprehensive commercial aviation software platform built for airlines, charter operators, and flight support companies. Manage schedules, dispatch, crew, and commercial planning — all in one integrated system.
                    </motion.p>
                    <motion.div
                        className="hero-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.45 }}
                    >
                        <a href="#contact" className="btn btn-primary btn-lg" onClick={(e) => handleNavClick(e, 'home', '#contact')}>Request a Demo</a>
                        <a href="#solutions" className="btn btn-secondary btn-lg" onClick={(e) => handleNavClick(e, 'home', '#solutions')}>Explore Solutions</a>
                    </motion.div>
                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    >
                        <div>
                            <span className="hero-stat-value">500+</span>
                            <span className="hero-stat-label">Aircraft managed globally</span>
                        </div>
                        <div>
                            <span className="hero-stat-value">24/7</span>
                            <span className="hero-stat-label">Operations support</span>
                        </div>
                        <div>
                            <span className="hero-stat-value">99.9%</span>
                            <span className="hero-stat-label">Platform uptime</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trust bar */}
            <section className="trust-bar" aria-label="Trusted by aviation operators">
                <div className="container-wide trust-bar-inner">
                    <span className="trust-label">Trusted by aviation operators worldwide</span>
                    <div className="trust-logos">
                        <span className="trust-logo">Charter Operators</span>
                        <span className="trust-logo">Scheduled Airlines</span>
                        <span className="trust-logo">Flight Support</span>
                        <span className="trust-logo">Corporate Aviation</span>
                        <span className="trust-logo">MRO Partners</span>
                    </div>
                </div>
            </section>

            {/* Solutions */}
            <section className="section section--white" id="solutions">
                <div className="container">
                    <div className="section-header section-header--center">
                        <span className="eyebrow">Core Modules</span>
                        <h2 className="section-title">Complete flight operations suite</h2>
                        <p className="section-subtitle">
                            From dispatch to crew rostering, FlightAssist delivers the tools your operations team needs — configurable to your workflow, just like the industry&rsquo;s best.
                        </p>
                    </div>

                    <motion.div
                        className="card-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.article className="feature-card gradient-hover" tabIndex={0} variants={fadeInUp}>
                            <div className="feature-card-bg">
                                <img src="./assets/images/operation center.jpg" alt="" loading="lazy" width="800" height="600" />
                            </div>
                            <div className="feature-card-overlay" aria-hidden="true"></div>
                            <div className="feature-card-content">
                                <h3 className="card-title">Operations Control</h3>
                                <p className="card-text">Real-time flight monitoring, dispatch CRM, and integrated movement messaging. Keep your ops center in complete control around the clock.</p>
                                <a href="#operations" className="btn btn-primary btn-sm" onClick={(e) => handleNavClick(e, 'operations', null)}>Learn More</a>
                            </div>
                        </motion.article>

                        <motion.article className="feature-card gradient-hover" tabIndex={0} variants={fadeInUp}>
                            <div className="feature-card-bg">
                                <img src="./assets/images/commercial planning.jpg" alt="" loading="lazy" width="800" height="600" />
                            </div>
                            <div className="feature-card-overlay" aria-hidden="true"></div>
                            <div className="feature-card-content">
                                <h3 className="card-title">Commercial Planning</h3>
                                <p className="card-text">Optimize routes, manage charter sales, and plan revenue with powerful scheduling tools built for commercial aviation teams.</p>
                                <a href="#commercial" className="btn btn-primary btn-sm" onClick={(e) => handleNavClick(e, 'commercial', null)}>Learn More</a>
                            </div>
                        </motion.article>

                        <motion.article className="feature-card gradient-hover" tabIndex={0} variants={fadeInUp}>
                            <div className="feature-card-bg">
                                <img src="./assets/images/crew managment.jpg" alt="" loading="lazy" width="800" height="600" />
                            </div>
                            <div className="feature-card-overlay" aria-hidden="true"></div>
                            <div className="feature-card-content">
                                <h3 className="card-title">Crew Management</h3>
                                <p className="card-text">Advanced FTL engine, qualification tracking, and flexible rostering with draft-mode scenario planning for your entire crew.</p>
                                <a href="#contact" className="btn btn-primary btn-sm" onClick={(e) => handleNavClick(e, 'home', '#contact')}>Learn More</a>
                            </div>
                        </motion.article>
                    </motion.div>
                </div>
            </section>

            {/* Benefits */}
            <section className="section section--light" id="benefits">
                <div className="container">
                    <div className="section-header section-header--center">
                        <span className="eyebrow">Why FlightAssist</span>
                        <h2 className="section-title">Built for aviation professionals</h2>
                        <p className="section-subtitle">
                            We understand the complexity of flight operations. FlightAssist is designed to simplify your workflow while maintaining the highest standards of safety and compliance.
                        </p>
                    </div>

                    <motion.div
                        className="benefits-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {[
                            { icon: 'shield', title: 'Safe & Reliable', text: 'Enterprise-grade security with ISO-certified infrastructure and proven FTL compliance.' },
                            { icon: 'dollar', title: 'Minimize Costs', text: 'Reduce operational overhead with integrated workflows and automated reporting.' },
                            { icon: 'link', title: 'Fully Integrated', text: 'Connect with PSS, DCS, and third-party systems via our powerful GraphQL API.' },
                            { icon: 'users', title: 'Client-Focused', text: 'Dedicated account managers and a support team that understands aviation operations.' },
                            { icon: 'help', title: 'Quick Support', text: '24/7 global support with rapid response times for critical operational issues.' }
                        ].map((benefit, idx) => (
                            <motion.article className="benefit-card gradient-hover" key={idx} variants={fadeInUp}>
                                <div className="benefit-icon">
                                    {benefit.icon === 'shield' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>}
                                    {benefit.icon === 'dollar' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                                    {benefit.icon === 'link' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>}
                                    {benefit.icon === 'users' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                                    {benefit.icon === 'help' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z" /><path d="M14 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-5Z" /><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12V4a2 2 0 0 0-4 0v8a2.5 2.5 0 0 0 2.5 2.5Z" /><path d="M15.5 14.5A2.5 2.5 0 0 0 18 12V4a2 2 0 0 0-4 0v8a2.5 2.5 0 0 0 2.5 2.5Z" /></svg>}
                                </div>
                                <h3 className="benefit-title">{benefit.title}</h3>
                                <p className="benefit-text">{benefit.text}</p>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Integrations */}
            <section className="section section--white" id="platform">
                <div className="container integrations">
                    <div className="integrations-intro">
                        <span className="eyebrow">Integrations</span>
                        <h2 className="section-title">Fit FlightAssist into your operating environment</h2>
                        <p className="section-subtitle">
                            Integration scope is confirmed during discovery. We document systems, data ownership, update frequency, security boundaries, and failure handling before any production connection is enabled.
                        </p>
                    </div>

                    <motion.ol
                        className="integrations-list"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                    >
                        {INTEGRATION_AREAS.map((area, idx) => (
                            <motion.li className="integration-row" key={area.title} variants={fadeInUp}>
                                <span className="integration-num">{String(idx + 1).padStart(2, '0')}</span>
                                <div className="integration-body">
                                    <h3 className="integration-title">{area.title}</h3>
                                    <p className="integration-text">{area.text}</p>
                                </div>
                                <span className="integration-icon" aria-hidden="true">{area.icon}</span>
                            </motion.li>
                        ))}
                    </motion.ol>
                </div>
            </section>

            {/* Stats */}
            <section className="section section--dark stats-section">
                <div className="stats-globe" aria-hidden="true">
                    <div className="stats-globe-inner">
                        <GlobeFlights markers={HERO_AIRPORTS} speed={0.0012} />
                    </div>
                </div>

                <div className="container">
                    <div className="section-header section-header--center">
                        <span className="eyebrow">By the Numbers</span>
                        <h2 className="section-title section-title--light">Proven at scale</h2>
                        <p className="section-subtitle section-subtitle--light">
                            FlightAssist powers daily operations for aviation companies across the globe — from single-aircraft operators to multi-fleet airlines.
                        </p>
                    </div>

                    <motion.div
                        className="stats-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            { val: '500+', lbl: 'Aircraft under management' },
                            { val: '40+', lbl: 'Countries served' },
                            { val: '15+', lbl: 'Years of aviation expertise' },
                            { val: 'ISO', lbl: '27001 certified security' }
                        ].map((stat, idx) => (
                            <motion.div className="stat-card" key={idx} variants={fadeInUp}>
                                <span className="stat-value">{stat.val}</span>
                                <span className="stat-label">{stat.lbl}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Additional modules */}
            <section className="section section--light" id="modules">
                <div className="container">
                    <div className="section-header section-header--center">
                        <span className="eyebrow">Extended Capabilities</span>
                        <h2 className="section-title">Everything your operations need</h2>
                        <p className="section-subtitle">
                            Advanced modules that grow with your organization — from fleet maintenance to flight reporting and sales quotation.
                        </p>
                    </div>

                    <motion.div
                        className="card-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.article className="gradient-card gradient-hover" variants={fadeInUp}>
                            <div className="gradient-card-inner">
                                <div className="card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                </div>
                                <h3 className="card-title">Fleet Maintenance</h3>
                                <p className="card-text">Track airworthiness, manage endorsements, and schedule maintenance with automated notifications.</p>
                                <a href="#contact" className="card-link" onClick={(e) => handleNavClick(e, 'home', '#contact')}>
                                    Learn more <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                </a>
                            </div>
                        </motion.article>

                        <motion.article className="gradient-card gradient-hover" variants={fadeInUp}>
                            <div className="gradient-card-inner">
                                <div className="card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                                </div>
                                <h3 className="card-title">Flight Reporting</h3>
                                <p className="card-text">Advanced schedule reporting, EUROCONTROL integration, and ARINC flight watch information.</p>
                                <a href="#contact" className="card-link" onClick={(e) => handleNavClick(e, 'home', '#contact')}>
                                    Learn more <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                </a>
                            </div>
                        </motion.article>

                        <motion.article className="gradient-card gradient-hover" variants={fadeInUp}>
                            <div className="gradient-card-inner">
                                <div className="card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                </div>
                                <h3 className="card-title">Charter Sales &amp; Quotation</h3>
                                <p className="card-text">Streamline charter sales with integrated quotation tools and marketplace connectivity.</p>
                                <a href="#contact" className="card-link" onClick={(e) => handleNavClick(e, 'home', '#contact')}>
                                    Learn more <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                </a>
                            </div>
                        </motion.article>
                    </motion.div>
                </div>
            </section>

            {/* Subscribe CTA */}
            <section className="section section--white">
                <div className="container">
                    <div className="cta-banner">
                        <div className="cta-banner-bg">
                            <img src="https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1400&q=80" alt="" loading="lazy" width="1400" height="600" />
                        </div>
                        <div className="cta-banner-overlay" aria-hidden="true"></div>
                        <div className="cta-banner-content">
                            <div>
                                <h2 className="section-title section-title--light" style={{ marginBottom: '12px' }}>Stay in touch</h2>
                                <p className="section-subtitle section-subtitle--light">
                                    Sign up to hear from us about product updates, aviation insights, and industry events.
                                </p>
                            </div>
                            <form className="cta-form" id="subscribeForm" onSubmit={handleSubscribeSubmit} noValidate>
                                <input type="email" name="email" placeholder="Enter your email" required aria-label="Email address" />
                                <button type="submit" className="btn btn-primary" disabled={submittingSubscribe}>
                                    {subscribeStatus || 'Sign Up'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="section section--light" id="contact">
                <div className="container">
                    <div className="section-header">
                        <span className="eyebrow">Contact Us</span>
                        <h2 className="section-title">Let&rsquo;s talk about your operations</h2>
                        <p className="section-subtitle">
                            Better yet, see us in person! We love our customers, so feel free to visit during normal business hours.
                        </p>
                    </div>

                    <div className="contact-grid">
                        <div className="contact-info">
                            <div className="contact-info-item">
                                <div className="contact-info-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                </div>
                                <div>
                                    <p className="contact-info-label">Headquarters</p>
                                    <p className="contact-info-value">Aviation Business Park, Suite 400<br />Global Operations Center</p>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <div className="contact-info-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                </div>
                                <div>
                                    <p className="contact-info-label">Phone</p>
                                    <p className="contact-info-value">+1 (800) 555-FLGT</p>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <div className="contact-info-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                </div>
                                <div>
                                    <p className="contact-info-label">Email</p>
                                    <p className="contact-info-value">contact@flightassist.com</p>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <div className="contact-info-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </div>
                                <div>
                                    <p className="contact-info-label">Business Hours</p>
                                    <p className="contact-info-value">Mon – Fri: 8:00 AM – 6:00 PM<br />24/7 Emergency Ops Support</p>
                                </div>
                            </div>
                        </div>

                        <form className="contact-form" id="contactForm" onSubmit={handleContactSubmit} noValidate>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input type="text" id="firstName" name="firstName" required autoComplete="given-name" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input type="text" id="lastName" name="lastName" required autoComplete="family-name" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="company">Company / AOC</label>
                                <input type="text" id="company" name="company" required autoComplete="organization" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" required autoComplete="email" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="interest">I&rsquo;m interested in</label>
                                <select id="interest" name="interest">
                                    <option value="demo">Request a Demo</option>
                                    <option value="pricing">Pricing Information</option>
                                    <option value="support">Technical Support</option>
                                    <option value="invoice">Pay Invoice</option>
                                    <option value="partnership">Partnership / API</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea id="message" name="message" placeholder="Tell us about your fleet and operations..."></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submittingContact}>
                                {contactStatus || 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}
