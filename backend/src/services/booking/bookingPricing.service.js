import { roundCurrency } from './booking.utils.js';

const ADDITIONAL_SERVICE_PRICING = {
  child_seat: 15,
  gps: 10,
  additional_driver: 25,
  doorstep_delivery: 40
};

export const calculatePricing = ({
  car,
  start,
  end,
  insuranceType,
  additionalServices = []
}) => {
  const diffTime = Math.abs(end - start);
  const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const dailyRate = roundCurrency(car.getDiscountedRate(duration));
  const subtotal = roundCurrency(dailyRate * duration);
  const serviceFee = roundCurrency(subtotal * 0.05);

  const insuranceFee = roundCurrency(
    insuranceType === 'premium'
      ? 20 * duration
      : insuranceType === 'basic'
        ? 10 * duration
        : 0
  );

  let additionalServicesTotal = 0;

  for (const service of additionalServices || []) {
    const name = service?.name?.toLowerCase();
    const qty = Number(service?.quantity || 1);

    if (ADDITIONAL_SERVICE_PRICING[name]) {
      additionalServicesTotal += ADDITIONAL_SERVICE_PRICING[name] * qty;
    }
  }

  additionalServicesTotal = roundCurrency(additionalServicesTotal);

  const tax = roundCurrency(
    (subtotal + serviceFee + insuranceFee + additionalServicesTotal) * 0.10
  );

  const totalAmount = roundCurrency(
    subtotal + serviceFee + insuranceFee + additionalServicesTotal + tax
  );

  return {
    duration,
    dailyRate,
    subtotal,
    serviceFee,
    insuranceFee,
    additionalServicesTotal,
    tax,
    totalAmount
  };
};