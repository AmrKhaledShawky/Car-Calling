import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import mercedesImg from "../../assets/landing/mercedes.png";
import bmwImg from "../../assets/landing/bmw.png";
import audiImg from "../../assets/landing/audi.png";

const carouselSlides = [
    { id: 1, image: heroImg, offer: "Premium Collection" },
    { id: 2, image: mercedesImg, offer: "20% Discount on Luxury" },
    { id: 3, image: bmwImg, offer: "Limited Time Offer" },
    { id: 4, image: audiImg, offer: "Weekend Special" },
];

const formatCurrency = (value) => `E£ ${Number(value || 0).toFixed(2)}`;

const getCarImage = (car) => car?.primaryImage?.url || car?.images?.[0]?.url || heroImg;

const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const LandingPageReal = () => {
    const [featuredCars, setFeaturedCars] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

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

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="landing-page">
            <Navbar transparent={true} />

            <header className="hero-section" id="home">
                <motion.div 
                    className="hero-content"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 variants={fadeUpVariant}>
                        Rent Your <span>Perfect</span> Car with Ease
                    </motion.h1>
                    <motion.p variants={fadeUpVariant}>
                        Experience luxury and comfort with our premium fleet.
                        Whether for business or leisure, find the ride that defines your journey.
                    </motion.p>
                    <motion.div variants={fadeUpVariant}>
                        <Link to="/browse-cars" className="btn-primary glow-effect">
                            Browse Available Cars <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </motion.div>
                
                <div className="hero-image-container">
                    <div className="hero-carousel-wrapper">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="carousel-slide"
                            >
                                <img 
                                    src={carouselSlides[currentSlide].image} 
                                    alt="Luxury Car Carousel" 
                                    className="hero-image"
                                />
                                <div className="slide-overlay">
                                    <motion.span 
                                        className="offer-badge"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                    >
                                        {carouselSlides[currentSlide].offer}
                                    </motion.span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <section className="featured-section">
                <motion.div 
                    className="section-header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeUpVariant}
                >
                    <div>
                        <h2><span>Top picks from our live fleet</span>Featured Cars</h2>
                    </div>
                    <Link to="/browse-cars" className="view-all">
                        View All +
                    </Link>
                </motion.div>

                <motion.div 
                    className="cars-grid"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {featuredCars.map((car) => (
                        <motion.div className="car-card" key={car._id} variants={fadeUpVariant}>
                            <div className="car-image-container">
                                <img src={getCarImage(car)} alt={`${car.make} ${car.model}`} className="car-image" />
                            </div>
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
                                    <Link to={`/car/${car._id}`} className="btn-details glow-effect-sm">View Details</Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <motion.section 
                className="features-section"
                id="about"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <motion.div className="feature-card" variants={fadeUpVariant}>
                    <div className="feature-icon-wrapper">
                        <ShieldCheck size={32} />
                    </div>
                    <h4>Verified Security</h4>
                    <p>Every vehicle undergoes rigorous safety checks.</p>
                </motion.div>
                <motion.div className="feature-card" variants={fadeUpVariant}>
                    <div className="feature-icon-wrapper">
                        <Headset size={32} />
                    </div>
                    <h4>24/7 Support</h4>
                    <p>Our dedicated team is always here to assist you.</p>
                </motion.div>
                <motion.div className="feature-card" variants={fadeUpVariant}>
                    <div className="feature-icon-wrapper">
                        <BadgeDollarSign size={32} />
                    </div>
                    <h4>Best Price Guarantee</h4>
                    <p>Competitive rates for luxury experiences.</p>
                </motion.div>
            </motion.section>

            <motion.section 
                className="cta-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUpVariant}
            >
                <div className="cta-content">
                    <h2>Find Your Next Ride Now!</h2>
                    <p>Ready to hit the road in style? Join thousands of satisfied customers and book your premium vehicle today.</p>
                    <Link to="/auth/register" className="btn-cta glow-effect">Book Your Car</Link>
                </div>
            </motion.section>

            <Footer />
        </div>
    );
};

export default LandingPageReal;
