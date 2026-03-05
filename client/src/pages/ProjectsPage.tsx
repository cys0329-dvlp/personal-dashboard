// Projects Page - 프로젝트 일정 관리
// Design: 웜 어스톤 생산성 대시보드
// Features:
//   - 프로젝트 등록/수정/삭제 (시작~종료 시간 포함)
//   - 프로젝트 내 할 일 추가/수정/삭제/완료
//   - 상태: 시작전(파랑), 진행중(초록), 완료(숨김+복구)
// ============================================================

import { useState, useMemo } from 'react';
import {
  Plus, Pencil, Trash2, X, ChevronDown, ChevronRight,
  CheckCircle2, Circle, RotateCcw, Clock, Calendar, AlertTriangle, Info
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Project, Task, ProjectStatus } from '@/lib/types';
import { formatDisplayDateTime, today } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ---- Confirm Dialog ----
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ title, message, confirmLabel = '확인', confirmClass = '', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="warm-card w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'oklch(0.22 0.04 50)' }}>{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
            취소
          </button>
          <button onClick={onConfirm} className={cn("flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors", confirmClass || "bg-primary text-primary-foreground hover:opacity-90")}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Project Detail Modal ----
interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  onEdit: (p: Project) => void;
}

function ProjectDetailModal({ project, onClose, onEdit }: ProjectDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="warm-card w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
            {project.title}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">상태</label>
            <span className={cn(
              "inline-block text-xs px-2 py-1 rounded-full font-semibold",
              project.status === 'todo' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
            )}>
              {project.status === 'todo' ? '시작 전' : '진행 중'}
            </span>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">시작</label>
              <div className="text-sm font-medium">{formatDisplayDateTime(project.startDate)}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">종료</label>
              <div className="text-sm font-medium">{formatDisplayDateTime(project.endDate)}</div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">설명</label>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              닫기
            </button>
            <button
              onClick={() => {
                onEdit(project);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Pencil size={16} /> 수정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Project Form Modal ----
interface ProjectFormProps {
  initial?: Project;
  onSave: (data: Omit<Project, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function ProjectForm({ initial, onSave, onClose }: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState<ProjectStatus>(initial?.status || 'todo');
  const [startDate, setStartDate] = useState(initial?.startDate || `${today()}T09:00`);
  const [endDate, setEndDate] = useState(initial?.endDate || `${today()}T18:00`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;
    onSave({ title: title.trim(), description: description.trim(), status, startDate, endDate });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="warm-card w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
            {initial ? '프로젝트 수정' : '프로젝트 등록'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">프로젝트명 *</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="프로젝트 이름" required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">설명</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="프로젝트에 대한 상세 설명을 입력하세요" rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">상태 *</label>
            <div className="flex rounded-lg overflow-hidden border border-input">
              <button
                type="button"
                onClick={() => setStatus('todo')}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold transition-colors",
                  status === 'todo' ? "bg-blue-500 text-white" : "bg-background hover:bg-secondary"
                )}
              >
                시작 전
              </button>
              <button
                type="button"
                onClick={() => setStatus('inprogress')}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold transition-colors",
                  status === 'inprogress' ? "bg-green-500 text-white" : "bg-background hover:bg-secondary"
                )}
              >
                진행 중
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">시작 날짜/시간 *</label>
            <input
              type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">종료 날짜/시간 *</label>
            <input
              type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
              취소
            </button>
            <button type="submit" disabled={!title} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {initial ? '수정 완료' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Project Card ----
interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onEdit: (p: Project) => void;
  onShowDetail: (p: Project) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: (projectId: string) => void;
  onEditTask: (t: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

function ProjectCard({ project, tasks, onEdit, onShowDetail, onComplete, onDelete, onAddTask, onEditTask, onDeleteTask, onToggleTask }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(true);
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round(completedCount / tasks.length * 100) : 0;

  const isTodo = project.status === 'todo';
  const isInProgress = project.status === 'inprogress';

  // Check if overdue
  const isOverdue = new Date(project.endDate) < new Date();

  return (
    <div className={cn(
      "warm-card overflow-hidden",
      isTodo && "border-l-4 border-l-blue-400",
      isInProgress && "border-l-4 border-l-green-500",
    )}
    style={{
      background: isTodo
        ? 'linear-gradient(135deg, oklch(0.95 0.04 240), oklch(0.98 0.012 80))'
        : isInProgress
          ? 'linear-gradient(135deg, oklch(0.95 0.04 145), oklch(0.98 0.012 80))'
          : undefined
    }}
    >
      {/* Project header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-0.5 p-1 rounded hover:bg-black/5 transition-colors shrink-0"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onShowDetail(project)}
                className="font-bold text-base hover:opacity-70 transition flex items-center gap-1"
                style={{ color: 'oklch(0.22 0.04 50)' }}
              >
                {project.title}
                <Info size={14} className="text-amber-600" />
              </button>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-semibold",
                isTodo ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
              )}>
                {isTodo ? '시작 전' : '진행 중'}
              </span>
              {isOverdue && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-600">
                  기한 초과
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar size={11} />
                <span>{formatDisplayDateTime(project.startDate)}</span>
              </div>
              <span>→</span>
              <div className={cn("flex items-center gap-1", isOverdue && "text-red-500 font-medium")}>
                <Clock size={11} />
                <span>{formatDisplayDateTime(project.endDate)}</span>
              </div>
            </div>

            {tasks.length > 0 && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">진행률</span>
                  <span className="text-xs font-semibold">{completedCount}/{tasks.length} ({progress}%)</span>
                </div>
                <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, oklch(0.55 0.15 55), oklch(0.65 0.15 55))'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              <Pencil size={14} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => onComplete(project.id)}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              <CheckCircle2 size={14} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks section */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-black/5 space-y-2">
          {tasks.length === 0 ? (
            <button
              onClick={() => onAddTask(project.id)}
              className="w-full py-2.5 rounded-lg border border-dashed border-black/20 text-sm text-muted-foreground hover:bg-black/2 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> 할 일 추가
            </button>
          ) : (
            <>
              {tasks.map(task => (
                <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-black/2 transition-colors group">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Circle size={16} className="text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", task.completed && "line-through text-muted-foreground")}>
                      {task.title}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1 rounded hover:bg-black/10 transition-colors"
                    >
                      <Pencil size={12} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 rounded hover:bg-black/10 transition-colors"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => onAddTask(project.id)}
                className="w-full py-1.5 rounded-lg border border-dashed border-black/20 text-xs text-muted-foreground hover:bg-black/2 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={12} /> 할 일 추가
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Task Form Modal ----
interface TaskFormProps {
  initial?: Task;
  onSave: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function TaskForm({ initial, onSave, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || today());
  const [dueTime, setDueTime] = useState(initial?.dueTime || '09:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), projectId: initial?.projectId || '', completed: initial?.completed || false, dueDate, dueTime });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="warm-card w-full max-w-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
            {initial ? '할 일 수정' : '할 일 추가'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">할 일 *</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요" required autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">날짜</label>
              <input
                type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">시간</label>
              <input
                type="time" value={dueTime} onChange={e => setDueTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
              취소
            </button>
            <button type="submit" disabled={!title} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {initial ? '수정 완료' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function ProjectsPage() {
  const { projects, tasks, addProject, updateProject, completeProject, addTask, updateTask, deleteTask, toggleTask, restoreProject, deletedProjects } = useDashboard();

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: string; id: string } | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);

  const activeProjects = projects.filter(p => p.status !== 'done');
  const projectTasks = (projectId: string) => tasks.filter(t => t.projectId === projectId);

  const handleAddProject = (data: Omit<Project, 'id' | 'createdAt'>) => {
    addProject(data);
    setShowProjectForm(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleUpdateProject = (data: Omit<Project, 'id' | 'createdAt'>) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
      setEditingProject(null);
      setShowProjectForm(false);
    }
  };

  const handleCompleteProject = (id: string) => {
    setConfirmDialog({ type: 'complete', id });
  };

  const handleDeleteProject = (id: string) => {
    setConfirmDialog({ type: 'delete', id });
  };

  const handleConfirm = () => {
    if (!confirmDialog) return;
      if (confirmDialog.type === 'complete') {
      completeProject(confirmDialog.id);
    } else if (confirmDialog.type === 'delete') {
      const project = projects.find(p => p.id === confirmDialog.id);
      if (project) {
        updateProject(confirmDialog.id, { ...project, status: 'done' });
      }
    }
    setConfirmDialog(null);
  };

  const handleAddTask = (projectId: string) => {
    setEditingProjectId(projectId);
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask({ ...data, projectId: editingProjectId || '' });
    }
    setShowTaskForm(false);
    setEditingTask(null);
    setEditingProjectId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>프로젝트</h1>
        <button
          onClick={() => { setEditingProject(null); setShowProjectForm(true); }}
          className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={18} /> 프로젝트 추가
        </button>
      </div>

      {/* Projects */}
      <div className="space-y-3">
        {activeProjects.length === 0 ? (
          <div className="warm-card p-8 text-center text-muted-foreground">
            <p>등록된 프로젝트가 없습니다.</p>
          </div>
        ) : (
          activeProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={projectTasks(project.id)}
              onEdit={handleEditProject}
              onShowDetail={setDetailProject}
              onComplete={handleCompleteProject}
              onDelete={handleDeleteProject}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={deleteTask}
              onToggleTask={toggleTask}
            />
          ))
        )}
      </div>

      {/* Archived Projects */}
      {archivedProjects.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>완료된 프로젝트</h2>
          {archivedProjects.map(project => (
            <div key={project.id} className="warm-card p-4 flex items-center justify-between opacity-60">
              <div>
                <h3 className="font-bold text-base" style={{ color: 'oklch(0.22 0.04 50)' }}>{project.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{formatDisplayDateTime(project.endDate)}</p>
              </div>
              <button
                onClick={() => {
                  restoreProject(project.id);
                  setArchivedProjects(archivedProjects.filter(p => p.id !== project.id));
                }}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors flex items-center gap-1"
              >
                <RotateCcw size={12} /> 복구
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showProjectForm && (
        editingProject ? (
          <ProjectForm
            initial={editingProject}
            onSave={handleUpdateProject}
            onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
          />
        ) : (
          <ProjectForm
            onSave={handleAddProject}
            onClose={() => setShowProjectForm(false)}
          />
        )
      )}

      {showTaskForm && (
        <TaskForm
          initial={editingTask || undefined}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskForm(false); setEditingTask(null); setEditingProjectId(null); }}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.type === 'complete' ? '프로젝트 완료' : '프로젝트 삭제'}
          message={confirmDialog.type === 'complete' ? '이 프로젝트를 완료 처리하시겠습니까?' : '이 프로젝트를 삭제하시겠습니까?'}
          confirmLabel={confirmDialog.type === 'complete' ? '완료' : '삭제'}
          confirmClass={confirmDialog.type === 'complete' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
          onEdit={handleEditProject}
        />
      )}
    </div>
  );
}
