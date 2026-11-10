export default function Footer({ onNavigate }) {
    const handleLinkClick = (e, page, targetId) => {
        e.preventDefault();
        onNavigate(page, targetId);
    };

    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo-wrapper">
                            <span className="footer-logo-text">FlightAssist</span>
                            <img src="./assets/logo.png" alt="FlightAssist" className="footer-logo" width="38" height="38" />
                        </div>
                        <p>Professional airline management software for commercial aviation. Powering flight operations worldwide since 2010.</p>
                    </div>
                    <div>
                        <h3 className="footer-heading">Products</h3>
                        <ul className="footer-links">
                            <li>
                                <a href="#operations" onClick={(e) => handleLinkClick(e, 'operations', null)}>
                                    Operations Control
                                </a>
                            </li>
                            <li>
                                <a href="#commercial" onClick={(e) => handleLinkClick(e, 'commercial', null)}>
                                    Commercial Planning
                                </a>
                            </li>
                            <li>
                                <a href="#solutions" onClick={(e) => handleLinkClick(e, 'home', '#solutions')}>
                                    Crew Management
                                </a>
                            </li>
                            <li>
                                <a href="#platform" onClick={(e) => handleLinkClick(e, 'home', '#platform')}>
                                    Mobile Apps
                                </a>
                            </li>
                            <li>
                                <a href="#platform" onClick={(e) => handleLinkClick(e, 'home', '#platform')}>
                                    API &amp; Integrations
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" onClick={(e) => handleLinkClick(e, 'pricing', null)}>
                                    Pricing
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="footer-heading">Company</h3>
                        <ul className="footer-links">
                            <li>
                                <a href="#benefits" onClick={(e) => handleLinkClick(e, 'home', '#benefits')}>
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', '#contact')}>
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', '#contact')}>
                                    Press
                                </a>
                            </li>
                            <li>
                                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', '#contact')}>
                                    Security
                                </a>
                            </li>
                            <li>
                                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', '#contact')}>
                                    Compliance
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="footer-heading">Support</h3>
                        <ul className="footer-links">
                            <li>
                                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', '#contact')}>
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', '#contact')}>
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', '#contact')}>
                                    System Status
                                </a>
                            </li>
                            <li>
                                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', '#contact')}>
                                    Pay Invoice
                                </a>
                            </li>
                            <li>
                                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', '#contact')}>
                                    Contact Sales
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>&copy; {new Date().getFullYear()} FlightAssist. All rights reserved.</span>
                    <div className="footer-legal">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Settings</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
