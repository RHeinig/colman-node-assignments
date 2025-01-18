import axios from "axios";

export const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(
    Date.now() + days * 60 * 60 * 24 * 1000
  ).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};

export const getCookie = (name: string) => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

export const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const refreshAccessToken = async () => {
  const refreshToken = getCookie("refreshToken");
  if (refreshToken) {
    const response = await axios.post(
      "/user/refreshToken",
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    );
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${response.data.accessToken}`;
    return true;
  }
  return false;
};

export const fetchAccessToken = async () => {
  try {
    return await refreshAccessToken();
  } catch (error) {
    removeCookie("refreshToken");
    console.error("Failed to refresh token", error);
  }
  return false;
};
