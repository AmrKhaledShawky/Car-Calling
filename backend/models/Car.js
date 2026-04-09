import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  // Basic Information
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true,
    maxlength: [50, 'Make cannot be more than 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true,
    maxlength: [50, 'Model cannot be more than 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Car year is required'],
    min: [1900, 'Year must be at least 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  vin: {
    type: String,
    required: [true, 'VIN is required'],
    unique: true,
    uppercase: true,
    validate: {
      validator: function(vin) {
        return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
      },
      message: 'Please enter a valid 17-character VIN'
    }
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    uppercase: true,
    trim: true
  },

  // Specifications
  category: {
    type: String,
    required: [true, 'Car category is required'],
    enum: ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'wagon', 'van', 'luxury', 'sports'],
    lowercase: true
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'plug-in hybrid'],
    lowercase: true
  },
  transmission: {
    type: String,
    required: [true, 'Transmission type is required'],
    enum: ['manual', 'automatic', 'cvt', 'dct'],
    lowercase: true
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'Must have at least 1 seat'],
    max: [9, 'Cannot have more than 9 seats']
  },
  doors: {
    type: Number,
    required: [true, 'Number of doors is required'],
    min: [2, 'Must have at least 2 doors'],
    max: [5, 'Cannot have more than 5 doors']
  },
  color: {
    type: String,
    required: [true, 'Car color is required'],
    trim: true
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },

  // Features and Amenities
  features: [{
    type: String,
    enum: [
      'air-conditioning', 'heating', 'bluetooth', 'usb-charging', 'gps-navigation',
      'backup-camera', 'cruise-control', 'apple-carplay', 'android-auto',
      'sunroof', 'leather-seats', 'heated-seats', 'keyless-entry', 'remote-start',
      'towing-package', 'all-wheel-drive', 'four-wheel-drive', 'premium-audio', 'autopilot'
    ]
  }],

  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // Cloudinary public ID
    isPrimary: {
      type: Boolean,
      default: false
    },
    alt: String
  }],

  // Pricing
  dailyRate: {
    type: Number,
    required: [true, 'Daily rate is required'],
    min: [0, 'Daily rate cannot be negative']
  },
  weeklyRate: {
    type: Number,
    min: [0, 'Weekly rate cannot be negative']
  },
  monthlyRate: {
    type: Number,
    min: [0, 'Monthly rate cannot be negative']
  },

  // Location
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },

  // Owner/Landlord Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Car owner is required']
  },

  // Availability and Status
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'inactive'],
    default: 'available'
  },

  // Insurance and Legal
  insurance: {
    provider: String,
    policyNumber: String,
    coverageAmount: Number,
    expiryDate: Date
  },

  // Maintenance and Condition
  lastMaintenance: Date,
  nextMaintenance: Date,
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },

  // Ratings and Reviews
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },

  // Booking Statistics
  totalBookings: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// carSchema.index({ location: '2dsphere' }); // Geospatial index - enable when using GeoJSON coordinates
carSchema.index({ category: 1, isAvailable: 1 });
carSchema.index({ owner: 1 });
carSchema.index({ make: 1, model: 1 });
carSchema.index({ dailyRate: 1 });
carSchema.index({ createdAt: -1 });
carSchema.index({ averageRating: -1 });

// Virtual for full name
carSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for primary image
carSchema.virtual('primaryImage').get(function() {
  return this.images.find(img => img.isPrimary) || this.images[0];
});

// Static method to find available cars
carSchema.statics.findAvailable = function(filters = {}) {
  const query = { isAvailable: true, status: 'available', ...filters };
  return this.find(query);
};

// Instance method to calculate discounted rate
carSchema.methods.getDiscountedRate = function(days) {
  if (days >= 30 && this.monthlyRate) {
    return this.monthlyRate / 30;
  } else if (days >= 7 && this.weeklyRate) {
    return this.weeklyRate / 7;
  }
  return this.dailyRate;
};

const Car = mongoose.model('Car', carSchema);

export default Car;