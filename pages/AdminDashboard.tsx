
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface Stats {
  setores: { nome: string; totalEstoque: number; totalNecessidade: number }[];
  materiais: { nome: string; quantidade: number; necessidade: number }[];
  summary: { totalSetores: number; totalItens: number; deficit: number };
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/admin/relatorios');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) return <div className="flex items-center justify-center h-64">Carregando painel administrativo...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Visão Geral Corporativa</h1>
        <p className="text-gray-500">Acompanhamento de estoque e necessidades de todos os setores.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total de Setores</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.summary.totalSetores}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500">Itens em Estoque</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.summary.totalItens}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500">Déficit de Necessidade</p>
          <p className="text-3xl font-bold text-amber-600">{stats.summary.deficit}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Estoque por Setor */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold mb-6">Estoque vs Necessidade por Setor</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.setores}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalEstoque" name="Estoque" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalNecessidade" name="Necessidade" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Necessidades */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold mb-6">Materiais com Maior Déficit</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.materiais.filter(m => m.necessidade > m.quantidade)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="necessidade"
                  nameKey="nome"
                >
                  {stats.materiais.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Detalhamento */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Ranking de Materiais</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Material</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Qtd. Total</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Necessidade</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stats.materiais.map((m, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{m.nome}</td>
                <td className="px-6 py-4 text-center">{m.quantidade}</td>
                <td className="px-6 py-4 text-center">{m.necessidade}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.quantidade >= m.necessidade ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {m.quantidade >= m.necessidade ? 'OK' : 'Crítico'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
