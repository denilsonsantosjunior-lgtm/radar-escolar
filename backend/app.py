"""
Voz Segura — Backend Flask
Executa: python backend/app.py
Acesse: http://localhost:5000
"""
import os, uuid, hashlib, secrets, sqlite3, json
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, session

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DB_PATH  = os.path.join(BASE_DIR, "vozsegura.db")

app = Flask(__name__, static_folder=os.path.join(ROOT_DIR, "static"),
            template_folder=os.path.join(ROOT_DIR, "templates"))
app.secret_key = secrets.token_hex(32)
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

EMAIL_DOMAIN = "@escola.pr.gov.br"

# ──────────────── DB ────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            nome TEXT NOT NULL,
            turma TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS user_roles (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin','user')),
            created_at TEXT NOT NULL,
            UNIQUE(user_id, role),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS denuncias (
            id TEXT PRIMARY KEY,
            denunciante_id TEXT NOT NULL,
            categoria TEXT NOT NULL CHECK(categoria IN ('bullying','violencia_mulher','outro')),
            aluno_denunciado TEXT NOT NULL,
            motivo TEXT NOT NULL,
            local TEXT NOT NULL,
            data_ocorrido TEXT NOT NULL,
            horario_ocorrido TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(denunciante_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS reset_tokens (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER NOT NULL DEFAULT 0
        );
        """)

def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def now_iso():
    return datetime.utcnow().isoformat()

# ──────────────── Auth helpers ────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Não autenticado"}), 401
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Não autenticado"}), 401
        with get_db() as db:
            row = db.execute("SELECT role FROM user_roles WHERE user_id=? AND role='admin'",
                             (session["user_id"],)).fetchone()
        if not row:
            return jsonify({"error": "Acesso negado"}), 403
        return f(*args, **kwargs)
    return decorated

# ──────────────── API: Auth ────────────────
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    nome = (data.get("nome") or "").strip()
    turma = (data.get("turma") or "").strip()

    if not email.endswith(EMAIL_DOMAIN):
        return jsonify({"error": f"E-mail deve terminar com {EMAIL_DOMAIN}"}), 400
    if len(password) < 6:
        return jsonify({"error": "Senha deve ter no mínimo 6 caracteres"}), 400
    if not nome or not turma:
        return jsonify({"error": "Preencha nome e turma"}), 400

    user_id = str(uuid.uuid4())
    try:
        with get_db() as db:
            db.execute("INSERT INTO users(id,email,password_hash,nome,turma,created_at) VALUES(?,?,?,?,?,?)",
                       (user_id, email, hash_password(password), nome, turma, now_iso()))
            db.execute("INSERT INTO user_roles(id,user_id,role,created_at) VALUES(?,?,?,?)",
                       (str(uuid.uuid4()), user_id, "user", now_iso()))
    except sqlite3.IntegrityError:
        return jsonify({"error": "E-mail já cadastrado"}), 409

    session["user_id"] = user_id
    session["email"]   = email
    return jsonify({"message": "Conta criada!", "user": {"id": user_id, "email": email, "nome": nome, "turma": turma}})

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email.endswith(EMAIL_DOMAIN):
        return jsonify({"error": f"E-mail deve terminar com {EMAIL_DOMAIN}"}), 400

    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE email=? AND password_hash=?",
                          (email, hash_password(password))).fetchone()
    if not user:
        return jsonify({"error": "E-mail ou senha inválidos"}), 401

    session["user_id"] = user["id"]
    session["email"]   = user["email"]
    return jsonify({"message": "Bem-vindo(a)!", "user": dict(user)})

@app.route("/api/auth/admin-login", methods=["POST"])
def admin_login():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE email=? AND password_hash=?",
                          (email, hash_password(password))).fetchone()
        if not user:
            return jsonify({"error": "E-mail ou senha inválidos"}), 401
        role = db.execute("SELECT role FROM user_roles WHERE user_id=? AND role='admin'",
                          (user["id"],)).fetchone()

    if not role:
        return jsonify({"error": "Esta conta não tem permissão administrativa."}), 403

    session["user_id"] = user["id"]
    session["email"]   = user["email"]
    session["is_admin"] = True
    return jsonify({"message": "Acesso administrativo concedido"})

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Sessão encerrada"})

@app.route("/api/auth/me")
def me():
    if "user_id" not in session:
        return jsonify({"user": None})
    with get_db() as db:
        user = db.execute("SELECT id,email,nome,turma FROM users WHERE id=?",
                          (session["user_id"],)).fetchone()
        role = db.execute("SELECT role FROM user_roles WHERE user_id=? AND role='admin'",
                          (session["user_id"],)).fetchone()
    if not user:
        session.clear()
        return jsonify({"user": None})
    u = dict(user)
    u["is_admin"] = bool(role)
    return jsonify({"user": u})

@app.route("/api/auth/reset-request", methods=["POST"])
def reset_request():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    with get_db() as db:
        user = db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    # Always return success to avoid user enumeration
    if user:
        token = secrets.token_urlsafe(32)
        expires = (datetime.utcnow() + timedelta(hours=1)).isoformat()
        with get_db() as db:
            db.execute("INSERT INTO reset_tokens(token,user_id,expires_at) VALUES(?,?,?)",
                       (token, user["id"], expires))
        print(f"[RESET LINK] http://localhost:5000/reset-password?token={token}")
    return jsonify({"message": "Se o e-mail existir, um link foi enviado (verifique o console do servidor)."})

@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.json or {}
    token = data.get("token") or ""
    new_pw = data.get("password") or ""
    if len(new_pw) < 6:
        return jsonify({"error": "Senha deve ter no mínimo 6 caracteres"}), 400
    with get_db() as db:
        row = db.execute("SELECT * FROM reset_tokens WHERE token=? AND used=0", (token,)).fetchone()
        if not row or row["expires_at"] < now_iso():
            return jsonify({"error": "Token inválido ou expirado"}), 400
        db.execute("UPDATE users SET password_hash=? WHERE id=?",
                   (hash_password(new_pw), row["user_id"]))
        db.execute("UPDATE reset_tokens SET used=1 WHERE token=?", (token,))
    return jsonify({"message": "Senha redefinida com sucesso!"})

# ──────────────── API: Denúncias ────────────────
@app.route("/api/denuncias", methods=["POST"])
@login_required
def create_denuncia():
    data = request.json or {}
    fields = ["categoria", "aluno_denunciado", "motivo", "local", "data_ocorrido", "horario_ocorrido"]
    for f in fields:
        if not data.get(f):
            return jsonify({"error": f"Campo '{f}' obrigatório"}), 400
    if data["categoria"] not in ("bullying", "violencia_mulher", "outro"):
        return jsonify({"error": "Categoria inválida"}), 400

    did = str(uuid.uuid4())
    with get_db() as db:
        db.execute(
            "INSERT INTO denuncias(id,denunciante_id,categoria,aluno_denunciado,motivo,local,data_ocorrido,horario_ocorrido,created_at) VALUES(?,?,?,?,?,?,?,?,?)",
            (did, session["user_id"], data["categoria"], data["aluno_denunciado"],
             data["motivo"], data["local"], data["data_ocorrido"], data["horario_ocorrido"], now_iso())
        )
    return jsonify({"message": "Denúncia enviada. A coordenação será notificada."})

@app.route("/api/admin/denuncias")
@admin_required
def admin_denuncias():
    categoria = request.args.get("categoria")
    with get_db() as db:
        if categoria and categoria != "all":
            rows = db.execute("SELECT * FROM denuncias WHERE categoria=? ORDER BY created_at DESC", (categoria,)).fetchall()
        else:
            rows = db.execute("SELECT * FROM denuncias ORDER BY created_at DESC").fetchall()
        # Get profiles
        all_rows = db.execute("SELECT * FROM denuncias ORDER BY created_at DESC").fetchall()
        ids = list(set(r["denunciante_id"] for r in all_rows))
        profiles = {}
        if ids:
            ph = ",".join("?" * len(ids))
            ps = db.execute(f"SELECT id,nome,turma,email FROM users WHERE id IN ({ph})", ids).fetchall()
            profiles = {p["id"]: dict(p) for p in ps}

    result = [dict(r) for r in rows]
    return jsonify({"denuncias": result, "profiles": profiles})

@app.route("/api/admin/stats")
@admin_required
def admin_stats():
    with get_db() as db:
        total    = db.execute("SELECT COUNT(*) as c FROM denuncias").fetchone()["c"]
        bullying = db.execute("SELECT COUNT(*) as c FROM denuncias WHERE categoria='bullying'").fetchone()["c"]
        mulher   = db.execute("SELECT COUNT(*) as c FROM denuncias WHERE categoria='violencia_mulher'").fetchone()["c"]
        outro    = db.execute("SELECT COUNT(*) as c FROM denuncias WHERE categoria='outro'").fetchone()["c"]
        by_local_rows = db.execute("SELECT local, COUNT(*) as cnt FROM denuncias GROUP BY local ORDER BY cnt DESC LIMIT 8").fetchall()
        by_cat_rows   = db.execute("SELECT categoria, COUNT(*) as cnt FROM denuncias GROUP BY categoria").fetchall()
    return jsonify({
        "total": total, "bullying": bullying, "violencia_mulher": mulher, "outro": outro,
        "by_local": [dict(r) for r in by_local_rows],
        "by_categoria": [dict(r) for r in by_cat_rows],
    })

# ──────────────── Serve HTML ────────────────
@app.route("/")
@app.route("/auth")
@app.route("/denuncia")
@app.route("/admin/login")
@app.route("/admin")
@app.route("/reset-password")
def index():
    return send_from_directory(ROOT_DIR, "index.html")

if __name__ == "__main__":
    init_db()
    print("=" * 50)
    print("Voz Segura rodando em http://localhost:5000")
    print("Para criar um admin, execute:")
    print("  python backend/create_admin.py")
    print("=" * 50)
    app.run(debug=True, port=5000)
