const BASE_URL = "https://dev.ladesa.com.br/api/v1";

async function apiFetch(endpoint, options = {}) {
  // Check if endpoint is fully qualified, otherwise prepend BASE_URL
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  // Read token from localStorage
  const token = localStorage.getItem("token");

  // Merge headers
  const headers = {
    ...options.headers,
  };

  // Only add Content-Type if we are sending JSON and it's not already set
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Add authorization header if token exists and it's NOT a public endpoint
  const isPublicEndpoint =
    url.includes("viacep.com.br") ||
    url.includes("/autenticacao/login");

  if (token && !isPublicEndpoint) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized globally (e.g. redirect to login)
  if (response.status === 401 && !url.includes("/autenticacao/login")) {
    localStorage.removeItem("token");
    // Only redirect if window is defined (browser environment)
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada. Por favor, faça login novamente.");
  }

  return response;
}

export default apiFetch;
