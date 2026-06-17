/* ============================================================
   Voz Segura — Single-Page App
   ============================================================ */

// ── Icons (inline SVG helpers) ──────────────────────────────
const Icon = {
  shield:  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  heart:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartLg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  users:   `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  warn:    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  lock:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  lockSm:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  logout:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  mapPin:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  shieldLg:`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  shieldHd:`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  shieldSm:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
};

// ── Toast ────────────────────────────────────────────────────
function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  const container = document.getElementById("toast-container");
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    el.addEventListener("animationend", () => el.remove());
  }, 3500);
}

// ── API helper ───────────────────────────────────────────────
async function api(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" }, credentials: "same-origin" };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch("/api" + path, opts);
  const data = await res.json();
  return { ok: res.ok, data };
}

// ── State ────────────────────────────────────────────────────
let currentUser = null;
let currentRoute = null;

async function loadUser() {
  const { ok, data } = await api("GET", "/auth/me");
  currentUser = ok ? data.user : null;
}

// ── Router ───────────────────────────────────────────────────
const routes = {
  "/":               renderLanding,
  "/auth":           renderAuth,
  "/denuncia":       renderDenuncia,
  "/admin/login":    renderAdminLogin,
  "/admin":          renderAdmin,
  "/reset-password": renderResetPassword,
};

function navigate(path, replace = false) {
  if (replace) history.replaceState({}, "", path);
  else history.pushState({}, "", path);
  dispatch();
}

async function dispatch() {
  const path = location.pathname;
  currentRoute = path;

  // Auth guards
  if (path === "/denuncia" && !currentUser) { navigate("/auth", true); return; }
  if (path === "/admin" && (!currentUser || !currentUser.is_admin)) { navigate("/admin/login", true); return; }

  const render = routes[path] || renderLanding;
  const app = document.getElementById("app");
  app.innerHTML = "";
  await render(app);
}

window.addEventListener("popstate", dispatch);
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-link]");
  if (a) { e.preventDefault(); navigate(a.getAttribute("href")); }
});

// ── Landing ──────────────────────────────────────────────────
async function renderLanding(app) {
  document.title = "Voz Segura — Não ao bullying e à violência contra a mulher";
  app.innerHTML = `
  <header class="site-header">
    <div class="container">
      <a href="/" data-link class="logo">${Icon.shieldHd} Voz Segura</a>
      <nav class="header-nav">
        <a href="/auth" data-link><button class="btn btn-ghost">Entrar</button></a>
        <a href="/auth?tab=signup" data-link><button class="btn btn-primary">Criar conta</button></a>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container hero-grid">
      <div>
        <span class="hero-tag">${Icon.heart} Iniciativa estudantil</span>
        <h1>Sua voz <span>protege</span> alguém hoje.</h1>
        <p class="hero-desc">O Voz Segura é o canal oficial da nossa escola para denunciar, com sigilo e responsabilidade, casos de bullying e violência contra a mulher.</p>
        <div class="hero-ctas">
          <a href="/auth?tab=signup" data-link><button class="btn btn-primary btn-lg">Criar conta institucional</button></a>
          <a href="/auth" data-link><button class="btn btn-outline btn-lg">Já tenho conta</button></a>
        </div>
        <p class="hero-note">Apenas e-mails @escola.pr.gov.br podem se cadastrar.</p>
      </div>
      <div>
        <div class="hero-card">
          <div class="hero-card-inner">
            ${Icon.warn}
            <div>
              <p class="big">Silenciar não é proteger.</p>
              <p class="small">Denúncias anônimas para a coordenação, com data, local e contexto.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="about-section">
    <div class="container">
      <h2>Sobre o projeto</h2>
      <p style="margin-top:.75rem;max-width:40rem;color:var(--muted-foreground)">Desenvolvido por alunos e apoiado pela coordenação, o Voz Segura cria uma ponte direta entre quem vê ou sofre violência e a equipe responsável por agir.</p>
      <div class="features-grid">
        <div class="feature-card">${Icon.shieldLg}<h3>Sigilo garantido</h3><p>Apenas a coordenação tem acesso aos dados da denúncia.</p></div>
        <div class="feature-card">${Icon.users}<h3>Para toda a escola</h3><p>Alunos, professores e equipe pedagógica usam o mesmo canal.</p></div>
        <div class="feature-card">${Icon.heartLg}<h3>Acolhimento ativo</h3><p>Cada denúncia recebida é avaliada e encaminhada com cuidado.</p></div>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div class="container">
      <p>© Voz Segura — Projeto escolar</p>
      <a href="/admin/login" data-link class="footer-admin-link">Acesso administrativo</a>
    </div>
  </footer>

  <button class="float-lock" onclick="navigate('/admin/login')" title="">${Icon.lockSm}</button>
  `;
}

// ── Auth ─────────────────────────────────────────────────────
async function renderAuth(app) {
  document.title = "Voz Segura — Entrar / Criar conta";
  const params = new URLSearchParams(location.search);
  const initialTab = params.get("tab") === "signup" ? "signup" : "login";

  app.innerHTML = `
  <div class="auth-page">
    <div class="auth-center">
      <a href="/" data-link class="auth-logo">${Icon.shieldHd} Voz Segura</a>
      <div class="card">
        <div class="tabs-list" id="auth-tabs">
          <button class="tab-trigger ${initialTab==="login"?"active":""}" data-tab="login">Entrar</button>
          <button class="tab-trigger ${initialTab==="signup"?"active":""}" data-tab="signup">Criar conta</button>
        </div>

        <!-- Login -->
        <div class="tab-panel ${initialTab==="login"?"active":""}" id="panel-login">
          <form id="form-login" class="form-space" style="margin-top:1.5rem">
            <div class="input-group"><label class="label">E-mail institucional</label><input class="input" name="email" type="email" placeholder="seu.nome@escola.pr.gov.br" required /></div>
            <div class="input-group"><label class="label">Senha</label><input class="input" name="password" type="password" required /></div>
            <button type="submit" class="btn btn-primary btn-full" id="btn-login">Entrar</button>
            <button type="button" class="link-btn" id="btn-forgot-login">Esqueceu a senha?</button>
          </form>
        </div>

        <!-- Signup -->
        <div class="tab-panel ${initialTab==="signup"?"active":""}" id="panel-signup">
          <form id="form-signup" class="form-space" style="margin-top:1.5rem">
            <div class="input-group"><label class="label">Nome completo</label><input class="input" name="nome" required /></div>
            <div class="input-group"><label class="label">Turma</label><input class="input" name="turma" placeholder="Ex.: 2º ano A" required /></div>
            <div class="input-group"><label class="label">E-mail institucional</label><input class="input" name="email" type="email" placeholder="seu.nome@escola.pr.gov.br" required /></div>
            <div class="input-group"><label class="label">Senha (mín. 6 caracteres)</label><input class="input" name="password" type="password" required /></div>
            <button type="submit" class="btn btn-primary btn-full" id="btn-signup">Criar conta</button>
          </form>
        </div>
      </div>
      <p class="auth-note">Apenas e-mails @escola.pr.gov.br são aceitos.</p>
    </div>
  </div>`;

  // Tab switching
  document.querySelectorAll(".tab-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-trigger").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
    });
  });

  // Login
  document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-login");
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Entrando...`;
    const fd = new FormData(e.target);
    const { ok, data } = await api("POST", "/auth/login", { email: fd.get("email"), password: fd.get("password") });
    btn.disabled = false; btn.textContent = "Entrar";
    if (!ok) { toast(data.error || "Erro ao entrar", "error"); return; }
    toast(data.message);
    currentUser = data.user;
    navigate("/denuncia");
  });

  // Signup
  document.getElementById("form-signup").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-signup");
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Criando...`;
    const fd = new FormData(e.target);
    const { ok, data } = await api("POST", "/auth/signup", {
      email: fd.get("email"), password: fd.get("password"),
      nome: fd.get("nome"), turma: fd.get("turma")
    });
    btn.disabled = false; btn.textContent = "Criar conta";
    if (!ok) { toast(data.error || "Erro ao criar conta", "error"); return; }
    toast(data.message);
    currentUser = data.user;
    navigate("/denuncia");
  });

  // Forgot password
  document.getElementById("btn-forgot-login").addEventListener("click", async () => {
    const email = window.prompt("Digite seu e-mail institucional para receber o link de redefinição:");
    if (!email) return;
    const { ok, data } = await api("POST", "/auth/reset-request", { email });
    toast(data.message, ok ? "success" : "error");
  });
}

// ── Denuncia ─────────────────────────────────────────────────
async function renderDenuncia(app) {
  document.title = "Voz Segura — Fazer denúncia";
  const now = new Date();
  const nowDate = now.toISOString().slice(0, 10);
  const nowTime = now.toTimeString().slice(0, 5);

  app.innerHTML = `
  <div class="page-body">
    <header class="site-header">
      <div class="container-sm">
        <a href="/" data-link class="logo">${Icon.shieldSm} Voz Segura</a>
        <button class="btn btn-ghost btn-sm" id="btn-logout">${Icon.logout} Sair</button>
      </div>
    </header>
    <main class="page-main">
      <div class="container-sm">
        <h1>Fazer uma denúncia</h1>
        <p class="subtitle">Suas informações são tratadas com sigilo pela coordenação.</p>
        <form id="form-denuncia" class="card form-space" style="margin-top:2rem">
          <div class="input-group">
            <label class="label">Categoria</label>
            <div class="select-wrapper">
              <select name="categoria" class="input select" required>
                <option value="bullying">Bullying</option>
                <option value="violencia_mulher">Violência contra a mulher</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label class="label" for="aluno">Aluno denunciado</label>
            <input class="input" id="aluno" name="aluno_denunciado" placeholder="Nome ou descrição" required />
          </div>
          <div class="input-group">
            <label class="label" for="motivo">Motivo / descrição</label>
            <textarea class="input textarea" id="motivo" name="motivo" rows="4" required></textarea>
          </div>
          <div class="input-group">
            <label class="label" for="local">Local</label>
            <div class="input-flex">
              <input class="input" id="local" name="local" placeholder="Ex.: pátio, sala 12..." required />
              <button type="button" class="btn btn-outline" id="btn-geo" title="Usar localização atual">${Icon.mapPin}</button>
            </div>
          </div>
          <div class="input-row">
            <div class="input-group">
              <label class="label" for="data">Data</label>
              <input class="input" id="data" name="data_ocorrido" type="date" value="${nowDate}" required />
            </div>
            <div class="input-group">
              <label class="label" for="horario">Horário</label>
              <input class="input" id="horario" name="horario_ocorrido" type="time" value="${nowTime}" required />
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full" id="btn-enviar">Enviar denúncia</button>
        </form>
      </div>
    </main>
  </div>`;

  document.getElementById("btn-logout").addEventListener("click", async () => {
    await api("POST", "/auth/logout");
    currentUser = null;
    navigate("/");
  });

  document.getElementById("btn-geo").addEventListener("click", () => {
    if (!navigator.geolocation) { toast("Geolocalização indisponível", "error"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById("local").value = `Lat ${pos.coords.latitude.toFixed(5)}, Lon ${pos.coords.longitude.toFixed(5)}`;
      },
      () => toast("Não foi possível obter a localização", "error")
    );
  });

  document.getElementById("form-denuncia").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-enviar");
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Enviando...`;
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    const { ok, data } = await api("POST", "/denuncias", body);
    btn.disabled = false; btn.textContent = "Enviar denúncia";
    if (!ok) { toast(data.error || "Erro ao enviar", "error"); return; }
    toast(data.message);
    e.target.reset();
    // Reset date/time
    const now2 = new Date();
    document.getElementById("data").value = now2.toISOString().slice(0, 10);
    document.getElementById("horario").value = now2.toTimeString().slice(0, 5);
  });
}

