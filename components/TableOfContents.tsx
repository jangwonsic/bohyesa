
import React, { useState, useRef, useEffect } from 'react';
import { Chapter, Section, Bookmark } from '../types';

interface TableOfContentsProps {
  chapters: Chapter[];
  onSelect: (chapter: Chapter, section: Section, paragraphIndex?: number) => void;
  lastRead: { chapterId: string; sectionId: string } | null;
  onContinue: () => void;
  bookmarks: Bookmark[];
  onSaveBookmark: (sectionId: string, index: number, memo: string) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onOpenDiagram: () => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  chapters, 
  onSelect, 
  lastRead, 
  onContinue, 
  bookmarks,
  onSaveBookmark,
  onDeleteBookmark,
  onOpenDiagram
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks'>('all');
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [editingMemo, setEditingMemo] = useState<{ id: string; memo: string } | null>(null);
  
  const lastReadRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  useEffect(() => {
    if (activeTab === 'all' && lastRead && lastReadRef.current) {
      const timer = setTimeout(() => {
        lastReadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, lastRead]);

  const handleGoBlog = () => window.open('https://blog.naver.com/seoulbohyesa', '_blank');

  const handleShare = async () => {
    const shareData = {
      title: '천국의 비밀 계시',
      text: '인봉된 성경의 비밀을 보혜사의 계시로 밝히 드러내는, 영혼을 위한 진리 애플리케이션입니다.',
      url: window.location.origin + window.location.pathname,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        alert('링크가 클립보드에 복사되었습니다.');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error('공유 실패:', err);
    }
  };

  const getBookmarkData = (bookmark: Bookmark) => {
    const [sectionId, indexStr] = bookmark.id.split('|');
    const index = parseInt(indexStr);
    for (const chapter of chapters) {
      const section = chapter.sections.find(s => s.id === sectionId);
      if (section && section.content[index]) {
        return { chapter, section, text: section.content[index], index };
      }
    }
    return null;
  };

  const handleUpdateMemo = () => {
    if (editingMemo) {
      const [sId, idxStr] = editingMemo.id.split('|');
      onSaveBookmark(sId, parseInt(idxStr), editingMemo.memo);
      setEditingMemo(null);
    }
  };

  const lastReadTitle = lastRead 
    ? chapters.find(c => c.id === lastRead.chapterId)?.sections.find(s => s.id === lastRead.sectionId)?.title
    : (chapters[0]?.sections[0]?.title || "시작하기");

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300 relative">
      <header className="p-4 pt-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white ml-4">천국의비밀계시</h1>
        <div className="flex items-center gap-1.5">
          <button onClick={onOpenDiagram} className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-primary dark:text-blue-400 active:scale-90" title="십자가의 도 보기">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M10.5 2h3v6h6v3h-6v11h-3v-11h-6v-3h6V2z" /></svg>
          </button>
          <button onClick={handleGoBlog} className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-90" title="공식 블로그 가기"><span className="material-symbols-outlined text-[20px]">home</span></button>
          <button onClick={handleShare} className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-90" title="공유하기"><span className="material-symbols-outlined text-[20px]">share</span></button>
          <button onClick={() => setShowGuide(true)} className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-90" title="홈 화면에 추가"><span className="material-symbols-outlined text-[20px]">add_to_home_screen</span></button>
        </div>
      </header>

      {/* 가이드 모달 생략 (동일) */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowGuide(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-primary p-4 text-white font-bold flex items-center gap-2"><span className="material-symbols-outlined">install_mobile</span>홈 화면에 바로가기 추가</div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">이 앱을 스마트폰 홈 화면에 설치하여 언제든 편하게 접속하세요.</p>
              <button onClick={() => setShowGuide(false)} className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition-colors">닫기</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex bg-slate-200 dark:bg-surface-dark p-1 rounded-lg">
          <button onClick={() => setActiveTab('all')} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>전체 목록</button>
          <button onClick={() => setActiveTab('bookmarks')} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1 ${activeTab === 'bookmarks' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
            <span className="material-symbols-outlined text-[16px]">bookmark</span>북마크
            {bookmarks.length > 0 && <span className="bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">{bookmarks.length}</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-28">
        {activeTab === 'all' ? (
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <details key={chapter.id} open={lastRead?.chapterId === chapter.id || (lastRead === null && chapter.number === 0)} className="group bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-primary text-[10px] font-bold uppercase tracking-wider">{chapter.number === 0 ? 'INTRO' : `제${chapter.number}장`}</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{chapter.title}</h2>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="border-t border-slate-100 dark:border-slate-800">
                  <ul className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {chapter.sections.map((section) => {
                      const isCurrent = lastRead?.sectionId === section.id;
                      return (
                        <li key={section.id} ref={isCurrent ? lastReadRef : null}>
                          <button onClick={() => onSelect(chapter, section)} className="w-full text-left px-5 py-4 text-base font-medium text-slate-700 dark:text-slate-50 hover:bg-primary/5 transition-all flex items-center justify-between">
                            <span className={isCurrent ? 'font-bold text-primary dark:text-blue-400' : ''}>{section.title}</span>
                            {isCurrent ? <span className="material-symbols-outlined text-[20px] text-primary dark:text-blue-400">menu_book</span> : <span className="material-symbols-outlined text-[20px] opacity-40 text-slate-400 dark:text-slate-200">chevron_right</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.length > 0 ? (
              [...bookmarks].sort((a, b) => b.createdAt - a.createdAt).map((bookmark) => {
                const data = getBookmarkData(bookmark);
                if (!data) return null;
                return (
                  <div key={bookmark.id} className="bg-white dark:bg-surface-dark border border-amber-100 dark:border-amber-900/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-50 dark:border-amber-900/20">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase">
                        {data.chapter.number === 0 ? 'INTRO' : `제${data.chapter.number}장`} • {data.section.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingMemo({ id: bookmark.id, memo: bookmark.memo })} className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit_note</span></button>
                        <button onClick={() => onDeleteBookmark(bookmark.id)} className="text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </div>
                    <div className="p-4 text-left space-y-3">
                      <button onClick={() => onSelect(data.chapter, data.section, data.index)} className="w-full text-left group">
                        <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-3 leading-relaxed italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                          "{data.text.startsWith('*') ? data.text.substring(2) : data.text}"
                        </p>
                      </button>
                      {bookmark.memo && (
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100/50 dark:border-blue-900/20">
                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[10px] font-bold mb-1 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px]">sticky_note_2</span>
                            나의 메모
                          </div>
                          <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{bookmark.memo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                <span className="material-symbols-outlined text-[48px] opacity-20">bookmark_border</span>
                <p className="text-sm">북마크한 문장이 없습니다.</p>
                <p className="text-xs opacity-60">본문에서 문장을 길게 누르면 북마크/메모가 가능합니다.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 메모 수정 모달 */}
      {editingMemo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingMemo(null)}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-primary text-white">
              <div className="flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined">edit_note</span>
                <span>메모 수정</span>
              </div>
              <button onClick={() => setEditingMemo(null)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-5">
              <textarea 
                autoFocus
                className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                value={editingMemo.memo}
                onChange={e => setEditingMemo({ ...editingMemo, memo: e.target.value })}
              />
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditingMemo(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl active:scale-95 transition-all">취소</button>
                <button onClick={handleUpdateMemo} className="flex-2 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all px-8">수정 완료</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent pt-10 pointer-events-none flex justify-center">
        <button onClick={onContinue} className="pointer-events-auto w-full max-w-[480px] h-14 bg-[#0d47a1] hover:bg-[#0a3a85] active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="truncate text-sm sm:text-base px-2">이어보기: {lastReadTitle}</span>
        </button>
      </div>
    </div>
  );
};

export default TableOfContents;
