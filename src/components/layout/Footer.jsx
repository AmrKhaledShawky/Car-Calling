import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="main-footer" id="contact">
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
                        <li><Link to="/privacy">Privacy Policy</Link></li>
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
    );
};

export default Footer;
