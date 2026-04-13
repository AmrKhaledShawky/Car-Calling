import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    MapPin,
    Calendar,
    Settings,
    Star,
    Heart,
    ChevronRight,
    ChevronLeft,
    Filter,
    Fuel,
    Zap,
    Users
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import "./BrowseCar.css";

// Assets (Using existing ones as placeholders)
import porscheImg from "../../assets/landing/mercedes.png"; // Placeholder
import rangeRoverImg from "../../assets/landing/hero.png";    // Placeholder
import bmwImg from "../../assets/landing/bmw.png";
import teslaImg from "../../assets/landing/audi.png";       // Placeholder
import ferrariImg from "../../assets/landing/mercedes.png"; // Placeholder
import audiImg from "../../assets/landing/audi.png";
import mercedesImg from "../../assets/landing/mercedes.png";
import lamboImg from "../../assets/landing/audi.png";       // Placeholder

const BrowseCar = () => {
    const [activeCategory, setActiveCategory] = useState("Luxury");
    const [sortBy, setSortBy] = useState("Relevance");

    const categories = ["Luxury", "SUV", "Economy", "Sports", "Delivery"];

    const cars = [
        {
            id: 1,
            name: "Porsche 911 Turbo S",
            type: "Automatic • Petrol • 2 Seats",
            price: "12,500",
            rating: 4.9,
            image: porscheImg,
            tag: "Top Rated"
        },
        {
            id: 2,
            name: "Range Rover Vogue",
            type: "Automatic • Diesel • 5 Seats",
            price: "8,200",
            rating: 4.8,
            image: rangeRoverImg,
            tag: "New",
            isNew: true
        },
        {
            id: 3,
            name: "BMW 7 Series",
            type: "Automatic • Hybrid • 5 Seats",
            price: "9,500",
            rating: 5.0,
            image: bmwImg
        },
        {
            id: 4,
            name: "Tesla Model S Plaid",
            type: "Electric • 750km range • 5 Seats",
            price: "6,800",
            rating: 4.7,
            image: teslaImg
        },
        {
            id: 5,
            name: "Ferrari Roma",
            type: "Automatic • Petrol • 2 Seats",
            price: "22,000",
            rating: 5.0,
            image: ferrariImg
        },
        {
            id: 6,
            name: "Audi A8 L",
            type: "Automatic • Petrol • 4 Seats",
            price: "7,500",
            rating: 4.9,
            image: audiImg
        },
        {
            id: 7,
            name: "Mercedes S-Class",
            type: "Automatic • Petrol • 5 Seats",
            price: "11,000",
            rating: 4.8,
            image: mercedesImg
        },
        {
            id: 8,
            name: "Lamborghini Urus",
            type: "Automatic • Petrol • 5 Seats",
            price: "18,500",
            rating: 5.0,
            image: lamboImg
        }
    ];

    return (
        <div className="browse-cars-page">
            <Navbar />

            <header className="browse-header">
                <div className="container">
                    <h1>Find Your Perfect Drive</h1>
                    <p>Discover premium vehicles for every occasion across Egypt.</p>

                    {/* Search & Filter Bar */}
                    <div className="search-filter-card">
                        <div className="search-group">
                            <div className="input-with-icon">
                                <MapPin size={18} />
                                <div className="input-fields">
                                    <label>LOCATION</label>
                                    <input type="text" placeholder="Where to pick up?" />
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="input-with-icon">
                                <Calendar size={18} />
                                <div className="input-fields">
                                    <label>DATES</label>
                                    <input type="text" placeholder="Select dates" />
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="input-with-icon">
                                <Settings size={18} />
                                <div className="input-fields">
                                    <label>CAR TYPE</label>
                                    <select>
                                        <option>All Categories</option>
                                        <option>Luxury</option>
                                        <option>SUV</option>
                                        <option>Economy</option>
                                    </select>
                                </div>
                            </div>

                            <button className="search-btn">
                                <Search size={20} />
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="browse-main container">
                <div className="filter-navigation">
                    <div className="categories-scroll">
                        <Heart className="category-icon" size={18} />
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                        <button className="price-range-btn">
                            Price Range <ChevronDown size={14} />
                        </button>
                    </div>

                    <div className="sort-section">
                        <span>SORT BY:</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option>Relevance</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Top Rated</option>
                        </select>
                    </div>
                </div>

                <div className="quick-filters">
                    <button className="q-filter active">★ Top Rated</button>
                    <button className="q-filter">📍 Long Trip Friendly</button>
                    <button className="q-filter">✨ New Arrivals</button>
                </div>

                <div className="cars-grid">
                    {cars.map(car => (
                        <div key={car.id} className="browse-car-card">
                            <div className="car-image-container">
                                <img src={car.image} alt={car.name} />
                                {car.isNew && <span className="new-badge">NEW</span>}
                                <button className="wishlist-icon">
                                    <Heart size={18} />
                                </button>
                            </div>
                            <div className="car-details">
                                <div className="car-header">
                                    <h3>{car.name}</h3>
                                    <div className="rating">
                                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                        {car.rating}
                                    </div>
                                </div>
                                <p className="car-type">{car.type}</p>
                                <div className="car-footer">
                                    <div className="price-info">
                                        <span className="label">DAILY RATE</span>
                                        <span className="price">E£ {car.price}<span>/day</span></span>
                                    </div>
                                    <Link to={`/car/${car.id}`} className="view-details-btn">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button className="prev"><ChevronLeft size={18} /></button>
                    <button className="page active">1</button>
                    <button className="page">2</button>
                    <button className="page">3</button>
                    <span className="dots">...</span>
                    <button className="page">12</button>
                    <button className="next"><ChevronRight size={18} /></button>
                </div>

                <div className="results-info">
                    <MapPin size={16} />
                    <span>Displaying results for: <strong>Cairo, Egypt</strong></span>
                    <span className="count">182 cars found</span>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const ChevronDown = ({ size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default BrowseCar;
