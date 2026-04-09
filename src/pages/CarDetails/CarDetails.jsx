import React, { useState } from "react";
import {
    Star,
    Share2,
    Heart,
    MapPin,
    Calendar,
    Gauge,
    Users,
    Settings,
    ShieldCheck,
    ChevronRight,
    Bluetooth,
    Wind,
    Navigation,
    Music,
    Fuel,
    Zap,
    ArrowRight,
    Search,
    Send,
    Instagram,
    Facebook,
    Twitter,
    Mail,
    Phone,
    Thermometer,
    Disc,
    CheckCircle,
    Globe
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import "./CarDetails.css";

import ferrariMain from "../../assets/cars/front.jpg";
import ferrariSide from "../../assets/cars/side.jpg";
import ferrariInterior from "../../assets/cars/interior.jpg";
import ferrariRear from "../../assets/cars/rear.jpg";

import lamboImg from "../../assets/landing/audi.png"; // Using audi as placeholder for lambo
import mclarenImg from "../../assets/landing/bmw.png"; // Using bmw as placeholder for mclaren
import porscheImg from "../../assets/landing/mercedes.png"; // Using mercedes as placeholder for porsche
import audiImg from "../../assets/landing/audi.png";

const CarDetails = () => {
    const [activeImg, setActiveImg] = useState(0);

    const carData = {
        name: "Ferrari 488 Pista",
        brand: "Ferrari",
        price: "4,500",
        currency: "E£",
        rating: 4.9,
        reviewCount: 124,
        description: "Experience the adrenaline of the Ferrari 488 Pista. With its racing DNA, this masterpiece offers unparalleled performance and handling. The most powerful V8 engine in Maranello's history.",
        specs: [
            { label: "YEAR", value: "2021", icon: <Calendar size={18} /> },
            { label: "MILEAGE", value: "4,200 km", icon: <Gauge size={18} /> },
            { label: "TRANSMISSION", value: "Automatic", icon: <Settings size={18} /> },
            { label: "FUEL", value: "Petrol (98)", icon: <Fuel size={18} /> },
            { label: "SEATS", value: "2 Seats", icon: <Users size={18} /> },
            { label: "ENGINE", value: "3.8L V8", icon: <Zap size={18} /> }
        ],
        features: [
            { name: "Bluetooth", icon: <Bluetooth size={16} /> },
            { name: "Climate Control", icon: <Wind size={16} /> },
            { name: "GPS Navigation", icon: <Navigation size={16} /> },
            { name: "Heated Seats", icon: <Thermometer size={16} /> },
            { name: "Parking Sensors", icon: <MapPin size={16} /> },
            { name: "Sport Mode", icon: <Zap size={16} /> },
            { name: "JBL Sound", icon: <Music size={16} /> },
            { name: "Carbon Trim", icon: <Disc size={16} /> }
        ],
        landlord: {
            name: "Ahmed Hassan",
            rating: 4.9,
            trips: 42,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
        },
        images: [
            ferrariMain,
            ferrariInterior,
            ferrariRear,
            ferrariSide,
            ferrariMain
        ],
        reviews: [
            {
                id: 1,
                user: "James Wilson",
                date: "October 2023",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
                rating: 5,
                comment: "Absolutely incredible experience. The car was in pristine condition and the sound of that V8 is unmatched. Highly recommended!"
            },
            {
                id: 2,
                user: "Sarah Chen",
                date: "September 2023",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
                rating: 5,
                comment: "Smooth process from booking to drop-off. The landlord was very professional. The Ferrari 488 is a dream to drive."
            }
        ],
        similarCars: [
            { id: 101, name: "Lamborghini Huracan", price: "5,500", image: lamboImg },
            { id: 102, name: "McLaren 720S", price: "5,800", image: mclarenImg },
            { id: 103, name: "Porsche 911 GT3", price: "3,900", image: porscheImg },
            { id: 104, name: "Audi R8 V10", price: "3,200", image: audiImg }
        ]
    };

    return (
        <div className="car-details-page">
            <Navbar />

            <div className="car-details-container">
                {/* Breadcrumbs */}
                <nav className="breadcrumb">
                    <a href="/">Home</a>
                    <ChevronRight size={14} />
                    <a href="/browse-cars">Luxury Cars</a>
                    <ChevronRight size={14} />
                    <span className="current">{carData.name}</span>
                </nav>

                <div className="car-main-layout">
                    {/* Left Column: Gallery & Features & Reviews */}
                    <div className="car-info-column">

                        {/* Gallery Section */}
                        <section className="gallery-section">
                            <div className="main-image-container">
                                <img src={carData.images[activeImg]} alt={carData.name} className="main-image" />
                                <button className="wishlist-btn">
                                    <Heart size={20} />
                                </button>
                            </div>
                            <div className="thumbnail-grid">
                                {carData.images.slice(1, 5).map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`thumbnail-item ${activeImg === idx + 1 ? 'active' : ''}`}
                                        onClick={() => setActiveImg(idx + 1)}
                                    >
                                        <img src={img} alt={`${carData.name} ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Features Section */}
                        <section className="details-section">
                            <h2 className="section-title">Features</h2>
                            <div className="features-grid">
                                {carData.features.map((feature, idx) => (
                                    <div key={idx} className="feature-chip">
                                        <span className="feature-icon">{feature.icon}</span>
                                        <span className="feature-name">{feature.name}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Reviews Section */}
                        <section className="details-section">
                            <div className="reviews-header">
                                <h2 className="section-title">Customer Reviews</h2>
                                <div className="overall-rating">
                                    <Star size={18} fill="#f59e0b" color="#f59e0b" />
                                    <span className="rating-val">{carData.rating}</span>
                                    <span className="rating-count">({carData.reviewCount} reviews)</span>
                                </div>
                            </div>
                            <div className="reviews-stack">
                                {carData.reviews.map(review => (
                                    <div key={review.id} className="review-card">
                                        <div className="participant-info">
                                            <img src={review.avatar} alt={review.user} className="avatar" />
                                            <div className="name-date">
                                                <h4>{review.user}</h4>
                                                <span>{review.date}</span>
                                            </div>
                                            <div className="stars-row">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? "#f59e0b" : "none"} color="#f59e0b" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="comment-text">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar Sticky */}
                    <div className="car-sidebar-column">
                        <div className="sticky-booking-card">
                            <div className="title-share">
                                <h1>{carData.name}</h1>
                                <button className="share-icon-btn"><Share2 size={20} /></button>
                            </div>

                            <div className="price-tag">
                                <span className="currency">{carData.currency}</span>
                                <span className="price">{carData.price}</span>
                                <span className="per-day">/ day</span>
                            </div>

                            <div className="quick-specs-grid">
                                {carData.specs.map((spec, idx) => (
                                    <div key={idx} className="spec-item">
                                        <span className="spec-label">{spec.label}</span>
                                        <span className="spec-value">{spec.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="description-box">
                                <h3>Description</h3>
                                <p>{carData.description}</p>
                            </div>

                            <div className="landlord-small-card">
                                <div className="landlord-flex">
                                    <img src={carData.landlord.avatar} alt={carData.landlord.name} className="l-avatar" />
                                    <div className="l-info">
                                        <div className="l-name-badge">
                                            <h4>{carData.landlord.name}</h4>
                                            <CheckCircle size={14} className="v-icon" />
                                        </div>
                                        <div className="l-stats">
                                            <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                            <span>{carData.landlord.rating} ({carData.landlord.trips} trips)</span>
                                        </div>
                                    </div>
                                    <button className="msg-btn">
                                        <Mail size={18} />
                                    </button>
                                </div>
                            </div>

                            <button className="action-rent-btn">
                                Rent Now <ArrowRight size={20} className="r-arrow" />
                            </button>
                            <p className="cancellation-note">Free cancellation up to 48h before trip.</p>
                        </div>
                    </div>
                </div>

                {/* Similar Cars Section */}
                <section className="similar-cars-section">
                    <h2 className="section-title">You might also like</h2>
                    <div className="similar-cars-grid">
                        {carData.similarCars.map(car => (
                            <div key={car.id} className="similar-car-card">
                                <div className="s-img-container">
                                    <img src={car.image} alt={car.name} />
                                    <span className="s-price-badge">{carData.currency} {car.price}/day</span>
                                </div>
                                <div className="s-info">
                                    <h4>{car.name}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default CarDetails;
