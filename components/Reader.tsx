
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chapter, Section, FontSize, Bookmark } from '../types';

/**
 * 섹션별 오디오 파일 매핑
 * [중요] 파일은 public/audio/ 폴더 안에 있어야 합니다.
 */
const AUDIO_MAPPING: Record<string, string> = {
  's0-1': 'audio/s0-1.mp3', 
  's0-2': 'audio/s0-2.mp3',
  's0-3': 'audio/s0-3.mp3',
  's0-4': 'audio/s0-4.mp3',
};

interface ReaderProps {
  chapter: Chapter;
  section: Section;
  targetParagraphIdx: number | null;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
  bookmarks: Bookmark[];
  onSaveBookmark: (sectionId: string, index: number, memo: string) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  allChapters: Chapter[];
}

const Reader: React.FC<ReaderProps> = ({ 
  chapter, 
  section, 
  targetParagraphIdx,
  onBack, 
  onNext, 
  onPrev,
  bookmarks,
  onSaveBookmark,
  onDeleteBookmark,
  fontSize,
  onFontSizeChange,
  allChapters
}) => {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [memoModal, setMemoModal] = useState<{ isOpen: boolean; index: number; initialMemo: string } | null>(null);
  const [tempMemo, setTempMemo] = useState("");
  
  // 오디오 관련 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollContainerRef = useRef<HTMLElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const [pressingIdx, setPressingIdx] = useState<number | null>(null);
  const touchStartPos = useRef<{ x: number, y: number } | null>(null);

  // 현재 섹션에 할당된 오디오 경로
  const audioUrl = useMemo(() => {
    const path = AUDIO_MAPPING[section.id];
    return path ? `./${path}` : null;
  }, [section.id]);

  const progressPercent = useMemo(() => {
    const list = allChapters.flatMap(c => c.sections);
    const totalCount = list.length;
    if (totalCount === 0) return 0;
    const currentIndex = list.findIndex(s => s.id === section.id);
    return Math.max(5, ((currentIndex + 1) / totalCount) * 100);
  }, [section.id, allChapters]);

  // 섹션 변경 시 오디오 초기화
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
    if (!audioUrl) {
      setShowPlayer(false);
    }
  }, [section.id, audioUrl]);

  useEffect(() => {
    if (targetParagraphIdx !== null) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`para-${targetParagraphIdx}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [section.id, targetParagraphIdx]);

  const playAudio = async () => {
    if (!audioRef.current || !audioUrl) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Playback failed:", err);
      alert(`오디오를 재생할 수 없습니다.\n파일 경로: ${audioUrl}\n\n서버에 해당 파일이 실제로 존재하는지 확인해주세요.`);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudio();
    }
  };

  const handleTopListenClick = () => {
    if (!audioUrl) return;
    setShowPlayer(true);
    setTimeout(() => playAudio(), 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + amount));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    if (chapter.number === 10) return;
    if ('touches' in e) {
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      touchStartPos.current = { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    }
    setPressingIdx(index);
    longPressTimer.current = window.setTimeout(() => {
      const bookmarkId = `${section.id}|${index}`;
      const existing = bookmarks.find(b => b.id === bookmarkId);
      if (existing) onDeleteBookmark(bookmarkId);
      else {
        setMemoModal({ isOpen: true, index, initialMemo: "" });
        setTempMemo("");
      }
      setPressingIdx(null);
      if (navigator.vibrate) navigator.vibrate(40);
    }, 800);
  };

  const handlePressMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!touchStartPos.current || !longPressTimer.current) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const currentY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const dx = Math.abs(currentX - touchStartPos.current.x);
    const dy = Math.abs(currentY - touchStartPos.current.y);
    if (dx > 8 || dy > 8) cancelPress();
  };

  const cancelPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressingIdx(null);
    touchStartPos.current = null;
  };

  const handleSaveMemo = () => {
    if (memoModal) {
      onSaveBookmark(section.id, memoModal.index, tempMemo);
      setMemoModal(null);
    }
  };

  const renderParagraphContent = (para: string, idx: number) => {
    if (para.startsWith('SOCIAL_LINK:')) {
      const [_, data] = para.split('SOCIAL_LINK:');
      const [name, url, desc] = data.split('|');
      let icon = 'link';
      let colorClass = 'bg-primary text-white';
      if (name.includes('네이버')) {
        icon = name.includes('카페') ? 'groups' : 'book';
        colorClass = 'bg-[#03C75A] text-white';
      } else if (name.includes('유튜브')) {
        icon = 'play_circle';
        colorClass = 'bg-[#FF0000] text-white';
      }
      return (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 mb-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 active:scale-[0.97] transition-all hover:border-primary/30"
        >
          <div className={`${colorClass} w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
            <span className="material-symbols-outlined text-[32px]">{icon}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight mb-1">{name}</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">{desc}</p>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-40">
            <span className="material-symbols-outlined text-[20px] text-slate-400">open_in_new</span>
            <span className="text-[9px] font-bold">GO</span>
          </div>
        </a>
      );
    }

    const startsWithStar = para.startsWith('*');
    const textToProcess = startsWithStar ? para.substring(2) : para;
    const parts = textToProcess.split(/(##.*?##)/g);
    return (
      <span className="flex items-start">
        {startsWithStar && <span className="text-sky-500 dark:text-sky-400 font-bold mr-1.5 mt-0.5 flex-shrink-0">*</span>}
        <span className="flex-1">
          {parts.map((part, i) => {
            if (part.startsWith('##') && part.endsWith('##')) return <span key={i} className="text-sky-500 dark:text-sky-400 font-bold">{part.slice(2, -2)}</span>;
            return part;
          })}
        </span>
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300 overflow-hidden select-none relative">
      {/* 실제 오디오 엔진 */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          preload="auto"
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col items-center flex-1 mx-2 overflow-hidden">
            <h1 className="text-[11px] font-bold text-primary dark:text-blue-400 leading-tight truncate w-full text-center">
              {chapter.number === 0 ? '' : `제${chapter.number}장 `}{chapter.title}
            </h1>
            <span className="text-[11px] text-slate-700 dark:text-slate-200 font-bold tracking-tight truncate w-full text-center">{section.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowFontMenu(!showFontMenu)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${showFontMenu ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              <span className="material-symbols-outlined text-[24px]">text_fields</span>
            </button>
          </div>
        </div>
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-primary transition-all duration-700 ease-in-out" style={{ width: `${progressPercent}%` }} />
        </div>
        {showFontMenu && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-surface-dark shadow-xl border-b border-slate-200 dark:border-slate-800 p-4 animate-slide-up z-50">
            <div className="flex items-center justify-between gap-2">
              {[
                { label: '작게', value: 'text-base' },
                { label: '보통', value: 'text-lg' },
                { label: '크게', value: 'text-xl' },
                { label: '최대', value: 'text-2xl' }
              ].map((opt) => (
                <button key={opt.value} onClick={() => onFontSizeChange(opt.value as FontSize)} className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${fontSize === opt.value ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}>
                  <span className="material-symbols-outlined">text_fields</span>
                  <span className="text-[10px] font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main ref={scrollContainerRef} className={`flex-1 overflow-y-auto no-scrollbar px-6 py-8 transition-all duration-300 ${showPlayer ? 'pb-48' : 'pb-32'}`} onClick={() => setShowFontMenu(false)}>
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {section.title.split('. ')[1] || section.title}
            </h2>
            {audioUrl && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleTopListenClick(); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 text-white shadow-md active:scale-95 transition-all group"
              >
                <span className="material-symbols-outlined text-[18px]">volume_up</span>
                <span className="text-[12px] font-bold">듣기</span>
              </button>
            )}
          </div>
          <div className="w-10 h-1 bg-primary/40 mx-auto rounded-full"></div>
        </div>
        <div className="space-y-4">
          {section.content.map((para, idx) => {
            const bookmarkId = `${section.id}|${idx}`;
            const isBookmarked = bookmarks.some(b => b.id === bookmarkId);
            const isPressing = pressingIdx === idx;
            
            return (
              <div key={idx} id={`para-${idx}`}
                onMouseDown={(e) => handlePressStart(e, idx)} onMouseMove={handlePressMove} onMouseUp={cancelPress} onMouseLeave={cancelPress}
                onTouchStart={(e) => handlePressStart(e, idx)} onTouchMove={handlePressMove} onTouchEnd={cancelPress}
                onContextMenu={(e) => e.preventDefault()}
                className={`${para.startsWith('SOCIAL_LINK:') ? "" : `${fontSize} leading-[1.8] text-slate-800 dark:text-slate-200 break-keep transition-all duration-200 rounded-lg py-1 px-2 -mx-2 relative cursor-pointer
                  ${isBookmarked ? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 shadow-sm' : ''}
                  ${isPressing ? 'bg-primary/10 scale-[1.01]' : ''}
                  ${para === '예수 그리스도의 대언자' ? 'text-center font-bold mt-10 mb-6 border-y border-slate-100 py-4 dark:border-slate-800' : ''}`}`}
              >
                {renderParagraphContent(para, idx)}
                {isBookmarked && <span className="absolute -right-1 -top-1 material-symbols-outlined text-[16px] text-amber-500 fill-[1]">bookmark</span>}
              </div>
            );
          })}
        </div>
      </main>

      {/* 오디오 플레이어 컨트롤러 */}
      {showPlayer && audioUrl && (
        <div className="absolute bottom-[100px] left-4 right-4 z-50 animate-slide-up">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-4 rounded-3xl shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest leading-none mb-1">Playing Audio</span>
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate max-w-[180px]">{section.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] font-mono font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                <button onClick={() => setShowPlayer(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button onClick={() => skipTime(-10)} className="w-9 h-9 flex items-center justify-center text-slate-400 active:text-primary active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-[24px]">replay_10</span>
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined text-[28px]">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <button onClick={() => skipTime(10)} className="w-9 h-9 flex items-center justify-center text-slate-400 active:text-primary active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-[24px]">forward_10</span>
                </button>
              </div>

              <div className="flex-1 px-2 flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 0} 
                  value={currentTime} 
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메모 모달 */}
      {memoModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setMemoModal(null)}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary font-black"><span className="material-symbols-outlined">edit_note</span>메모 작성</div>
              <button onClick={() => setMemoModal(null)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6">
              <textarea autoFocus className="w-full h-32 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-slate-800 dark:text-slate-200" placeholder="이 구절에 대한 묵상을 남겨보세요..." value={tempMemo} onChange={e => setTempMemo(e.target.value)} />
              <button onClick={handleSaveMemo} className="w-full mt-4 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all">저장하기</button>
            </div>
          </div>
        </div>
      )}

      <nav className="absolute bottom-0 left-0 right-0 p-4 pb-8 pointer-events-none z-30">
        <div className="max-w-md mx-auto flex items-center justify-between pointer-events-auto">
          <button onClick={onPrev} className="flex items-center gap-2 pl-2 pr-4 py-3 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 active:scale-90 transition-all">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-primary"><span className="material-symbols-outlined text-[20px]">arrow_back</span></div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">이전</span>
          </button>
          <button onClick={onBack} className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-4 border-white dark:border-slate-800 shadow-xl active:scale-90 transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">list</span>
          </button>
          <button onClick={onNext} className="flex items-center gap-2 pl-4 pr-2 py-3 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 active:scale-90 transition-all">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">다음</span>
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-primary"><span className="material-symbols-outlined text-[20px]">arrow_forward</span></div>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Reader;
