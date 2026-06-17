"""
Cria um usuário administrador no banco de dados.
Execute: python backend/create_admin.py
"""
import os, uuid, hashlib, sqlite3
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "vozsegura.db")

def now_iso():
    return datetime.utcnow().isoformat()

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def main():
    print("=== Criar Administrador ===")
    email    = input("E-mail do admin: ").strip().lower()
    password = input("Senha (mín. 6 chars): ").strip()
    nome     = input("Nome: ").strip()
    turma    = input("Turma/cargo (ex.: Coordenação): ").strip()

    if len(password) < 6:
        print("Senha muito curta!"); return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        user_id = str(uuid.uuid4())
        conn.execute("INSERT INTO users(id,email,password_hash,nome,turma,created_at) VALUES(?,?,?,?,?,?)",
                     (user_id, email, hash_password(password), nome, turma or "Admin", now_iso()))
        conn.execute("INSERT INTO user_roles(id,user_id,role,created_at) VALUES(?,?,?,?)",
                     (str(uuid.uuid4()), user_id, "user", now_iso()))
        conn.execute("INSERT INTO user_roles(id,user_id,role,created_at) VALUES(?,?,?,?)",
                     (str(uuid.uuid4()), user_id, "admin", now_iso()))
        conn.commit()
        print(f"Admin '{email}' criado com sucesso!")
    except sqlite3.IntegrityError:
        # Usuário já existe, apenas promover
        row = conn.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
        if row:
            try:
                conn.execute("INSERT INTO user_roles(id,user_id,role,created_at) VALUES(?,?,?,?)",
                             (str(uuid.uuid4()), row["id"], "admin", now_iso()))
                conn.commit()
                print(f"Usuário '{email}' promovido a admin!")
            except sqlite3.IntegrityError:
                print("Usuário já é admin.")
        else:
            print("Erro: e-mail já cadastrado com outro dado.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
