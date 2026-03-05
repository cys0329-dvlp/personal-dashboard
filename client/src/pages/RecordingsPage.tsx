// ============================================================
// Recordings Page - 강의 녹음 목록 및 관리
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

import { useState, useRef } from 'react';
import { Plus, Play, Pause, Download, Trash2, AlertTriangle, Volume2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import RecordingModal from '@/components/RecordingModal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
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
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecordingsPage() {
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const audioPlayersRef = useRef<{ [key: number]: HTMLAudioElement }>({});

  const { data: recordings = [], isLoading, refetch } = trpc.recordings.list.useQuery();
  const createMutation = trpc.recordings.create.useMutation();
  const deleteMutation = trpc.recordings.delete.useMutation();

  const handleCreateRecording = async (data: {
    title: string;
    subject: string;
    description: string;
    audioBase64: string;
    duration: number;
  }) => {
    try {
      await createMutation.mutateAsync(data);
      refetch();
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteConfirmId });
      refetch();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  };

  const togglePlayback = (recordingId: number, audioUrl: string) => {
    setPlaybackError(null);

    // Stop all other players
    Object.entries(audioPlayersRef.current).forEach(([id, player]) => {
      if (parseInt(id) !== recordingId) {
        player.pause();
      }
    });

    if (playingId === recordingId) {
      // Stop current playback
      const player = audioPlayersRef.current[recordingId];
      if (player) {
        player.pause();
      }
      setPlayingId(null);
    } else {
      // Start playback
      let player = audioPlayersRef.current[recordingId];
      if (!player) {
        player = new Audio();
        player.crossOrigin = 'anonymous';
        player.onended = () => setPlayingId(null);
        player.onerror = (e) => {
          console.error('Audio playback error:', e);
          setPlaybackError(`재생 오류: ${audioUrl}`);
          setPlayingId(null);
        };
        audioPlayersRef.current[recordingId] = player;
      }
      
      // Set source and play
      player.src = audioUrl;
      player.play().catch(err => {
        console.error('Failed to play audio:', err);
        setPlaybackError(`재생 실패: ${err.message}`);
        setPlayingId(null);
      });
      setPlayingId(recordingId);
    }
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '-';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}시간 ${mins}분`;
    }
    return `${mins}분 ${secs}초`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
            강의 녹음
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {recordings.length}개의 녹음 저장됨
          </p>
        </div>
        <button
          onClick={() => setShowRecordingModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          새 녹음
        </button>
      </div>

      {/* Playback Error */}
      {playbackError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-700 font-semibold">재생 오류</p>
            <p className="text-xs text-red-600 mt-0.5">{playbackError}</p>
          </div>
        </div>
      )}

      {/* Recordings List */}
      {isLoading ? (
        <div className="warm-card p-8 text-center">
          <div className="inline-block w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground mt-3">로딩 중...</p>
        </div>
      ) : recordings.length === 0 ? (
        <div className="warm-card p-12 text-center">
          <div className="text-4xl mb-3">🎙️</div>
          <p className="font-semibold text-lg mb-1">녹음이 없습니다</p>
          <p className="text-sm text-muted-foreground mb-4">강의를 녹음하고 나중에 복습해보세요</p>
          <button
            onClick={() => setShowRecordingModal(true)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            첫 녹음 시작
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((recording) => (
            <div key={recording.id} className="warm-card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Play Button */}
                <button
                  onClick={() => togglePlayback(recording.id, recording.audioUrl)}
                  className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  title={playingId === recording.id ? '일시정지' : '재생'}
                >
                  {playingId === recording.id ? (
                    <Pause size={20} className="text-primary" />
                  ) : (
                    <Play size={20} className="text-primary" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-base" style={{ color: 'oklch(0.22 0.04 50)' }}>
                      {recording.title}
                    </h3>
                  </div>

                  {recording.subject && (
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {recording.subject}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
                    <span>{formatDate(recording.recordedAt)}</span>
                    <span>·</span>
                    <span>{formatDuration(recording.duration)}</span>
                  </div>

                  {recording.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {recording.description}
                    </p>
                  )}

                  {/* Playback Status */}
                  {playingId === recording.id && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                      <Volume2 size={12} />
                      <span>재생 중...</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <a
                    href={recording.audioUrl}
                    download={`${recording.title}.webm`}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    title="다운로드"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => setDeleteConfirmId(recording.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId !== null && (
        <ConfirmDialog
          title="녹음 삭제"
          message="이 녹음을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
