import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Edit2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function LecturesPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });

  const utils = trpc.useUtils();
  const { data: lectures = [], isLoading } = trpc.lectures.list.useQuery();
  const createMutation = trpc.lectures.create.useMutation({
    onSuccess: () => {
      utils.lectures.list.invalidate();
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setIsAdding(false);
      toast.success('강의가 추가되었습니다');
    },
    onError: (error) => {
      toast.error(error.message || '강의 추가 실패');
    },
  });

  const updateMutation = trpc.lectures.update.useMutation({
    onSuccess: () => {
      utils.lectures.list.invalidate();
      setEditingId(null);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      toast.success('강의가 수정되었습니다');
    },
    onError: (error) => {
      toast.error(error.message || '강의 수정 실패');
    },
  });

  const deleteMutation = trpc.lectures.delete.useMutation({
    onSuccess: () => {
      utils.lectures.list.invalidate();
      toast.success('강의가 삭제되었습니다');
    },
    onError: (error) => {
      toast.error(error.message || '강의 삭제 실패');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('강의명을 입력해주세요');
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        description: formData.description,
        color: formData.color,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        color: formData.color,
      });
    }
  };

  const handleEdit = (lecture: any) => {
    setEditingId(lecture.id);
    setFormData({
      name: lecture.name,
      description: lecture.description || '',
      color: lecture.color || '#3B82F6',
    });
    setIsAdding(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('이 강의를 삭제하시겠습니까?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  if (isLoading) {
    return <div className="p-6 text-center">로딩 중...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">강의 관리</h1>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus size={20} /> 강의 추가
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6 bg-white border border-amber-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? '강의 수정' : '새 강의 추가'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">강의명 *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: AI 리터러시"
                className="border-amber-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">설명</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="강의에 대한 설명을 입력해주세요"
                className="border-amber-200 h-24"
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

      <div className="grid gap-4">
        {lectures.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            아직 등록된 강의가 없습니다. 강의를 추가해주세요.
          </Card>
        ) : (
          lectures.map((lecture: any) => (
            <Card
              key={lecture.id}
              className="p-4 border-l-4"
              style={{ borderLeftColor: lecture.color }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === lecture.id ? null : lecture.id)
                    }
                    className="flex items-center gap-2 hover:opacity-70 transition"
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${
                        expandedId === lecture.id ? 'rotate-180' : ''
                      }`}
                    />
                    <h3 className="text-lg font-semibold">{lecture.name}</h3>
                  </button>

                  {expandedId === lecture.id && lecture.description && (
                    <p className="mt-3 ml-7 text-gray-600 text-sm">
                      {lecture.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(lecture)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(lecture.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
