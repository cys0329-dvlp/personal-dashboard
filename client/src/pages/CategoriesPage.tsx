import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Edit2, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'tag',
    color: '#6B7280',
  });

  const utils = trpc.useUtils();
  const { data: expenseCategories = [] } = trpc.categories.list.useQuery({ type: 'expense' });
  const { data: incomeCategories = [] } = trpc.categories.list.useQuery({ type: 'income' });

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      setFormData({ name: '', icon: 'tag', color: '#6B7280' });
      setIsAdding(false);
      toast.success('카테고리가 추가되었습니다');
    },
    onError: (error) => {
      toast.error(error.message || '카테고리 추가 실패');
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      setEditingId(null);
      setFormData({ name: '', icon: 'tag', color: '#6B7280' });
      toast.success('카테고리가 수정되었습니다');
    },
    onError: (error) => {
      toast.error(error.message || '카테고리 수정 실패');
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success('카테고리가 삭제되었습니다');
    },
    onError: (error) => {
      toast.error(error.message || '카테고리 삭제 실패');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('카테고리명을 입력해주세요');
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        type: selectedType,
        icon: formData.icon,
        color: formData.color,
      });
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      icon: category.icon || 'tag',
      color: category.color || '#6B7280',
    });
    setIsAdding(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('이 카테고리를 삭제하시겠습니까?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', icon: 'tag', color: '#6B7280' });
  };

  const categories = selectedType === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">카테고리 관리</h1>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus size={20} /> 카테고리 추가
          </Button>
        )}
      </div>

      {/* Type selector */}
      <div className="flex gap-2 border-b border-amber-200">
        <button
          onClick={() => setSelectedType('expense')}
          className={`px-4 py-3 font-semibold border-b-2 transition ${
            selectedType === 'expense'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          지출 카테고리
        </button>
        <button
          onClick={() => setSelectedType('income')}
          className={`px-4 py-3 font-semibold border-b-2 transition ${
            selectedType === 'income'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          수입 카테고리
        </button>
      </div>

      {isAdding && (
        <Card className="p-6 bg-white border border-amber-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? '카테고리 수정' : '새 카테고리 추가'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">카테고리명 *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 식비, 교통비, 급여"
                className="border-amber-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">아이콘</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="tag, coffee, car 등"
                  className="border-amber-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">색상</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{formData.color}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? '수정' : '추가'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-3">
        {categories.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            아직 등록된 카테고리가 없습니다. 카테고리를 추가해주세요.
          </Card>
        ) : (
          categories.map((category: any) => (
            <Card key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: category.color }}
                >
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.icon}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(category)}
                >
                  <Edit2 size={18} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
