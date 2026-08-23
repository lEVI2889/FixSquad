export const normalizeAuthResponse = (payload) => {
  const nestedData = payload?.data;
  const token =
    payload?.token ??
    payload?.accessToken ??
    nestedData?.token ??
    nestedData?.accessToken ??
    null;
  const user = payload?.user ?? nestedData?.user ?? null;

  return { token, user };
};

export const getApiErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  (error.request
    ? 'We could not reach the server. Check your connection and try again.'
    : error.message) ||
  fallback;
