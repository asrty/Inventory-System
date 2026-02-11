
# MaterialFlow: Sistema de Controle de Materiais Corporativos

Este sistema permite a gestão eficiente de materiais entre diferentes setores de uma organização.

## 🚀 Tecnologias
- **Frontend:** React + TypeScript + Tailwind CSS + Recharts
- **Backend:** Node.js + Express + Prisma (PostgreSQL)
- **Cache:** Redis
- **Infra:** Docker & Docker Compose

## 🛠️ Configuração Inicial

### Variáveis de Ambiente (.env no backend)
```env
DATABASE_URL="postgresql://user:password@postgres:5432/materialdb?schema=public"
REDIS_URL="redis://redis:6379"
JWT_SECRET="sua_chave_secreta_super_segura"
PORT=3001
REDIS_TTL=3600
```

### Como Rodar
1. Certifique-se de ter Docker e Docker Compose instalados.
2. Na raiz do projeto, execute:
   ```bash
   docker-compose up --build
   ```
3. O frontend estará em `http://localhost:5173` e o backend em `http://localhost:3001`.

## 🔐 Autenticação
O sistema utiliza JWT. Ao fazer login, o token é armazenado no `localStorage` e enviado em todos os headers `Authorization: Bearer <token>`.

## ⚡ Redis Cache
As rotas de relatórios administrativos utilizam Redis para cache:
- **Cache Hit:** Retorna dados instantaneamente do Redis.
- **Cache Miss:** Consulta o PostgreSQL, salva no Redis e retorna.
- **Invalidação:** Sempre que um material é atualizado ou cadastrado, o cache de relatórios do setor correspondente é invalidado.

## 📁 Estrutura de Rotas API
- `POST /auth/login`: Login e geração de token.
- `GET /materiais`: Lista materiais (Setor vê o seu, Admin vê todos).
- `POST /materiais`: Setor cadastra/atualiza estoque.
- `GET /admin/relatorios`: Dados agregados para gráficos (Apenas Admin).
- `GET /admin/users`: Gerenciamento de usuários.
- `GET /setores`: Lista setores cadastrados.

## 🚀 Execução em Desenvolvimento Local (Sem Docker)

Se você deseja editar o código e ver as mudanças em tempo real:

### 1. Requisitos
- Node.js instalado.
- PostgreSQL e Redis rodando localmente.

### 2. Backend
1. Entre na pasta do backend.
2. Crie um arquivo `.env` (use o `README.md` como base para as variáveis).
3. Instale as dependências: `npm install`.
4. Sincronize o banco: `npx prisma db push`.
5. Inicie: `npm run dev` (ou `npx tsx watch server.ts`).

### 3. Frontend
1. Na pasta raiz, instale as dependências: `npm install`.
2. Crie um arquivo `.env` com `VITE_API_URL=http://localhost:3001`.
3. Inicie: `npm run dev`.

---

## 🔐 Credenciais Padrão (Seed)
- **Admin:** `admin@empresa.com` / `123456`
- **Setor TI:** `maria@empresa.com` / `123456`
- **Setor Logística:** `joao@empresa.com` / `123456`
