import mongoose from 'mongoose';

const generateBookingReference = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BK${year}${month}${random}`;
};

const bookingSchema = new mongoose.Schema({
  // Booking parties
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Car owner is required']
  },

  // Booking dates and duration
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  duration: {
    type: Number, // in days
    required: true,
    min: [1, 'Duration must be at least 1 day']
  },

  // Pricing and payment
  dailyRate: {
    type: Number,
    required: true,
    min: [0, 'Daily rate cannot be negative']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  serviceFee: {
    type: Number,
    default: 0,
    min: [0, 'Service fee cannot be negative']
  },
  insuranceFee: {
    type: Number,
    default: 0,
    min: [0, 'Insurance fee cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },

  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash'],
    default: 'card'
  },
  paymentIntentId: String, // Stripe payment intent ID
  transactionId: String,

  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },

  // Cancellation information
  cancelledAt: Date,
  cancellationReason: {
    type: String,
    enum: ['customer_request', 'owner_cancelled', 'payment_failed', 'system_cancelled', 'no_show'],
    required: function() {
      return this.status === 'cancelled';
    }
  },
  cancellationFee: {
    type: Number,
    default: 0,
    min: [0, 'Cancellation fee cannot be negative']
  },

  // Pickup and return details
  pickupLocation: {
    address: {
      type: String,
      required: [true, 'Pickup address is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    instructions: String
  },
  returnLocation: {
    address: {
      type: String,
      required: [true, 'Return address is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    instructions: String
  },

  // Additional services
  additionalServices: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Service price cannot be negative']
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1']
    }
  }],

  // Insurance and protection
  insurance: {
    type: {
      type: String,
      enum: ['basic', 'premium', 'none'],
      default: 'basic'
    },
    coverage: Number,
    deductible: Number
  },

  // Vehicle condition at pickup
  pickupCondition: {
    mileage: Number,
    fuelLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    notes: String,
    photos: [String], // URLs to photos
    checklist: {
      exteriorClean: Boolean,
      interiorClean: Boolean,
      tiresGood: Boolean,
      lightsWorking: Boolean,
      noDamage: Boolean
    }
  },

  // Vehicle condition at return
  returnCondition: {
    mileage: Number,
    fuelLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    notes: String,
    photos: [String], // URLs to photos
    damageReported: Boolean,
    damageDescription: String
  },

  // Communication and reviews
  specialRequests: String,
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  customerReview: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  ownerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  ownerReview: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },

  // Emergency contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },

  // Timestamps for key events
  confirmedAt: Date,
  pickedUpAt: Date,
  returnedAt: Date,
  completedAt: Date,

  // Metadata
  bookingReference: {
    type: String,
    required: true,
    default: generateBookingReference
  },
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'api', 'admin'],
    default: 'website'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
bookingSchema.index({ bookingReference: 1 }, { unique: true });
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ car: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

// Virtual for booking period
bookingSchema.virtual('bookingPeriod').get(function() {
  return {
    start: this.startDate,
    end: this.endDate,
    duration: this.duration
  };
});

// Virtual for total paid
bookingSchema.virtual('totalPaid').get(function() {
  return this.totalAmount - (this.cancellationFee || 0);
});

// Pre-save middleware to generate booking reference
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingReference) {
    this.bookingReference = generateBookingReference();
  }
  next();
});

// Static method to find overlapping bookings
bookingSchema.statics.findOverlappingBookings = function(carId, startDate, endDate, excludeBookingId = null) {
  const query = {
    car: carId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      {
        startDate: { $lt: endDate },
        endDate: { $gt: startDate }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return this.find(query);
};

// Instance method to calculate total cost
bookingSchema.methods.calculateTotal = function() {
  let total = this.subtotal + this.tax + this.serviceFee + this.insuranceFee;

  // Add additional services
  if (this.additionalServices && this.additionalServices.length > 0) {
    total += this.additionalServices.reduce((sum, service) => {
      return sum + (service.price * service.quantity);
    }, 0);
  }

  this.totalAmount = total;
  return total;
};

// Instance method to check if booking can be cancelled
bookingSchema.methods.canCancel = function() {
  const now = new Date();
  const hoursUntilPickup = (this.startDate - now) / (1000 * 60 * 60);

  // Cannot cancel within 24 hours of pickup
  return hoursUntilPickup > 24 && this.status === 'confirmed';
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
