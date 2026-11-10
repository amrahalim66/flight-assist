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

export default function CommercialPlanning({ onNavigate }) {
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
                        <span>Commercial Planning</span>
                    </nav>

                    <motion.h1
                        className="hero-title hero-title--dark"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Commercial <span>Planning</span>
                    </motion.h1>
                    <motion.p
                        className="hero-description hero-description--dark"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                    >
                        Optimize routes, manage charter sales, and plan revenue with powerful scheduling tools built for commercial aviation teams. Build more efficient and profitable flight schedules with optimum aircraft utilization.
                    </motion.p>
                </div>
            </section>

            {/* Feature 1: Optimized Flight Schedules */}
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
                            <img src="./assets/images/commercial planning.jpg" alt="Optimized Flight Schedules" loading="lazy" />
                        </motion.div>

                        <div className="feature-detail-content">
                            <span className="eyebrow">Schedule Planning</span>
                            <h2 className="section-title">Optimized Flight Schedules</h2>
                            <p className="feature-intro">Provides the Commercial / Schedules Planning Departments with the facility to compile more efficient and profitable flight schedules with optimum aircraft utilization.</p>

                            <motion.ul
                                className="feature-list"
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {[
                                    "Advanced route optimization algorithms to maximize efficiency and profitability",
                                    "Intelligent fleet assignment based on aircraft type, capacity, and operational constraints",
                                    "Comprehensive profitability analysis for each route and schedule variation",
                                    "Unlimited \"what-if\" scenario planning to evaluate different schedule configurations",
                                    "Seasonal schedule management with automatic adjustments for demand variations",
                                    "Network planning tools for multi-city route optimization and connectivity"
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

            {/* Feature 2: Fully Integrated */}
            <section className="section section--light">
                <div className="container">
                    <div className="feature-detail feature-detail--reverse">
                        <div className="feature-detail-content">
                            <span className="eyebrow">System Integration</span>
                            <h2 className="section-title">Fully Integrated</h2>
                            <p className="feature-intro">Integrated with the Operations Control and Crew Management modules of FlightAssist Crew Management, ensuring that flight schedules under construction are achievable based on the availability of required aircraft and qualified crew members.</p>

                            <motion.ul
                                className="feature-list"
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {[
                                    "Real-time data synchronization across all operational systems for accurate planning",
                                    "Automatic validation of crew availability and qualification requirements",
                                    "Aircraft availability checking with maintenance schedule coordination",
                                    "Automated conflict detection and resolution suggestions for scheduling issues",
                                    "Seamless workflow from planning to execution with minimal manual intervention"
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
                            <img src="./assets/images/operation center.jpg" alt="Fully Integrated System" loading="lazy" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature 3: Revenue Management */}
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
                            <img src="./assets/images/crew managment.jpg" alt="Revenue Management" loading="lazy" />
                        </motion.div>

                        <div className="feature-detail-content">
                            <span className="eyebrow">Revenue Optimization</span>
                            <h2 className="section-title">Revenue Management</h2>
                            <p className="feature-intro">Maximize revenue potential through intelligent capacity management, demand forecasting, and market analysis tools designed specifically for commercial aviation planning.</p>

                            <motion.ul
                                className="feature-list"
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {[
                                    "Advanced capacity optimization to balance supply with market demand",
                                    "Seasonal planning tools with historical data analysis and trend forecasting",
                                    "Market analysis capabilities for competitive route evaluation and pricing",
                                    "Demand forecasting based on historical patterns and market conditions",
                                    "Charter sales management with quotation tools and marketplace connectivity"
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
                        <span className="eyebrow">Key Benefits</span>
                        <h2 className="section-title">Smarter Commercial Planning</h2>
                    </div>
                    <div className="overview-grid">
                        <div className="overview-item">
                            <div className="overview-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <h3>Increased Profitability</h3>
                            <p>Optimize schedules for maximum revenue while minimizing operational costs and inefficiencies.</p>
                        </div>
                        <div className="overview-item">
                            <div className="overview-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v18h18" />
                                    <path d="m19 9-5 5-4-4-3 3" />
                                </svg>
                            </div>
                            <h3>Data-Driven Decisions</h3>
                            <p>Make informed planning decisions backed by comprehensive analytics and forecasting tools.</p>
                        </div>
                        <div className="overview-item">
                            <div className="overview-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <h3>Faster Planning</h3>
                            <p>Reduce schedule planning time with automated tools and intelligent recommendations.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section section--dark">
                <div className="container">
                    <div className="cta-center">
                        <h2 className="section-title section-title--light">Transform your commercial planning</h2>
                        <p className="section-subtitle section-subtitle--light">
                            Discover how FlightAssist Commercial Planning can help you build more profitable schedules and optimize your network.
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
