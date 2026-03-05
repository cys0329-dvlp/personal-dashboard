import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, Mic, Calendar } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { cn } from '@/lib/utils';
import { formatDisplayDate, today } from '@/lib/utils';
import RecordingModal from '@/components/RecordingModal';
import RecordingUploadModal from '@/components/RecordingUploadModal';

interface Lecture {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
}

interface Recording {
  id: string;
  lectureId: string;
  title: string;
  recordedDate: string;
  duration: number;
  audioData: string;
  createdAt: string;
}

// ---- Lecture Form Modal ----
interface LectureFormProps {
  initial?: Lecture;
  onSave: (data: Omit<Lecture, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function LectureForm({ initial, onSave, onClose }: LectureFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [color, setColor] = useState(initial?.color || '#3B82F6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), color });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="warm-card w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
            {initial ? '강의 수정' : '강의 추가'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">강의명 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: AI 리터러시, 데이터 분석"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="강의에 대한 설명을 입력하세요"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">색상</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">{color}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {initial ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Lecture Card ----
interface LectureCardProps {
  lecture: Lecture;
  recordings: Recording[];
  onEdit: (lecture: Lecture) => void;
  onDelete: (id: string) => void;
  onAddRecording: (lectureId: string) => void;
  onDeleteRecording: (id: string) => void;
}

function LectureCard({ lecture, recordings, onEdit, onDelete, onAddRecording, onDeleteRecording }: LectureCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="warm-card overflow-hidden" style={{ borderLeft: `4px solid ${lecture.color || '#3B82F6'}` }}>
      {/* Lecture header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-0.5 p-1 rounded hover:bg-black/5 transition-colors shrink-0"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base" style={{ color: 'oklch(0.22 0.04 50)' }}>
              {lecture.name}
            </h3>
            {lecture.description && (
              <p className="text-sm text-muted-foreground mt-1">{lecture.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              녹음 {recordings.length}개
            </p>
          </div>

          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(lecture)}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              <Pencil size={14} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => onDelete(lecture.id)}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Recordings section */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-black/5 space-y-2">
          {recordings.length === 0 ? (
            <button
              onClick={() => onAddRecording(lecture.id)}
              className="w-full py-2.5 rounded-lg border border-dashed border-black/20 text-sm text-muted-foreground hover:bg-black/2 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> 녹음 추가
            </button>
          ) : (
            <>
              {recordings.map((recording) => (
                <div key={recording.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-black/2 transition-colors group">
                  <Mic size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{recording.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDisplayDate(recording.recordedDate)} • {Math.round(recording.duration / 60)}분
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteRecording(recording.id)}
                    className="p-1 rounded hover:bg-black/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => onAddRecording(lecture.id)}
                className="w-full py-1.5 rounded-lg border border-dashed border-black/20 text-xs text-muted-foreground hover:bg-black/2 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={12} /> 녹음 추가
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Main Page ----
export default function LecturesPage() {
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLectureId, setUploadLectureId] = useState<string | null>(null);
  const [recordingLectureId, setRecordingLectureId] = useState<string | null>(null);

  // 로컬스토리지에서 강의와 녹음 데이터 로드
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    const saved = localStorage.getItem('lectures');
    return saved ? JSON.parse(saved) : [];
  });

  const [recordings, setRecordings] = useState<Recording[]>(() => {
    const saved = localStorage.getItem('recordings');
    return saved ? JSON.parse(saved) : [];
  });

  // 저장
  const saveLectures = (data: Lecture[]) => {
    localStorage.setItem('lectures', JSON.stringify(data));
    setLectures(data);
  };

  const saveRecordings = (data: Recording[]) => {
    localStorage.setItem('recordings', JSON.stringify(data));
    setRecordings(data);
  };

  const handleAddLecture = (data: Omit<Lecture, 'id' | 'createdAt'>) => {
    const newLecture: Lecture = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    saveLectures([...lectures, newLecture]);
    setShowLectureForm(false);
  };

  const handleEditLecture = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setShowLectureForm(true);
  };

  const handleUpdateLecture = (data: Omit<Lecture, 'id' | 'createdAt'>) => {
    if (editingLecture) {
      saveLectures(
        lectures.map((l) =>
          l.id === editingLecture.id ? { ...l, ...data } : l
        )
      );
      setEditingLecture(null);
      setShowLectureForm(false);
    }
  };

  const handleDeleteLecture = (id: string) => {
    if (confirm('이 강의를 삭제하시겠습니까?')) {
      saveLectures(lectures.filter((l) => l.id !== id));
      saveRecordings(recordings.filter((r) => r.lectureId !== id));
    }
  };

  const handleAddRecording = (lectureId: string) => {
    setUploadLectureId(lectureId);
    setShowUploadModal(true);
  };

  const handleSaveRecording = async (data: { title: string; audioData: string; duration: number }) => {
    const lectureId = uploadLectureId || recordingLectureId;
    if (lectureId) {
      const newRecording: Recording = {
        id: Date.now().toString(),
        lectureId,
        title: data.title,
        recordedDate: today(),
        duration: data.duration,
        audioData: data.audioData,
        createdAt: new Date().toISOString(),
      };
      saveRecordings([...recordings, newRecording]);
      setShowRecordingModal(false);
      setRecordingLectureId(null);
      setShowUploadModal(false);
      setUploadLectureId(null);
    }
  };

  const handleDeleteRecording = (id: string) => {
    if (confirm('이 녹음을 삭제하시겠습니까?')) {
      saveRecordings(recordings.filter((r) => r.id !== id));
    }
  };

  const lectureRecordings = (lectureId: string) =>
    recordings.filter((r) => r.lectureId === lectureId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
          강의 관리
        </h1>
        <button
          onClick={() => {
            setEditingLecture(null);
            setShowLectureForm(true);
          }}
          className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={18} /> 강의 추가
        </button>
      </div>

      {/* Lectures */}
      <div className="space-y-3">
        {lectures.length === 0 ? (
          <div className="warm-card p-8 text-center text-muted-foreground">
            <p>등록된 강의가 없습니다.</p>
          </div>
        ) : (
          lectures.map((lecture) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              recordings={lectureRecordings(lecture.id)}
              onEdit={handleEditLecture}
              onDelete={handleDeleteLecture}
              onAddRecording={handleAddRecording}
              onDeleteRecording={handleDeleteRecording}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showLectureForm && (
        editingLecture ? (
          <LectureForm
            initial={editingLecture}
            onSave={handleUpdateLecture}
            onClose={() => {
              setShowLectureForm(false);
              setEditingLecture(null);
            }}
          />
        ) : (
          <LectureForm
            onSave={handleAddLecture}
            onClose={() => setShowLectureForm(false)}
          />
        )
      )}

      {showUploadModal && uploadLectureId && (
        <RecordingUploadModal
          lectureId={uploadLectureId}
          onSave={handleSaveRecording}
          onClose={() => {
            setShowUploadModal(false);
            setUploadLectureId(null);
          }}
        />
      )}
    </div>
  );
}
