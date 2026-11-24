/**
 * MediTrack REST API Client
 * Features:
 * - JWT storage in memory (access) and sessionStorage (refresh)
 * - Transparent token refresh on HTTP 401
 * - Unified envelope extraction
 */

const API = (() => {
  let inMemoryAccessToken = null;
  let isRefreshing = false;
  let refreshSubscribers = [];

  const onTokenRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
  };

  const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
  };

  const getAccessToken = () => inMemoryAccessToken;

  const setAccessToken = (token) => {
    inMemoryAccessToken = token;
  };

  const getRefreshToken = () => sessionStorage.getItem("meditrack_refresh_token");

  const setRefreshToken = (token) => {
    if (token) {
      sessionStorage.setItem("meditrack_refresh_token", token);
    } else {
      sessionStorage.removeItem("meditrack_refresh_token");
    }
  };

  const getCurrentUser = () => {
    const raw = sessionStorage.getItem("meditrack_user");
    return raw ? JSON.parse(raw) : null;
  };

  const setCurrentUser = (user) => {
    if (user) {
      sessionStorage.setItem("meditrack_user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("meditrack_user");
    }
  };

  const clearSession = () => {
    inMemoryAccessToken = null;
    sessionStorage.removeItem("meditrack_refresh_token");
    sessionStorage.removeItem("meditrack_user");
  };

  const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      return null;
    }

    try {
      const response = await fetch("/api/auth/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        const newAccess = resData.data.access;
        setAccessToken(newAccess);
        if (resData.data.refresh) {
          setRefreshToken(resData.data.refresh);
        }
        return newAccess;
      } else {
        clearSession();
        return null;
      }
    } catch (err) {
      clearSession();
      return null;
    }
  };

  const request = async (endpoint, options = {}) => {
    const url = endpoint.startsWith("http") ? endpoint : endpoint;
    const headers = options.headers || {};

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }

    let token = getAccessToken();
    if (!token && getRefreshToken()) {
      token = await refreshAccessToken();
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    let response = await fetch(url, config);

    // If 401 Unauthorized, attempt transparent token refresh
    if (response.status === 401 && getRefreshToken() && !endpoint.includes("/api/auth/login/")) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onTokenRefreshed(newToken);
          headers["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed - redirect to auth
          clearSession();
          if (window.location.pathname.startsWith("/app")) {
            window.location.href = "/?expired=1";
          }
          return {
            success: false,
            error: { code: "AUTHENTICATION_FAILED", message: "Session expired. Please sign in again." },
          };
        }
      } else {
        // Wait for active refresh
        const retryToken = await new Promise((resolve) => {
          addRefreshSubscriber((t) => resolve(t));
        });
        if (retryToken) {
          headers["Authorization"] = `Bearer ${retryToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          return {
            success: false,
            error: { code: "AUTHENTICATION_FAILED", message: "Session expired." },
          };
        }
      }
    }

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      ok: response.ok,
      ...data,
    };
  };

  return {
    get: (url, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      return request(fullUrl, { method: "GET" });
    },
    post: (url, body = {}) =>
      request(url, { method: "POST", body: JSON.stringify(body) }),
    put: (url, body = {}) =>
      request(url, { method: "PUT", body: JSON.stringify(body) }),
    patch: (url, body = {}) =>
      request(url, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (url, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      return request(fullUrl, { method: "DELETE" });
    },
    getAccessToken,
    setAccessToken,
    getRefreshToken,
    setRefreshToken,
    getCurrentUser,
    setCurrentUser,
    clearSession,
    refreshAccessToken,
  };
})();

window.API = API;
