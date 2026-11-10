import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function OperationsControl({ onNavigate }) {
    const handleNavClick = (e, page, targetId) => {
        e.preventDefault();
        onNavigate(page, targetId);
    };

    return (
        <main id="main" tabIndex={-1}>
            {/* Hero */}
            <section className="hero hero--service hero--simple" style={{ position: 'relative' }}>

                <div className="container hero-content" style={{ position: 'relative', zIndex: 1 }}>
                    <nav className="breadcrumb" aria-label="Breadcrumb">
                        <a href="#home" onClick={(e) => handleNavClick(e, 'home', null)}>Home</a>
                        <span>/</span>
                        <a href="#solutions" onClick={(e) => handleNavClick(e, 'home', '#solutions')}>Services</a>
                        <span>/</span>
                        <span>Operations Control</span>
                    </nav>

                    <motion.h1
                        className="hero-title hero-title--dark"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Operations <span>Control</span>
                    </motion.h1>
                    <motion.p
                        className="hero-description hero-description--dark"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                    >
                        Real-time flight monitoring, dispatch CRM, and integrated movement messaging. Keep your ops center in complete control around the clock with advanced aircraft management capabilities.
                    </motion.p>
                </div>
            </section>

            {/* Feature 1: Aircraft Movement Control */}
            <section className="section section--white">
                <div className="container">
                    <div className="feature-detail">
                        <motion.div
                            className="feature-detail-visual"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <img src="./assets/images/operation center.jpg" alt="Aircraft Movement Control" loading="lazy" />
                        </motion.div>

                        <div className="feature-detail-content">
                            <span className="eyebrow">Core System</span>
                            <h2 className="section-title">Aircraft Movement Control</h2>
                            <p className="feature-intro">Maximizes on-time performance through optimization of aircraft utilization. Automatic re-allocation and optimization of individual aircraft in response to the updating of maintenance plans.</p>

                            <motion.ul
                                className="feature-list"
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {[
                                    "Scrollable displays from six hours to one month for actual or projected operations",
                                    "Automatic update and problem resolution following user-updated or receipt of longer period SITA aircraft movement messages via SITATEX",
                                    "Automatically displays impending/actual aircraft restrictions and crew duty violations following input of schedule variations or receipt of delays messages",
                                    "Facilitates rapid rescheduling of aircraft and crews to resolve delays of minimize their cumulative effect and cost of the overall operation",
                                    "Over-ride facilities permit user to evaluate alternative problem solutions",
                                    "System warns user of conflicting or illegal aircraft/crew selections in manual mode, but authorized user can still override if required"
                                ].map((item, idx) => (
                                    <motion.li key={idx} variants={fadeInUp}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Aircraft Maintenance Schedule Planning */}
            <section className="section section--light">
                <div className="container">
                    <div className="feature-detail feature-detail--reverse">
                        <div className="feature-detail-content">
                            <span className="eyebrow">Integrated Planning</span>
                            <h2 className="section-title">Aircraft Maintenance Planning</h2>
                            <p className="feature-intro">A fully integrated sub-system of Operations Control that facilitates the construction of highly efficient single or multi-fleet aircraft maintenance plans based on any annual or seasonal schedules plan conforming with national and company regulations.</p>

                            <motion.ul
                                className="feature-list"
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {[
                                    "Can incorporate commercial, operational and technical restrictions imposed on fleets or individual aircraft by registration letters or tail numbers",
                                    "Rapid generation of unlimited \"what if\" planning scenarios to achieve optimum aircraft utilization and minimize costs",
                                    "Automatically updates individual aircraft hours, cycles, checks and other technical restrictions facilitating daily aircraft assignment by registration letters or tail numbers to the flying program"
                                ].map((item, idx) => (
                                    <motion.li key={idx} variants={fadeInUp}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </div>

                        <motion.div
                            className="feature-detail-visual"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <img src="./assets/images/commercial planning.jpg" alt="Aircraft Maintenance Schedule Planning" loading="lazy" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature 3: Aircraft Schedule Construction */}
            <section className="section section--white">
                <div className="container">
                    <div className="feature-detail">
                        <motion.div
                            className="feature-detail-visual"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <img src="./assets/images/crew managment.jpg" alt="Aircraft Schedule Construction" loading="lazy" />
                        </motion.div>

                        <div className="feature-detail-content">
                            <span className="eyebrow">Schedule Management</span>
                            <h2 className="section-title">Aircraft Schedule Construction</h2>
                            <p className="feature-intro">Provides coverage of all flight sectors of the schedule according to aircraft type requirements. Fully incorporates all planned aircraft maintenance events and User-defined planning limitations.</p>

                            <motion.ul
                                className="feature-list"
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {[
                                    "Automatically allocates aircraft registration letters or tail numbers",
                                    "Ability to link specific aircraft routes and has aircraft routes follow specific crew routes"
                                ].map((item, idx) => (
                                    <motion.li key={idx} variants={fadeInUp}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Benefits Overview */}
            <section className="section section--light">
                <div className="container">
                    <div className="section-header section-header--center">
                        <span className="eyebrow">Key Capabilities</span>
                        <h2 className="section-title">Complete Operational Control</h2>
                    </div>
                    <div className="overview-grid">
                        <div className="overview-item">
                            <div className="overview-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <h3>Real-Time Monitoring</h3>
                            <p>Track all aircraft movements and operations with live updates and automatic problem resolution.</p>
                        </div>
                        <div className="overview-item">
                            <div className="overview-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <h3>Optimized Scheduling</h3>
                            <p>Automated aircraft allocation and maintenance planning for maximum efficiency.</p>
                        </div>
                        <div className="overview-item">
                            <div className="overview-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                            </div>
                            <h3>Complete Integration</h3>
                            <p>Seamless connection with SITA, SITATEX, and all operational systems.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section section--dark">
                <div className="container">
                    <div className="cta-center">
                        <h2 className="section-title section-title--light">Ready to optimize your operations?</h2>
                        <p className="section-subtitle section-subtitle--light">
                            See how FlightAssist Operations Control can transform your airline&rsquo;s efficiency and performance.
                        </p>
                        <div className="cta-actions">
                            <a href="#contact" className="btn btn-primary btn-lg" onClick={(e) => handleNavClick(e, 'home', '#contact')}>Request Demo</a>
                            <a href="#contact" className="btn btn-secondary btn-lg" onClick={(e) => handleNavClick(e, 'home', '#contact')}>Contact Sales</a>
                        </div>
                        <a href="#solutions" className="back-link" onClick={(e) => handleNavClick(e, 'home', '#solutions')}>← Back to All Services</a>
                    </div>
                </div>
            </section>
        </main>
    );
}
