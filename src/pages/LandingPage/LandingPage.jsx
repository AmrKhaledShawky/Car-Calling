import React from "react";
import { Link } from "react-router-dom";
import {
    ShieldCheck,
    Headset,
    BadgeDollarSign,
    Star,
    ArrowRight,
    Fuel,
    Users,
    Calendar,
    Instagram,
    Twitter,
    Facebook
} from "lucide-react";
import "./LandingPage.css";

// Assets
import heroImg from "../../assets/landing/hero.png";
import mercedesImg from "../../assets/landing/mercedes.png";
import bmwImg from "../../assets/landing/bmw.png";
import audiImg from "../../assets/landing/audi.png";

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-navbar">
                <Link to="/" className="landing-logo">
                    Car <span>Calling</span>
                </Link>
                <div className="nav-links">
                    <a href="#home" className="nav-link">Home</a>
                    <a href="#about" className="nav-link">About</a>
                    <a href="#contact" className="nav-link">Contact</a>
                </div>
                <div className="nav-auth">
                    <Link to="/login" className="btn-login">Login</Link>
                    <Link to="/auth/register" className="btn-register">Register</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section" id="home">
                <div className="hero-content">
                    <h1>Rent Your <span>Perfect</span> Car with Ease</h1>
                    <p>
                        Experience luxury and comfort with our premium fleet.
                        Whether for business or leisure, find the ride that defines your journey.
                    </p>
                    <Link to="/login" className="btn-primary">
                        Browse Available Cars <ArrowRight size={20} />
                    </Link>
                </div>
                <div className="hero-image-container">
                    <div className="hero-image-wrapper">
                        <img src={heroImg} alt="Luxury Car" className="hero-image" />
                    </div>
                    <div className="hero-badge">
                        <div className="badge-icon">
                            <Fuel size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>FUEL EFFICIENCY</p>
                            <p style={{ fontWeight: 'bold', margin: 0 }}>Premium</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Featured Cars Section */}
            <section className="featured-section">
                <div className="section-header">
                    <div>
                        <h2><span>Top picks from our luxury collection</span>Featured Cars</h2>
                    </div>
                    <Link to="/login" className="view-all">
                        View All +
                    </Link>
                </div>

                <div className="cars-grid">
                    {/* Car 1 */}
                    <div className="car-card">
                        <img src={mercedesImg} alt="Mercedes-Benz S-Class" className="car-image" />
                        <div className="car-info">
                            <div className="car-meta">
                                <span className="car-type">Luxury Sedan</span>
                                <div className="car-rating">
                                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                    4.9
                                </div>
                            </div>
                            <h3>Mercedes-Benz S-Class</h3>
                            <div className="car-specs">
                                <div className="spec-item"><Fuel size={16} /> 0-60 in 4.5s</div>
                                <div className="spec-item"><Users size={16} /> 5 Seats</div>
                            </div>
                            <div className="car-footer">
                                <div className="car-price">
                                    Daily Rate<br />
                                    <span>E£ 1,200</span> / day
                                </div>
                                <Link to="/login" className="btn-details">View Details</Link>
                            </div>
                        </div>
                    </div>

                    {/* Car 2 */}
                    <div className="car-card">
                        <img src={bmwImg} alt="BMW 7 Series" className="car-image" />
                        <div className="car-info">
                            <div className="car-meta">
                                <span className="car-type">Executive Sedan</span>
                                <div className="car-rating">
                                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                    4.8
                                </div>
                            </div>
                            <h3>BMW 7 Series</h3>
                            <div className="car-specs">
                                <div className="spec-item"><Fuel size={16} /> 0-60 in 5.1s</div>
                                <div className="spec-item"><Users size={16} /> 5 Seats</div>
                            </div>
                            <div className="car-footer">
                                <div className="car-price">
                                    Daily Rate<br />
                                    <span>E£ 1,100</span> / day
                                </div>
                                <Link to="/login" className="btn-details">View Details</Link>
                            </div>
                        </div>
                    </div>

                    {/* Car 3 */}
                    <div className="car-card">
                        <img src={audiImg} alt="Audi RS 7" className="car-image" />
                        <div className="car-info">
                            <div className="car-meta">
                                <span className="car-type">Sports Coupe</span>
                                <div className="car-rating">
                                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                    5.0
                                </div>
                            </div>
                            <h3>Audi RS 7</h3>
                            <div className="car-specs">
                                <div className="spec-item"><Fuel size={16} /> 0-60 in 3.6s</div>
                                <div className="spec-item"><Users size={16} /> 4 Seats</div>
                            </div>
                            <div className="car-footer">
                                <div className="car-price">
                                    Daily Rate<br />
                                    <span>E£ 1,500</span> / day
                                </div>
                                <Link to="/login" className="btn-details">View Details</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="features-section">
                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <ShieldCheck size={32} />
                    </div>
                    <h4>Verified Security</h4>
                    <p>Every vehicle undergoes rigorous safety checks.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <Headset size={32} />
                    </div>
                    <h4>24/7 Support</h4>
                    <p>Our dedicated team is always here to assist you.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <BadgeDollarSign size={32} />
                    </div>
                    <h4>Best Price Guarantee</h4>
                    <p>Competitive rates for luxury experiences.</p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Find Your Next Ride Now!</h2>
                    <p>Ready to hit the road in style? Join thousands of satisfied customers and book your premium vehicle today.</p>
                    <Link to="/auth/register" className="btn-cta">Book Your Car</Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <h3>Car <span>Calling</span></h3>
                        <p>Premium car rental services delivering luxury, comfort, and style directly to you.</p>
                    </div>
                    <div className="footer-col">
                        <h5>Company</h5>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#careers">Careers</a></li>
                            <li><a href="#blog">Blog</a></li>
                            <li><a href="#press">Press</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h5>Support</h5>
                        <ul>
                            <li><a href="#help">Help Center</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#contact">Contact Us</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h5>Follow Us</h5>
                        <div className="social-links">
                            <a href="#fb" className="social-link"><Facebook size={20} /></a>
                            <a href="#ig" className="social-link"><Instagram size={20} /></a>
                            <a href="#tw" className="social-link"><Twitter size={20} /></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 Car Calling Inc. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <Link to="/privacy">Privacy</Link>
                        <a href="#terms">Terms</a>
                        <a href="#sitemap">Sitemap</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
