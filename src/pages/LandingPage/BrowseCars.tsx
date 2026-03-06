import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Filter,
  Star,
  MapPin,
  Fuel,
  Users,
  Calendar,
  Palette
} from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_CARS } from "./constants";
import { Car, SortOption } from "./types";
import "./browseCars.css";
import Navbar from "../../components/layout/Navbar";

const BrowseCars: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const [priceRange, setPriceRange] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [seatsFilter, setSeatsFilter] = useState("All");
  const [fuelFilter, setFuelFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState("All");

  const categories = ["All","Sedans","SUVs","Sports","Luxury","Electric","Vans"];
  const quickFilters = ["Top Rated","Long Trip Friendly","New Arrivals"];

  const filteredCars = useMemo(() => {
    return MOCK_CARS
      .filter((car) => {
        const matchesSearch =
          car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          car.brand.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" ||
          car.category.toLowerCase() === selectedCategory.toLowerCase().replace(/s$/, "");

        const matchesSeats =
          seatsFilter === "All" || car.seats === parseInt(seatsFilter);

        const matchesFuel =
          fuelFilter === "All" || car.fuel === fuelFilter;

        return matchesSearch && matchesCategory && matchesSeats && matchesFuel;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "year-new") return b.year - a.year;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [searchQuery, selectedCategory, sortBy, seatsFilter, fuelFilter]);

  return (
    <>
      <Navbar />

      <div className="browse-page">

        <div className="browse-container">

          {/* Breadcrumb */}
          <div className="breadcrumb">
            Home / <span>Filter Search</span>
          </div>

          {/* Title */}
          <h1 className="browse-title">Find the best car rental deals</h1>
          <p className="browse-subtitle">Discover premium vehicles from our exclusive collection</p>

          {/* Filter Card */}
          <div className="search-filter-section">

            {/* Search */}
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, model, brand..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Buttons */}
            <div className="filter-grid">

              <FilterDropdown label="Price" icon={<Filter size={16}/>} value={priceRange} onChange={setPriceRange}
                options={["All","Under $100","$100 - $200","Over $200"]} />

              <FilterDropdown label="Year" icon={<Calendar size={16}/>} value={yearFilter} onChange={setYearFilter}
                options={["All","2023","2022","2021"]} />

              <FilterDropdown label="Seats" icon={<Users size={16}/>} value={seatsFilter} onChange={setSeatsFilter}
                options={["All","2","4","5","7","9"]} />

              <FilterDropdown label="Fuel" icon={<Fuel size={16}/>} value={fuelFilter} onChange={setFuelFilter}
                options={["All","Petrol","Diesel","Electric","Hybrid"]} />

              <FilterDropdown label="Color" icon={<Palette size={16}/>} value={colorFilter} onChange={setColorFilter}
                options={["All","Black","White","Silver","Red","Blue"]} />

            </div>

            {/* Categories + Sort */}
            <div className="filters-bottom">

              <div className="category-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
                  >
                    {cat === "All" && <Star size={14}/>}
                    {cat}
                  </button>
                ))}
              </div>

              <div className="sort-section">
                Sort by:
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

            </div>

            {/* Quick Filters */}
            <div className="quick-filters">

              <span className="quick-label">Quick Filters:</span>

              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() =>
                    setActiveQuickFilter(
                      activeQuickFilter === filter ? null : filter
                    )
                  }
                  className={`quick-filter-btn ${
                    activeQuickFilter === filter ? "active" : ""
                  }`}
                >
                  {filter}
                </button>
              ))}

              <button className="location-btn">
                <MapPin size={16}/> Location
              </button>

            </div>

          </div>
        </div>

        {/* Cars */}
        <div className="browse-container">

          <div className="results-header">
            <div>
              <h2 className="results-title">Featured Cars</h2>
              <p className="results-subtitle">Top picks from our luxury collection</p>
            </div>

            <button className="view-all">View All →</button>
          </div>

          <div className="cars-grid">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car}/>
            ))}
          </div>

        </div>

      </div>
    </>
  );
};

/* Filter Dropdown */

const FilterDropdown = ({
  label,
  icon,
  options,
  value,
  onChange
}: any) => {

  return (
    <div className="filter-dropdown">

      <div className="filter-icon">{icon}</div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt:string)=>(
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      <ChevronDown size={14} className="dropdown-arrow"/>

    </div>
  );
};

/* Car Card */

const CarCard:React.FC<{car:Car}> = ({car}) => {

  return (

    <motion.div
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
      className="car-card"
    >

      <img src={car.image} alt={car.name}/>

      <div className="car-body">

        <div className="car-header">

          <div>
            <h3>{car.name}</h3>
            <p>{car.brand} • {car.year}</p>
          </div>

          <div className="car-price">
            ${car.price}
            <span>per day</span>
          </div>

        </div>

        <div className="car-features">
          <span><Users size={14}/> {car.seats}</span>
          <span><Fuel size={14}/> {car.fuel}</span>
          <span><Star size={14}/> {car.category}</span>
        </div>

        <button className="rent-btn">Rent Now</button>

      </div>

    </motion.div>

  );
};

export default BrowseCars;