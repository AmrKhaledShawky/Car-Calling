import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ShieldCheck,
    Headset,
    BadgeDollarSign,
    Star,
    ArrowRight,
    Fuel,
    Users
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { apiCall } from "../../utils/api";
import "./LandingPage.css";

import heroImg from "../../assets/landing/hero.png";

const formatCurrency = (value) => `E£ ${Number(value || 0).toFixed(2)}`;

const getCarImage = (car) => car?.primaryImage?.url || car?.images?.[0]?.url || heroImg;

const LandingPageReal = () => {
    const [featuredCars, setFeaturedCars] = useState([]);

    useEffect(() => {
        const loadFeaturedCars = async () => {
            try {
                const response = await apiCall("/cars/available");
                setFeaturedCars((response.data || []).slice(0, 3));
            } catch (error) {
                console.error("Failed to load featured cars:", error);
            }
        };

        loadFeaturedCars();
    }, []);

    return (
        <div className="landing-page">
            <Navbar transparent={true} />

            <header className="hero-section" id="home">
                <div className="hero-content">
                    <h1>Rent Your <span>Perfect</span> Car with Ease</h1>
                    <p>
                        Experience luxury and comfort with our premium fleet.
                        Whether for business or leisure, find the ride that defines your journey.
                    </p>
                    <Link to="/browse-cars" className="btn-primary">
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
                            <p style={{ fontSize: "0.7rem", color: "#888", margin: 0 }}>FUEL EFFICIENCY</p>
                            <p style={{ fontWeight: "bold", margin: 0 }}>Premium</p>
                        </div>
                    </div>
                </div>
            </header>

            <section className="featured-section">
                <div className="section-header">
                    <div>
                        <h2><span>Top picks from our live fleet</span>Featured Cars</h2>
                    </div>
                    <Link to="/browse-cars" className="view-all">
                        View All +
                    </Link>
                </div>

                <div className="cars-grid">
                    {featuredCars.map((car) => (
                        <div className="car-card" key={car._id}>
                            <img src={getCarImage(car)} alt={`${car.make} ${car.model}`} className="car-image" />
                            <div className="car-info">
                                <div className="car-meta">
                                    <span className="car-type">{car.category || "Featured Car"}</span>
                                    <div className="car-rating">
                                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                        {Number(car.averageRating || 0).toFixed(1)}
                                    </div>
                                </div>
                                <h3>{`${car.year || ""} ${car.make || ""} ${car.model || ""}`.trim()}</h3>
                                <div className="car-specs">
                                    <div className="spec-item"><Fuel size={16} /> {car.fuelType || "Fuel info pending"}</div>
                                    <div className="spec-item"><Users size={16} /> {car.seats || "N/A"} Seats</div>
                                </div>
                                <div className="car-footer">
                                    <div className="car-price">
                                        Daily Rate<br />
                                        <span>{formatCurrency(car.dailyRate)}</span> / day
                                    </div>
                                    <Link to={`/car/${car._id}`} className="btn-details">View Details</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

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

            <section className="cta-section">
                <div className="cta-content">
                    <h2>Find Your Next Ride Now!</h2>
                    <p>Ready to hit the road in style? Join thousands of satisfied customers and book your premium vehicle today.</p>
                    <Link to="/auth/register" className="btn-cta">Book Your Car</Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPageReal;
