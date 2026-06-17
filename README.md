# Voz Segura

Portal escolar de denúncias de bullying e violência contra a mulher.

## Tecnologias

- **Frontend**: HTML + CSS + JavaScript puro (SPA com roteamento client-side)
- **Backend**: Python + Flask
- **Banco de dados**: SQLite (arquivo local `backend/vozsegura.db`)

## Estrutura

```
voz-segura/
├── index.html               ← HTML único (SPA)
├── requirements.txt
├── static/
│   ├── css/style.css        ← Todos os estilos
│   └── js/app.js            ← Toda a lógica frontend
└── backend/
    ├── app.py               ← Servidor Flask + API REST
    ├── create_admin.py      ← Script para criar admin
    └── vozsegura.db         ← Criado automaticamente
```

## Como rodar

### 1. Instalar dependências

```bash
pip install -r requirements.txt
```

### 2. Iniciar o servidor

```bash
python backend/app.py
```

Acesse: http://localhost:5000

O banco de dados `vozsegura.db` é criado automaticamente na primeira execução.

### 3. Criar um administrador

```bash
python backend/create_admin.py
```

Siga as instruções no terminal. Depois acesse `/admin/login`.

## Funcionalidades

| Página | Rota | Descrição |
|--------|------|-----------|
| Landing | `/` | Página inicial pública |
| Login/Cadastro | `/auth` | Apenas e-mails @escola.pr.gov.br |
| Denúncia | `/denuncia` | Formulário autenticado |
| Admin | `/admin/login` | Login da coordenação |
| Painel | `/admin` | Dashboard com gráficos e tabela |
| Reset senha | `/reset-password?token=...` | Link enviado por e-mail |

## Notas

- **Reset de senha**: em desenvolvimento local o link aparece no console do servidor. Em produção, integre um serviço de e-mail (SMTP, SendGrid, etc.).
- **Domínio de e-mail**: configurado como `@escola.pr.gov.br`. Para alterar, edite a constante `EMAIL_DOMAIN` em `backend/app.py`.
- **Produção**: troque `app.secret_key` por uma variável de ambiente e use `gunicorn` em vez de `flask run`.
