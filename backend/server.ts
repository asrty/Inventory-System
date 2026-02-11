
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

app.use(cors());
app.use(express.json());

// --- Middlewares ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Acesso negado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Sem permissão' });
  }
  next();
};

// --- Routes ---

// Auth
app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ 
    id: user.id, 
    role: user.role, 
    setor_id: user.setor_id 
  }, JWT_SECRET, { expiresIn: '8h' });

  res.json({ token, user: { 
    id: user.id, 
    nome: user.nome, 
    email: user.email, 
    role: user.role, 
    setor_id: user.setor_id 
  }});
});

// Materiais (Sector View)
app.get('/materiais/setor', authenticate, async (req: any, res) => {
  if (!req.user.setor_id) return res.json([]);
  const estoque = await prisma.estoque.findMany({
    where: { setor_id: req.user.setor_id },
    include: { material: true }
  });
  res.json(estoque);
});

// Full Material List (for dropdowns)
app.get('/materiais/lista', authenticate, async (req, res) => {
  const materiais = await prisma.material.findMany();
  res.json(materiais);
});

// Update Estoque (Sector Action)
app.post('/materiais/update', authenticate, async (req: any, res) => {
  const { material_id, quantidade, necessidade } = req.body;
  const setor_id = req.user.setor_id;

  if (!setor_id) return res.status(400).json({ message: 'Usuário sem setor' });

  const estoque = await prisma.estoque.upsert({
    where: {
      setor_id_material_id: { setor_id, material_id }
    },
    update: { quantidade, necessidade },
    create: { setor_id, material_id, quantidade, necessidade }
  });

  // Invalida cache de relatórios
  await redis.del('admin_stats');
  
  res.json(estoque);
});

// Admin Reports (With Redis Cache)
app.get('/admin/relatorios', authenticate, authorize(['ADMIN']), async (req, res) => {
  const cached = await redis.get('admin_stats');
  if (cached) {
    console.log('[Redis] Cache Hit');
    return res.json(JSON.parse(cached));
  }

  console.log('[Redis] Cache Miss');
  const [setores, materiais, countSetores] = await Promise.all([
    prisma.setor.findMany({
      include: {
        estoques: true
      }
    }),
    prisma.material.findMany({
      include: {
        estoques: true
      }
    }),
    prisma.setor.count()
  ]);

  const stats = {
    summary: {
      totalSetores: countSetores,
      totalItens: materiais.reduce((acc, m) => acc + m.estoques.reduce((sum, e) => sum + e.quantidade, 0), 0),
      deficit: materiais.reduce((acc, m) => {
        const need = m.estoques.reduce((sum, e) => sum + e.necessidade, 0);
        const have = m.estoques.reduce((sum, e) => sum + e.quantidade, 0);
        return acc + Math.max(0, need - have);
      }, 0)
    },
    setores: setores.map(s => ({
      nome: s.nome,
      totalEstoque: s.estoques.reduce((sum, e) => sum + e.quantidade, 0),
      totalNecessidade: s.estoques.reduce((sum, e) => sum + e.necessidade, 0)
    })),
    materiais: materiais.map(m => ({
      nome: m.nome,
      quantidade: m.estoques.reduce((sum, e) => sum + e.quantidade, 0),
      necessidade: m.estoques.reduce((sum, e) => sum + e.necessidade, 0)
    }))
  };

  await redis.setex('admin_stats', Number(process.env.REDIS_TTL) || 3600, JSON.stringify(stats));
  res.json(stats);
});

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno no servidor' });
});

// Seed Initial Data (for demo purposes)
const seed = async () => {
  const count = await prisma.user.count();
  if (count === 0) {
    const s1 = await prisma.setor.create({ data: { nome: 'Logística' } });
    const s2 = await prisma.setor.create({ data: { nome: 'TI' } });
    const s3 = await prisma.setor.create({ data: { nome: 'Manutenção' } });

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash('123456', salt);

    await prisma.user.create({ data: { nome: 'Admin', email: 'admin@empresa.com', senha_hash, role: 'ADMIN' } });
    await prisma.user.create({ data: { nome: 'João Logística', email: 'joao@empresa.com', senha_hash, role: 'SETOR', setor_id: s1.id } });
    await prisma.user.create({ data: { nome: 'Maria TI', email: 'maria@empresa.com', senha_hash, role: 'SETOR', setor_id: s2.id } });

    await prisma.material.createMany({
      data: [
        { nome: 'Papel A4', unidade: 'Resma' },
        { nome: 'Cabo de Rede', unidade: 'Metro' },
        { nome: 'Monitor 24"', unidade: 'Un' },
        { nome: 'Parafuso', unidade: 'Caixa' }
      ]
    });
    console.log('Seed concluído!');
  }
};

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await seed();
});