// ── Admin Login ──────────────────────────────────────────────
async function renderAdminLogin(app) {
  document.title = "Voz Segura — Área administrativa";
  app.innerHTML = `
  <div class="admin-login-page">
    <div class="auth-center">
      <a href="/" data-link class="auth-logo">${Icon.lock} Área administrativa</a>
      <div class="card">
        <h1>Login da coordenação</h1>
        <p>Acesso restrito aos administradores cadastrados.</p>
        <form id="form-admin-login" class="form-space" style="margin-top:1.5rem">
          <div class="input-group"><label class="label" for="adm-email">E-mail</label><input class="input" id="adm-email" name="email" type="email" required /></div>
          <div class="input-group"><label class="label" for="adm-pw">Senha</label><input class="input" id="adm-pw" name="password" type="password" required /></div>
          <button type="submit" class="btn btn-primary btn-full" id="btn-adm-login">Entrar como administrador</button>
          <button type="button" class="link-btn" id="btn-forgot-admin">Esqueceu a senha?</button>
        </form>
      </div>
    </div>
  </div>`;

  document.getElementById("form-admin-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-adm-login");
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Verificando...`;
    const fd = new FormData(e.target);
    const { ok, data } = await api("POST", "/auth/admin-login", { email: fd.get("email"), password: fd.get("password") });
    btn.disabled = false; btn.textContent = "Entrar como administrador";
    if (!ok) { toast(data.error || "Acesso negado", "error"); return; }
    toast(data.message);
    await loadUser();
    navigate("/admin");
  });

  document.getElementById("btn-forgot-admin").addEventListener("click", async () => {
    const email = window.prompt("Digite o e-mail administrativo para receber o link de redefinição:");
    if (!email) return;
    const { ok, data } = await api("POST", "/auth/reset-request", { email });
    toast(data.message, ok ? "success" : "error");
  });
}

// ── Admin Dashboard ──────────────────────────────────────────
async function renderAdmin(app) {
  document.title = "Voz Segura — Painel administrativo";

  app.innerHTML = `
  <div>
    <header class="admin-header">
      <div class="container">
        <a href="/" data-link class="admin-logo">${Icon.lock} Painel administrativo</a>
        <button class="btn btn-ghost btn-sm" id="btn-admin-logout">${Icon.logout} Sair</button>
      </div>
    </header>
    <main style="padding:2.5rem 0">
      <div class="container" id="admin-content">
        <p style="color:var(--muted-foreground)">Carregando...</p>
      </div>
    </main>
  </div>`;

  document.getElementById("btn-admin-logout").addEventListener("click", async () => {
    await api("POST", "/auth/logout");
    currentUser = null;
    navigate("/");
  });

  // Load stats + denuncias
  const [statsRes, denRes] = await Promise.all([
    api("GET", "/admin/stats"),
    api("GET", "/admin/denuncias"),
  ]);

  if (!statsRes.ok || !denRes.ok) {
    toast("Erro ao carregar dados", "error");
    navigate("/admin/login");
    return;
  }

  const stats = statsRes.data;
  const { denuncias, profiles } = denRes.data;
  let activeFilter = "all";

  function labelCat(c) {
    return c === "bullying" ? "Bullying" : c === "violencia_mulher" ? "Violência contra a mulher" : "Outro";
  }

  function renderRows(list) {
    if (!list.length) return `<tr class="empty-row"><td colspan="6">Nenhuma denúncia.</td></tr>`;
    return list.map(r => {
      const p = profiles[r.denunciante_id];
      return `<tr>
        <td class="cell-nowrap" style="font-size:.8rem">${r.data_ocorrido} ${r.horario_ocorrido}</td>
        <td><span class="badge badge-secondary">${labelCat(r.categoria)}</span></td>
        <td style="font-size:.8rem">${p ? `${p.nome} (${p.turma})` : "—"}</td>
        <td style="font-size:.8rem">${r.aluno_denunciado}</td>
        <td style="font-size:.8rem">${r.local}</td>
        <td class="cell-truncate" style="font-size:.8rem" title="${r.motivo.replace(/"/g,"&quot;")}">${r.motivo}</td>
      </tr>`;
    }).join("");
  }

  const content = document.getElementById("admin-content");
  content.innerHTML = `
  <div class="stats-grid">
    <div class="stat-card"><p class="stat-label">Total de denúncias</p><p class="stat-value">${stats.total}</p></div>
    <div class="stat-card"><p class="stat-label">Bullying</p><p class="stat-value">${stats.bullying}</p></div>
    <div class="stat-card"><p class="stat-label">Violência contra a mulher</p><p class="stat-value">${stats.violencia_mulher}</p></div>
    <div class="stat-card"><p class="stat-label">Outros</p><p class="stat-value">${stats.outro}</p></div>
  </div>

  <div class="charts-grid">
    <div class="chart-card"><h3>Por categoria</h3><div class="chart-wrap"><canvas id="chart-pie"></canvas></div></div>
    <div class="chart-card"><h3>Locais mais citados</h3><div class="chart-wrap"><canvas id="chart-bar"></canvas></div></div>
  </div>

  <div class="table-card">
    <div class="table-header">
      <h3>Denúncias recebidas</h3>
      <div class="filter-btns" id="filter-btns">
        <button class="btn btn-sm btn-active" data-f="all">Todas</button>
        <button class="btn btn-sm btn-outline" data-f="bullying">Bullying</button>
        <button class="btn btn-sm btn-outline" data-f="violencia_mulher">Violência mulher</button>
        <button class="btn btn-sm btn-outline" data-f="outro">Outros</button>
      </div>
    </div>
    <div class="table-scroll">
      <table>
        <thead><tr>
          <th>Data/Hora</th><th>Categoria</th><th>Denunciante</th><th>Denunciado</th><th>Local</th><th>Conteúdo</th>
        </tr></thead>
        <tbody id="table-body">${renderRows(denuncias)}</tbody>
      </table>
    </div>
  </div>`;

  // Charts
  const COLORS = ["#d4622a", "#3c6fd4", "#2ab07c", "#9c3cd4", "#d4a83c"];
  const pieData = stats.by_categoria;
  new Chart(document.getElementById("chart-pie"), {
    type: "pie",
    data: {
      labels: pieData.map(d => labelCat(d.categoria)),
      datasets: [{ data: pieData.map(d => d.cnt), backgroundColor: COLORS }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
  });

  const barData = stats.by_local;
  new Chart(document.getElementById("chart-bar"), {
    type: "bar",
    data: {
      labels: barData.map(d => d.local.slice(0, 20)),
      datasets: [{ data: barData.map(d => d.cnt), backgroundColor: "#d4622a", borderRadius: 6 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { stepSize: 1 } } },
    },
  });

  // Filters
  document.getElementById("filter-btns").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-f]");
    if (!btn) return;
    activeFilter = btn.dataset.f;
    document.querySelectorAll("[data-f]").forEach(b => {
      b.className = b === btn ? "btn btn-sm btn-active" : "btn btn-sm btn-outline";
    });
    const { ok, data } = await api("GET", `/admin/denuncias?categoria=${activeFilter}`);
    if (ok) document.getElementById("table-body").innerHTML = renderRows(data.denuncias);
  });
}

// ── Reset Password ───────────────────────────────────────────
async function renderResetPassword(app) {
  document.title = "Voz Segura — Redefinir senha";
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";

  app.innerHTML = `
  <div class="reset-page">
    <div class="auth-center">
      <a href="/" data-link class="auth-logo">${Icon.shieldHd} Voz Segura</a>
      <div class="card">
        <h2 style="font-family:var(--font-sans);font-size:1.5rem;font-weight:700">Redefinir senha</h2>
        <p style="font-size:.875rem;color:var(--muted-foreground);margin-top:.25rem">Digite sua nova senha abaixo.</p>
        ${!token ? '<p style="color:var(--destructive);margin-top:1rem;font-size:.875rem">Token não encontrado. Solicite um novo link.</p>' : `
        <form id="form-reset" class="form-space" style="margin-top:1.5rem">
          <div class="input-group"><label class="label">Nova senha (mín. 6 caracteres)</label><input class="input" name="password" type="password" required /></div>
          <button type="submit" class="btn btn-primary btn-full" id="btn-reset">Redefinir senha</button>
        </form>`}
      </div>
    </div>
  </div>`;

  if (token) {
    document.getElementById("form-reset").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("btn-reset");
      btn.disabled = true; btn.innerHTML = `<span class="spinner"></span>`;
      const fd = new FormData(e.target);
      const { ok, data } = await api("POST", "/auth/reset-password", { token, password: fd.get("password") });
      btn.disabled = false; btn.textContent = "Redefinir senha";
      if (!ok) { toast(data.error || "Erro", "error"); return; }
      toast(data.message);
      setTimeout(() => navigate("/auth"), 1500);
    });
  }
}

// ── Boot ─────────────────────────────────────────────────────
(async () => {
  await loadUser();
  await dispatch();
})();
