// ============================================================
// Recording Modal - 강의 녹음 기능
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, X, Upload, AlertCircle, HelpCircle, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaRecorderErrorEvent extends Event {
  error: string;
}

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    subject: string;
    description: string;
    audioBase64: string;
    duration: number;
  }) => Promise<void>;
  isSaving?: boolean;
}

export default function RecordingModal({ isOpen, onClose, onSave, isSaving = false }: RecordingModalProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      stopRecording();
      setTitle('');
      setSubject('');
      setDescription('');
      setRecordedAudio(null);
      setDuration(0);
      setRecordingTime(0);
      setError('');
      setIsPlaying(false);
      setShowPermissionHelp(false);
      setAudioLevel(0);
    }
  }, [isOpen]);

  // Audio level visualization
  useEffect(() => {
    if (!isRecording || !analyserRef.current) return;

    const visualize = () => {
      if (!analyserRef.current) return;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 255) * 100));
      
      requestAnimationFrame(visualize);
    };

    visualize();
  }, [isRecording]);

  const getPermissionErrorMessage = (err: any): string => {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDismissedError') {
      return '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 접근을 허용해주세요.';
    }
    if (err.name === 'NotFoundError') {
      return '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.';
    }
    if (err.name === 'NotReadableError') {
      return '마이크를 사용할 수 없습니다. 다른 앱에서 마이크를 사용 중일 수 있습니다.';
    }
    if (err.name === 'SecurityError') {
      return 'HTTPS 연결이 필요합니다. 안전한 연결을 사용해주세요.';
    }
    return `마이크 접근 오류: ${err.message || '알 수 없는 오류'}`;
  };

  const startRecording = async () => {
    try {
      setError('');
      setShowPermissionHelp(false);
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('이 브라우저는 음성 녹음을 지원하지 않습니다. Chrome, Firefox, Safari 최신 버전을 사용해주세요.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false, // Disable for better control
          sampleRate: 48000, // Higher sample rate for better quality
        }
      });
      
      // Check if audio tracks exist
      if (stream.getAudioTracks().length === 0) {
        setError('마이크에서 오디오 신호를 감지할 수 없습니다. 마이크를 확인해주세요.');
        return;
      }

      // Use WebM if available, fallback to other formats
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      if (!mimeType) {
        setError('이 브라우저는 지원하는 오디오 형식이 없습니다.');
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup audio context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          setError('녹음 데이터가 없습니다. 다시 시도해주세요.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Verify blob size
        if (audioBlob.size === 0) {
          setError('녹음 파일이 비어있습니다. 다시 시도해주세요.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event: Event) => {
        const errorEvent = event as MediaRecorderErrorEvent;
        setError(`녹음 오류: ${errorEvent.error}`);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms for better reliability
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      const errorMessage = getPermissionErrorMessage(err);
      setError(errorMessage);
      setShowPermissionHelp(err.name === 'NotAllowedError' || err.name === 'PermissionDismissedError');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDuration(recordingTime);
      setAudioLevel(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (!recordedAudio || !audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().catch(err => {
        setError(`재생 오류: ${err.message}`);
      });
      setIsPlaying(true);
    }
  };

  const handleSave = async () => {
    if (!recordedAudio || !title.trim()) {
      setError('제목을 입력하고 녹음을 완료해주세요.');
      return;
    }

    try {
      setError('');
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await onSave({
          title: title.trim(),
          subject: subject.trim(),
          description: description.trim(),
          audioBase64: base64,
          duration,
        });
        onClose();
      };
      reader.onerror = () => {
        setError('파일 읽기 오류가 발생했습니다.');
      };
      reader.readAsDataURL(recordedAudio);
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
      console.error('Save error:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="warm-card w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Mic size={16} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
              강의 녹음
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Recording Controls */}
        <div className="space-y-4 mb-5">
          <div className="flex gap-2">
            {!recordedAudio ? (
              <>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                  >
                    <Mic size={16} />
                    녹음 시작
                  </button>
                ) : (
                  <>
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white font-semibold">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      녹음 중...
                    </div>
                    <button
                      onClick={stopRecording}
                      className="px-4 py-3 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors"
                    >
                      <Square size={16} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={togglePlayback}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? '일시정지' : '재생'}
                </button>
                <button
                  onClick={() => {
                    setRecordedAudio(null);
                    setRecordingTime(0);
                  }}
                  className="px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  다시 녹음
                </button>
              </>
            )}
          </div>

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Volume2 size={14} className="text-amber-600" />
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-amber-500 transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recording Time Display */}
          {(isRecording || recordedAudio) && (
            <div className="text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: 'oklch(0.55 0.15 55)' }}>
                {formatTime(isRecording ? recordingTime : duration)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isRecording ? '녹음 중' : '녹음 완료'}
              </p>
            </div>
          )}

          {/* Hidden audio player */}
          {recordedAudio && (
            <audio
              ref={audioPlayerRef}
              src={URL.createObjectURL(recordedAudio)}
              onEnded={() => setIsPlaying(false)}
              onError={(e) => {
                console.error('Audio playback error:', e);
                setError('재생할 수 없는 파일입니다. 다시 녹음해주세요.');
                setIsPlaying(false);
              }}
              className="hidden"
              crossOrigin="anonymous"
            />
          )}
        </div>

        {/* Form Fields */}
        {recordedAudio && (
          <div className="space-y-3 mb-5 pb-5 border-b border-border">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: 데이터베이스 강의 - 3월 5일"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                과목
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="예: 데이터베이스 개론"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                메모
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="강의 내용에 대한 간단한 메모..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
            {showPermissionHelp && (
              <div className="ml-6 space-y-1.5 text-xs text-red-600">
                <p className="font-semibold flex items-center gap-1">
                  <HelpCircle size={12} />
                  마이크 권한 허용 방법:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>주소창 왼쪽의 자물쇠 아이콘 클릭</li>
                  <li>"마이크" 항목을 "허용"으로 변경</li>
                  <li>페이지 새로고침 후 다시 시도</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            취소
          </button>
          {recordedAudio && (
            <button
              onClick={handleSave}
              disabled={!title.trim() || isSaving}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  저장
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
