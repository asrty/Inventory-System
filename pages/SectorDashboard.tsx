
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Material {
  id: number;
  nome: string;
  unidade: string;
}

interface ItemEstoque {
  id: number;
  material: Material;
  quantidade: number;
  necessidade: number;
}

const SectorDashboard = () => {
  const [estoque, setEstoque] = useState<ItemEstoque[]>([]);
  const [materiaisDisponiveis, setMateriaisDisponiveis] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<ItemEstoque | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [estoqueRes, materiaisRes] = await Promise.all([
        api.get('/materiais/setor'),
        api.get('/materiais/lista')
      ]);
      setEstoque(estoqueRes);
      setMateriaisDisponiveis(materiaisRes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await api.post('/materiais/update', {
        material_id: editingItem.material.id,
        quantidade: Number(editingItem.quantidade),
        necessidade: Number(editingItem.necessidade)
      });
      setEditingItem(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreate = async (materialId: number) => {
    try {
      await api.post('/materiais/update', {
        material_id: materialId,
        quantidade: 0,
        necessidade: 0
      });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Carregando estoque...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Materiais</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Material</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Disponível</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Necessidade</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {estoque.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{item.material.nome}</div>
                      <div className="text-xs text-gray-500 uppercase">{item.material.unidade}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${item.quantidade < item.necessidade ? 'text-red-600' : 'text-green-600'}`}>
                        {item.quantidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.necessidade}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="text-lg font-bold mb-4">Adicionar Material</h2>
            <div className="space-y-2">
              {materiaisDisponiveis
                .filter(m => !estoque.find(e => e.material.id === m.id))
                .map(m => (
                  <div key={m.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                    <span className="text-sm font-medium">{m.nome}</span>
                    <button 
                      onClick={() => handleCreate(m.id)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Adicionar
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">Editar: {editingItem.material.nome}</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade Disponível</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={editingItem.quantidade}
                  onChange={e => setEditingItem({...editingItem, quantidade: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Necessidade Futura</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={editingItem.necessidade}
                  onChange={e => setEditingItem({...editingItem, necessidade: Number(e.target.value)})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorDashboard;
