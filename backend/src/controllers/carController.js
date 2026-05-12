import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import carService from '../services/car/carService.js';
import logger from '../utils/logger.js';

const sendServiceResponse = (res, result) => ApiResponse.success(
  res,
  result.data,
  result.message,
  result.statusCode,
  result.meta
);

export const getCars = asyncHandler(async (req, res) => {
  try {
    const result = await carService.getCars({ query: req.query });
    return sendServiceResponse(res, result);
  } catch (error) {
    logger.error({ err: error, query: req.query }, 'Error in getCars controller');
    throw error;
  }
});

export const getCar = asyncHandler(async (req, res) => {
  const result = await carService.getCar({ id: req.params.id });
  return sendServiceResponse(res, result);
});

export const createCar = asyncHandler(async (req, res) => {
  const result = await carService.createCar({
    body: req.body,
    user: req.user,
    file: req.file
  });
  return sendServiceResponse(res, result);
});

export const updateCar = asyncHandler(async (req, res) => {
  const result = await carService.updateCar({
    id: req.params.id,
    body: req.body,
    user: req.user,
    car: req.car,
    file: req.file
  });
  return sendServiceResponse(res, result);
});

export const deleteCar = asyncHandler(async (req, res) => {
  const result = await carService.deleteCar({
    id: req.params.id,
    user: req.user,
    car: req.car
  });
  return sendServiceResponse(res, result);
});

export const getMyCars = asyncHandler(async (req, res) => {
  const result = await carService.getOwnerCars({
    query: req.query,
    user: req.user
  });
  return sendServiceResponse(res, result);
});

export const getAvailableCars = asyncHandler(async (req, res) => {
  const result = await carService.getAvailableCars({ query: req.query });
  return sendServiceResponse(res, result);
});

export const searchCars = asyncHandler(async (req, res) => {
  const result = await carService.searchCars({ query: req.query });
  return sendServiceResponse(res, result);
});
