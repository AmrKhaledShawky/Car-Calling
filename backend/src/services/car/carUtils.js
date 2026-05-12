export const getUserId = (user) => user?.id || user?._id?.toString();

export const serviceResult = ({ data, message, statusCode = 200, meta }) => ({
  data,
  message,
  statusCode,
  meta
});