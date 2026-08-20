const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error(
    "VITE_API_URL não definida. Copie .env.example para .env e configure."
  );
}

function getCsrfToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
}

async function apiFetch(endpoint, options = {}) {
  // Check if endpoint is fully qualified, otherwise prepend BASE_URL
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  // Merge headers
  const headers = {
    ...options.headers,
  };

  // Only add Content-Type if we are sending JSON and it's not already set
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const method = (options.method || "GET").toLowerCase();
  const csrfToken = getCsrfToken();

  if (csrfToken && ["post", "put", "patch", "delete"].includes(method)) {
    headers["X-CSRF-Token"] = decodeURIComponent(csrfToken);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Handle unauthorized globally (e.g. redirect to login)
  if (response.status === 401 && !url.includes("/autenticacao/login")) {
    // Only redirect if window is defined (browser environment)
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada. Por favor, faça login novamente.");
  }

  return response;
}

export default apiFetch;
