import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Filter, Fuel, Users, Star, Heart } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { apiCall } from "../../utils/api";
import "./BrowseCar.css";

const CATEGORY_OPTIONS = ["All", "Luxury", "SUV", "Sedan", "Sports", "Electric"];
const SORT_OPTIONS = ["Newest", "Price: Low to High", "Price: High to Low", "Top Rated"];

const normalizeCategory = (category) => {
  if (!category) return "All";
  if (category === "luxury") return "Luxury";
  if (category === "suv") return "SUV";
  if (category === "sports") return "Sports";
  if (category === "sedan") return "Sedan";
  if (category === "electric") return "Electric";
  return "All";
};

const getCarImage = (car) => car?.primaryImage?.url || car?.images?.[0]?.url || "";

export default function BrowseCarReal() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall("/public/cars");
        setCars(response.data || []);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load cars.");
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  const visibleCars = useMemo(() => {
    let nextCars = [...cars];

    if (searchLocation) {
      const query = searchLocation.toLowerCase();
      nextCars = nextCars.filter((car) =>
        [car.location?.city, car.location?.state, car.location?.address]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== "All") {
      nextCars = nextCars.filter(
        (car) => normalizeCategory(car.category) === selectedCategory
      );
    }

    switch (sortBy) {
      case "Price: Low to High":
        nextCars.sort((a, b) => a.dailyRate - b.dailyRate);
        break;
      case "Price: High to Low":
        nextCars.sort((a, b) => b.dailyRate - a.dailyRate);
        break;
      case "Top Rated":
        nextCars.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      default:
        nextCars.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
    }

    return nextCars;
  }, [cars, searchLocation, selectedCategory, sortBy]);

  return (
    <div className="browse-cars-page">
      <Navbar />

      <header className="browse-header">
        <div className="container">
          <h1>Find Your Perfect Drive</h1>
          <p>Browse real available cars from the backend and book with live pricing.</p>

          <div className="search-filter-card">
            <div className="search-group">
              <div className="input-with-icon">
                <MapPin size={18} />
                <div className="input-fields">
                  <label>LOCATION</label>
                  <input
                    type="text"
                    placeholder="Search by city or address"
                    value={locationQuery}
                    onChange={(event) => setLocationQuery(event.target.value)}
                  />
                </div>
              </div>

              <div className="divider"></div>

              <div className="input-with-icon">
                <Filter size={18} />
                <div className="input-fields">
                  <label>CATEGORY</label>
                  <select
                    value={selectedSearchCategory}
                    onChange={(event) => setSelectedSearchCategory(event.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                className="search-btn"
                type="button"
                onClick={() => {
                  setSearchLocation(locationQuery.trim());
                  setSelectedCategory(selectedSearchCategory);
                }}
              >
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
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedSearchCategory(category);
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="sort-section">
            <span>SORT BY:</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? <p className="browse-status">Loading cars...</p> : null}
        {error ? <p className="browse-status browse-error">{error}</p> : null}

        {!loading && !error ? (
          <>
            <div className="cars-grid">
              {visibleCars.map((car) => (
                <div key={car._id} className="browse-car-card">
                  <div className="car-image-container">
                    {getCarImage(car) ? (
                      <img src={getCarImage(car)} alt={`${car.make} ${car.model}`} />
                    ) : (
                      <div className="car-image-fallback">No image</div>
                    )}
                    {!car.isVerified ? <span className="new-badge">UNVERIFIED</span> : null}
                    <button className="wishlist-icon" type="button" aria-label="Save car">
                      <Heart size={18} />
                    </button>
                  </div>

                  <div className="car-details">
                    <div className="car-header">
                      <h3>{car.year} {car.make} {car.model}</h3>
                      <div className="rating">
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        {Number(car.averageRating || 0).toFixed(1)}
                      </div>
                    </div>

                    <p className="car-type">
                      {[car.transmission, car.fuelType, `${car.seats} Seats`].filter(Boolean).join(" • ")}
                    </p>

                    <div className="car-location-line">
                      <MapPin size={14} />
                      <span>{car.location?.city}, {car.location?.state}</span>
                    </div>

                    <div className="car-highlights">
                      <span><Fuel size={14} /> {car.fuelType}</span>
                      <span><Users size={14} /> {car.seats} seats</span>
                    </div>

                    <div className="car-footer">
                      <div className="price-info">
                        <span className="label">DAILY RATE</span>
                        <span className="price">E£ {car.dailyRate}<span>/day</span></span>
                      </div>

                      <Link to={`/car/${car._id}`} className="view-details-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCars.length === 0 ? (
              <p className="browse-status">No cars matched your current filters.</p>
            ) : null}

            <div className="results-info">
              <MapPin size={16} />
              <span>Showing <strong>{visibleCars.length}</strong> live cars</span>
              {searchLocation ? <span className="count">Filter: {searchLocation}</span> : null}
            </div>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
