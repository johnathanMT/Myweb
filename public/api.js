// ============================================================================
//  api.js  —  Frontend API client for MTN Portfolio
//  Frontend : https://johnathanmt.github.io/Myweb  (GitHub Pages, static)
//  Backend  : https://myweb-zqv1.onrender.com      (Render, .NET 8 API)
//  Database : Aiven MySQL (accessed only by the backend)
//
//  Verified against the live Swagger contract (/swagger/v1/swagger.json):
//   - POST /api/Auth/login     body JSON  { email, password }
//   - POST /api/Auth/register  body JSON  { username, email, password, adminSecret? }
//   - GET  /api/Articles       query: page, pageSize, published, tag, search
//   - GET  /api/Articles/{id}
//   - POST /api/Articles       multipart/form-data (Title, Content, Author req.;
//                              Image, Tags, IsPublished, PublishedDate optional)
//   - PUT  /api/Articles/{id}  multipart/form-data (same fields, all optional)
//   - DELETE /api/Articles/{id}
//  All responses are wrapped: { success, message, data, errors, statusCode }.
// ============================================================================
 
const PortfolioAPI = (() => {
  const BASE_URL = "https://myweb-zqv1.onrender.com";
  const TOKEN_KEY = "mtn_jwt";
 
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
  const clearToken = () => localStorage.removeItem(TOKEN_KEY);
  const isLoggedIn = () => !!getToken();
 
  // ---- Core request helper ------------------------------------------------
  async function request(path, { method = "GET", body, auth = false, isForm = false } = {}) {
    const headers = {};
    // For FormData, DO NOT set Content-Type — the browser adds the multipart boundary.
    if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";
    if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
 
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
 
    if (res.status === 401) { clearToken(); throw new Error("Unauthorized — please log in again."); }
    if (res.status === 403) throw new Error("You do not have permission (admin required).");
    if (res.status === 429) throw new Error("Too many requests — please slow down.");
 
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const msg = json?.message || (json?.errors && json.errors.join(", ")) || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return json; // ApiResponse wrapper: { success, message, data, errors, statusCode }
  }
 
  // ---- Auth ---------------------------------------------------------------
  // NOTE: login uses EMAIL (per LoginDto), not username.
  async function login(email, password) {
    const resp = await request("/api/Auth/login", { method: "POST", body: { email, password } });
    const token = resp?.data?.token;
    if (token) setToken(token);
    return resp; // resp.data = { token, username, email, role, expiresAt }
  }
 
  // adminSecret is optional — include it only if registering an admin account.
  async function register(username, email, password, adminSecret) {
    const body = { username, email, password };
    if (adminSecret) body.adminSecret = adminSecret;
    return request("/api/Auth/register", { method: "POST", body });
  }
 
  const logout = () => clearToken();
 
  // ---- Articles -----------------------------------------------------------
  function getArticles({ page = 1, pageSize = 10, published = true, tag, search } = {}) {
    const q = new URLSearchParams({ page, pageSize, published });
    if (tag) q.set("tag", tag);
    if (search) q.set("search", search);
    return request(`/api/Articles?${q.toString()}`);
  }
 
  const getArticle = (id) => request(`/api/Articles/${id}`);
 
  // Build the multipart body the API expects (PascalCase field names).
  // `image` is a File object from an <input type="file">, optional.
  function buildArticleForm({ title, content, author, image, tags, isPublished, publishedDate }) {
    const form = new FormData();
    if (title != null) form.append("Title", title);
    if (content != null) form.append("Content", content);
    if (author != null) form.append("Author", author);
    if (image) form.append("Image", image);
    if (tags != null) form.append("Tags", tags);
    if (isPublished != null) form.append("IsPublished", isPublished);
    if (publishedDate != null) form.append("PublishedDate", publishedDate);
    return form;
  }
 
  const createArticle = (article) =>
    request("/api/Articles", { method: "POST", body: buildArticleForm(article), auth: true, isForm: true });
 
  const updateArticle = (id, article) =>
    request(`/api/Articles/${id}`, { method: "PUT", body: buildArticleForm(article), auth: true, isForm: true });
 
  const deleteArticle = (id) =>
    request(`/api/Articles/${id}`, { method: "DELETE", auth: true });
 
  // ---- Wake the free-tier backend (Render sleeps after ~15 min idle) ------
  const wakeBackend = () => fetch(`${BASE_URL}/`).catch(() => {});
 
  return {
    BASE_URL, isLoggedIn,
    login, register, logout,
    getArticles, getArticle, createArticle, updateArticle, deleteArticle,
    wakeBackend,
  };
})();
 
window.PortfolioAPI = PortfolioAPI;
 