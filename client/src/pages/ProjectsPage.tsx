// ============================================================
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
  CheckCircle2, Circle, RotateCcw, Clock, Calendar, AlertTriangle
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
      <div className="warm-card w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
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
              placeholder="프로젝트 설명" rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">상태</label>
            <div className="flex gap-2">
              {([
                { value: 'todo' as const, label: '시작 전', activeClass: 'bg-blue-500 text-white border-blue-500' },
                { value: 'inprogress' as const, label: '진행 중', activeClass: 'bg-green-500 text-white border-green-500' },
              ]).map(s => (
                <button
                  key={s.value} type="button" onClick={() => setStatus(s.value)}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-lg border transition-all",
                    status === s.value ? s.activeClass : "border-border hover:bg-secondary"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">시작 일시 *</label>
              <input
                type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">종료 일시 *</label>
              <input
                type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
              취소
            </button>
            <button type="submit" disabled={!title || !startDate || !endDate} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {initial ? '수정 완료' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Task Form Modal ----
interface TaskFormProps {
  projectId: string;
  initial?: Task;
  onSave: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function TaskForm({ projectId, initial, onSave, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || today());
  const [dueTime, setDueTime] = useState(initial?.dueTime || '');
  const [detail, setDetail] = useState(initial?.detail || '');
  const [category, setCategory] = useState(initial?.category || '');

  const TASK_CATEGORIES = ['개인일정', '업무', '최우선업무', '학습', '기타'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ projectId, title: title.trim(), dueDate: dueDate || undefined, dueTime: dueTime || undefined, detail: detail.trim(), category: category.trim(), completed: initial?.completed || false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="warm-card w-full max-w-sm p-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
            {initial ? '할 일 수정' : '할 일 추가'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">할 일 *</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="할 일 내용" required
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

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">카테고리</label>
            <div className="flex flex-wrap gap-1.5">
              {TASK_CATEGORIES.map(cat => (
                <button
                  key={cat} type="button" onClick={() => setCategory(category === cat ? '' : cat)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg border transition-all font-medium",
                    category === cat
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 hover:bg-secondary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">메모</label>
            <textarea
              value={detail} onChange={e => setDetail(e.target.value)}
              placeholder="상세 내용" rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
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
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: (projectId: string) => void;
  onEditTask: (t: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

function ProjectCard({ project, tasks, onEdit, onComplete, onDelete, onAddTask, onEditTask, onDeleteTask, onToggleTask }: ProjectCardProps) {
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
              <h3 className="font-bold text-base" style={{ color: 'oklch(0.22 0.04 50)' }}>{project.title}</h3>
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
            {project.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
            )}
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
                      background: isTodo ? '#3B82F6' : '#22C55E'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onAddTask(project.id)}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground hover:text-foreground"
              title="할 일 추가"
            >
              <Plus size={15} />
            </button>
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground hover:text-foreground"
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onComplete(project.id)}
              className="p-1.5 rounded-lg hover:bg-green-100 transition-colors text-muted-foreground hover:text-green-600"
              title="완료 처리"
            >
              <CheckCircle2 size={15} />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
              title="삭제"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {expanded && (
        <div className="border-t border-black/5 bg-white/50">
          {tasks.length === 0 ? (
            <div className="px-6 py-3 text-sm text-muted-foreground">
              할 일이 없습니다.{' '}
              <button onClick={() => onAddTask(project.id)} className="text-primary hover:underline font-medium">
                추가하기
              </button>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-6 py-2.5 group hover:bg-white/60 transition-colors">
                  <button onClick={() => onToggleTask(task.id)} className="shrink-0 transition-transform hover:scale-110">
                    {task.completed
                      ? <CheckCircle2 size={18} className="text-green-500" />
                      : <Circle size={18} className="text-muted-foreground" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {task.dueDate && (
                        <span>{task.dueDate}{task.dueTime ? ` ${task.dueTime}` : ''}</span>
                      )}
                      {task.category && (
                        <span className="px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground">{task.category}</span>
                      )}
                      {task.detail && <span className="truncate">· {task.detail}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEditTask(task)} className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDeleteTask(task.id)} className="p-1 rounded hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Main Projects Page ----
export default function ProjectsPage() {
  const { projects, addProject, updateProject, completeProject, tasks, addTask, updateTask, deleteTask, toggleTask, deletedProjects, restoreProject } = useDashboard();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [taskProjectId, setTaskProjectId] = useState<string>('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<string | null>(null);

  const activeProjects = projects.filter(p => p.status !== 'done');
  const todoProjects = activeProjects.filter(p => p.status === 'todo');
  const inprogressProjects = activeProjects.filter(p => p.status === 'inprogress');

  const getProjectTasks = (projectId: string) =>
    tasks.filter(t => t.projectId === projectId).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.dueDate || '').localeCompare(b.dueDate || '');
    });

  const handleProjectSave = (data: Omit<Project, 'id' | 'createdAt'>) => {
    if (editProject) {
      updateProject(editProject.id, data);
    } else {
      addProject(data);
    }
    setShowProjectForm(false);
    setEditProject(null);
  };

  const handleTaskSave = (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (editTask) {
      updateTask(editTask.id, data);
    } else {
      addTask(data);
    }
    setShowTaskForm(false);
    setEditTask(null);
  };

  const doCompleteProject = (id: string) => {
    completeProject(id);
    setConfirmComplete(null);
  };

  const doDeleteProject = (id: string) => {
    // Remove related tasks
    tasks.filter(t => t.projectId === id).forEach(t => deleteTask(t.id));
    completeProject(id);
    setConfirmDelete(null);
  };

  const doDeleteTask = (id: string) => {
    deleteTask(id);
    setConfirmDeleteTask(null);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>프로젝트 관리</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            진행 중 {inprogressProjects.length}개 · 시작 전 {todoProjects.length}개
          </p>
        </div>
        <button
          onClick={() => { setEditProject(null); setShowProjectForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          프로젝트 등록
        </button>
      </div>

      {/* In Progress */}
      {inprogressProjects.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">진행 중</h3>
            <span className="text-xs text-muted-foreground">({inprogressProjects.length})</span>
          </div>
          <div className="space-y-3">
            {inprogressProjects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                tasks={getProjectTasks(p.id)}
                onEdit={proj => { setEditProject(proj); setShowProjectForm(true); }}
                onComplete={id => setConfirmComplete(id)}
                onDelete={id => setConfirmDelete(id)}
                onAddTask={pid => { setTaskProjectId(pid); setEditTask(null); setShowTaskForm(true); }}
                onEditTask={t => { setEditTask(t); setTaskProjectId(t.projectId); setShowTaskForm(true); }}
                onDeleteTask={id => setConfirmDeleteTask(id)}
                onToggleTask={toggleTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Todo */}
      {todoProjects.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">시작 전</h3>
            <span className="text-xs text-muted-foreground">({todoProjects.length})</span>
          </div>
          <div className="space-y-3">
            {todoProjects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                tasks={getProjectTasks(p.id)}
                onEdit={proj => { setEditProject(proj); setShowProjectForm(true); }}
                onComplete={id => setConfirmComplete(id)}
                onDelete={id => setConfirmDelete(id)}
                onAddTask={pid => { setTaskProjectId(pid); setEditTask(null); setShowTaskForm(true); }}
                onEditTask={t => { setEditTask(t); setTaskProjectId(t.projectId); setShowTaskForm(true); }}
                onDeleteTask={id => setConfirmDeleteTask(id)}
                onToggleTask={toggleTask}
              />
            ))}
          </div>
        </div>
      )}

      {activeProjects.length === 0 && (
        <div className="warm-card p-12 text-center">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="font-semibold text-lg mb-1">프로젝트가 없습니다</p>
          <p className="text-sm text-muted-foreground mb-4">새 프로젝트를 등록해보세요</p>
          <button
            onClick={() => { setEditProject(null); setShowProjectForm(true); }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            프로젝트 등록
          </button>
        </div>
      )}

      {/* Completed projects recovery */}
      {deletedProjects.length > 0 && (
        <div className="warm-card p-4">
          <button
            onClick={() => setShowDeleted(v => !v)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold w-full"
          >
            <RotateCcw size={14} />
            완료된 프로젝트 ({deletedProjects.length}개)
            {showDeleted ? <ChevronDown size={14} className="ml-auto" /> : <ChevronRight size={14} className="ml-auto" />}
          </button>

          {showDeleted && (
            <div className="mt-3 space-y-2">
              {deletedProjects.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm line-through text-muted-foreground">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      완료 처리: {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    </div>
                  </div>
                  <button
                    onClick={() => restoreProject(p.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors shrink-0"
                  >
                    <RotateCcw size={12} />
                    복구
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showProjectForm && (
        <ProjectForm
          initial={editProject || undefined}
          onSave={handleProjectSave}
          onClose={() => { setShowProjectForm(false); setEditProject(null); }}
        />
      )}
      {showTaskForm && (
        <TaskForm
          projectId={taskProjectId}
          initial={editTask || undefined}
          onSave={handleTaskSave}
          onClose={() => { setShowTaskForm(false); setEditTask(null); }}
        />
      )}

      {/* Confirm dialogs */}
      {confirmComplete && (
        <ConfirmDialog
          title="프로젝트 완료 처리"
          message="이 프로젝트를 완료 처리하시겠습니까? 완료된 프로젝트는 목록에서 숨겨지지만, 언제든지 복구할 수 있습니다."
          confirmLabel="완료 처리"
          confirmClass="bg-green-500 text-white hover:bg-green-600"
          onConfirm={() => doCompleteProject(confirmComplete)}
          onCancel={() => setConfirmComplete(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="프로젝트 삭제"
          message="이 프로젝트와 관련된 모든 할 일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmLabel="삭제"
          confirmClass="bg-red-500 text-white hover:bg-red-600"
          onConfirm={() => doDeleteProject(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmDeleteTask && (
        <ConfirmDialog
          title="할 일 삭제"
          message="이 할 일을 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirmClass="bg-red-500 text-white hover:bg-red-600"
          onConfirm={() => doDeleteTask(confirmDeleteTask)}
          onCancel={() => setConfirmDeleteTask(null)}
        />
      )}
    </div>
  );
}
