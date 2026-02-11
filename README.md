
# MaterialFlow: Sistema de Controle de Materiais Corporativos

Este sistema permite a gestão eficiente de materiais entre diferentes setores de uma organização, com dashboards administrativos e controle de estoque por setor.

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
