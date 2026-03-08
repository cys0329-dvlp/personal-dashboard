// ============================================================
// Schedule Category Manager - 일정 카테고리 색상 관리
// ============================================================

import { useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { ScheduleCategory } from '@/lib/types';

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6b7280', // Gray
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export default function ScheduleCategoryManager() {
  const { scheduleCategories, addScheduleCategory, updateScheduleCategory, deleteScheduleCategory } = useDashboard();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    color: string;
    type: 'lecture' | 'work' | 'event';
  }>({
    name: '',
    color: PRESET_COLORS[0],
    type: 'lecture',
  });

  const handleAddCategory = () => {
    if (!formData.name.trim()) {
      alert('카테고리 이름을 입력해주세요');
      return;
    }

    if (editingId) {
      updateScheduleCategory(editingId, {
        name: formData.name,
        color: formData.color,
      });
      setEditingId(null);
    } else {
      addScheduleCategory({
        name: formData.name,
        color: formData.color,
        type: formData.type,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: PRESET_COLORS[0],
      type: 'lecture',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (category: ScheduleCategory) => {
    setFormData({
      name: category.name,
      color: category.color,
      type: (category.type || 'lecture') as 'lecture' | 'work' | 'event',
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('이 카테고리를 삭제하시겠습니까?')) {
      deleteScheduleCategory(id);
    }
  };

  const categories = Object.values(scheduleCategories);
  const isDefaultCategory = (id: string) => id.startsWith('default_');

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">일정 카테고리 관리</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">카테고리 추가</span>
          <span className="md:hidden">추가</span>
        </button>
      </div>

      {/* 추가/편집 폼 */}
      {showForm && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="카테고리 이름 (예: 중요한 강의)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                색상 선택
              </label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded border-2 transition-all ${
                      formData.color === color
                        ? 'border-gray-800 ring-2 ring-offset-1'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'lecture' | 'work' | 'event' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base"
            >
              <option value="lecture">강의</option>
              <option value="work">알바/일</option>
              <option value="event">이벤트</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
              >
                {editingId ? '수정' : '추가'}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <div
            key={category.id}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-6 h-6 rounded flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                  <p className="text-xs text-gray-500">
                    {category.type === 'lecture' ? '강의' : category.type === 'work' ? '알바/일' : '이벤트'}
                  </p>
                </div>
              </div>
              {!isDefaultCategory(category.id) && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="편집"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 색상 코드 */}
            <div className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
              {category.color}
            </div>

            {/* 기본 카테고리 표시 */}
            {isDefaultCategory(category.id) && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                기본 카테고리
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">등록된 카테고리가 없습니다.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
          >
            <Plus className="w-5 h-5" />
            첫 번째 카테고리 추가
          </button>
        </div>
      )}
    </div>
  );
}
