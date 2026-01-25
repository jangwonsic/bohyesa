
import React, { useState, useEffect, useRef } from 'react';
import { Chapter, Section, ViewState, FontSize, Bookmark } from './types';
import { chapters } from './data';
import TableOfContents from './components/TableOfContents';
import Reader from './components/Reader';
import CrossDiagram from './components/CrossDiagram';

// 제10장 데이터 정의
const extraChapter: Chapter = {
  id: 'ch10',
  number: 10,
  title: '블로그/카페/유튜브',
  sections: [
    {
      id: 's10-1',
      title: '공식 온라인 채널 안내',
      content: [
        'SOCIAL_LINK:네이버 블로그 바로가기|https://blog.naver.com/seoulbohyesa|보혜사 계시 말씀의 정수가 담긴 공식 블로그입니다.',
        'SOCIAL_LINK:네이버 카페 바로가기|https://cafe.naver.com/boheysa777|성도들간의 교제와 질문 답변이 이루어지는 커뮤니티입니다.(준비중)',
        'SOCIAL_LINK:유튜브 바로가기|https://www.youtube.com/channel/UC8qyiSCP83h-542TqtR5iNQ|말씀 영상을 시청하실 수 있습니다.'
      ]
    }
  ]
};

const allChapters = [...chapters, extraChapter];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('toc');
  const [currentChapter, setCurrentChapter] = useState<Chapter>(allChapters[0]);
  const [currentSection, setCurrentSection] = useState<Section>(allChapters[0].sections[0]);
  const [targetParagraphIdx, setTargetParagraphIdx] = useState<number | null>(null);
  const [lastRead, setLastRead] = useState<{ chapterId: string; sectionId: string } | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [fontSize, setFontSize] = useState<FontSize>('text-lg');
  
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressTime = useRef<number>(0);

  useEffect(() => {
    window.history.replaceState({ view: 'toc' }, '');
    
    const timer = setTimeout(() => {
      if ((window as any).removeSplash) (window as any).removeSplash();
    }, 500);

    const savedBookmarks = localStorage.getItem('heavenly_bookmarks_v3');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    } else {
      // v2 마이그레이션 처리 (기존 데이터가 있다면)
      const v2 = localStorage.getItem('heavenly_bookmarks_v2');
      if (v2) {
        const oldIds: string[] = JSON.parse(v2);
        const migrated = oldIds.map(id => ({ id, memo: '', createdAt: Date.now() }));
        setBookmarks(migrated);
      }
    }
    
    const savedLastRead = localStorage.getItem('heavenly_last_read');
    if (savedLastRead) setLastRead(JSON.parse(savedLastRead));
    
    const savedFontSize = localStorage.getItem('heavenly_font_size');
    if (savedFontSize) setFontSize(savedFontSize as FontSize);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (view === 'reader' || view === 'diagram') {
        setView('toc');
        setTargetParagraphIdx(null);
      } else if (view === 'toc') {
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          window.history.back();
        } else {
          lastBackPressTime.current = now;
          setShowExitToast(true);
          setTimeout(() => setShowExitToast(false), 2000);
          window.history.pushState({ view: 'toc' }, '');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('heavenly_bookmarks_v3', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (lastRead) localStorage.setItem('heavenly_last_read', JSON.stringify(lastRead));
  }, [lastRead]);

  useEffect(() => {
    localStorage.setItem('heavenly_font_size', fontSize);
  }, [fontSize]);

  const handleSaveBookmark = (sectionId: string, index: number, memo: string) => {
    const bookmarkId = `${sectionId}|${index}`;
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === bookmarkId);
      if (exists) {
        return prev.map(b => b.id === bookmarkId ? { ...b, memo } : b);
      }
      return [...prev, { id: bookmarkId, memo, createdAt: Date.now() }];
    });
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  const handleSelectSection = (chapter: Chapter, section: Section, paragraphIndex: number | null = null) => {
    setCurrentChapter(chapter);
    setCurrentSection(section);
    setTargetParagraphIdx(paragraphIndex);
    setView('reader');
    setLastRead({ chapterId: chapter.id, sectionId: section.id });
    window.history.pushState({ view: 'reader' }, '');
  };

  const handleOpenDiagram = () => {
    setView('diagram');
    window.history.pushState({ view: 'diagram' }, '');
  };

  const handleBackToToc = () => {
    window.history.back();
  };

  const handleNextSection = () => {
    const currentChapterIdx = allChapters.findIndex(c => c.id === currentChapter.id);
    const currentSectionIdx = currentChapter.sections.findIndex(s => s.id === currentSection.id);
    if (currentSectionIdx < currentChapter.sections.length - 1) {
      handleSelectSection(currentChapter, currentChapter.sections[currentSectionIdx + 1]);
      return;
    } 
    for (let i = currentChapterIdx + 1; i < allChapters.length; i++) {
      if (allChapters[i].sections.length > 0) {
        handleSelectSection(allChapters[i], allChapters[i].sections[0]);
        return;
      }
    }
  };

  const handlePrevSection = () => {
    const currentChapterIdx = allChapters.findIndex(c => c.id === currentChapter.id);
    const currentSectionIdx = currentChapter.sections.findIndex(s => s.id === currentSection.id);
    if (currentSectionIdx > 0) {
      handleSelectSection(currentChapter, currentChapter.sections[currentSectionIdx - 1]);
      return;
    } 
    for (let i = currentChapterIdx - 1; i >= 0; i--) {
      if (allChapters[i].sections.length > 0) {
        handleSelectSection(allChapters[i], allChapters[i].sections[allChapters[i].sections.length - 1]);
        return;
      }
    }
  };

  const continueReading = () => {
    if (lastRead) {
      const chapter = allChapters.find(c => c.id === lastRead.chapterId);
      const section = chapter?.sections.find(s => s.id === lastRead.sectionId);
      if (chapter && section) {
        handleSelectSection(chapter, section);
        return;
      }
    }
    handleSelectSection(allChapters[0], allChapters[0].sections[0]);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-0 md:p-4 lg:p-6 overflow-hidden">
      <div className="w-full max-w-md md:max-w-3xl h-full md:h-[94vh] bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden flex flex-col relative transition-all duration-500 md:rounded-2xl border border-slate-200/10">
        {view === 'toc' && (
          <TableOfContents 
            chapters={allChapters} 
            onSelect={handleSelectSection} 
            lastRead={lastRead}
            onContinue={continueReading}
            bookmarks={bookmarks}
            onSaveBookmark={handleSaveBookmark}
            onDeleteBookmark={handleDeleteBookmark}
            onOpenDiagram={handleOpenDiagram}
          />
        )}
        {view === 'reader' && (
          <Reader 
            chapter={currentChapter} 
            section={currentSection} 
            targetParagraphIdx={targetParagraphIdx}
            onBack={handleBackToToc}
            onNext={handleNextSection}
            onPrev={handlePrevSection}
            bookmarks={bookmarks}
            onSaveBookmark={handleSaveBookmark}
            onDeleteBookmark={handleDeleteBookmark}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            allChapters={allChapters}
          />
        )}
        {view === 'diagram' && (
          <CrossDiagram onBack={handleBackToToc} />
        )}

        {/* 종료 확인 토스트 */}
        <div 
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 pointer-events-none
            ${showExitToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 px-5 py-2.5 rounded-full text-sm font-medium shadow-2xl backdrop-blur-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            뒤로 가기 버튼을 한번 더 누르시면 종료됩니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
