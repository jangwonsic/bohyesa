
import React from 'react';

interface CrossDiagramProps {
  onBack: () => void;
}

const CrossDiagram: React.FC<CrossDiagramProps> = ({ onBack }) => {
  const leftVerses = [
    { ref: "히12:9", text: '"모든 영의 하나님"' },
    { ref: "요17:3", text: '"참 하나님"' },
    { ref: "롬5:17", text: '"생명의 왕"' },
    { ref: "고전15:45", text: '"마지막 아담은 살려 주는 영"' },
    { ref: "고전15:46", text: '"그 다음은 신령한 자니라"' },
    { ref: "고전15:47", text: '"둘째 사람은 하늘에서 나셨느니라"' },
    { ref: "고전15:22", text: '"그리스도 안에서 모든 사람이 삶"' },
    { ref: "갈5:17", text: '"성령의 소욕"' },
    { ref: "고전15:49", text: '"또한 하늘에 속한 자의 형상"' },
    { ref: "고전15:40", text: '"하늘에 영광"' },
    { ref: "마10:28", text: '"오직 몸과 영혼을 능히 멸하시는 자를 두려워 하라"' },
    { ref: "마23:9", text: '"너희 아버지는 하늘에 계신 자니라"' },
    { ref: "잠3:16", text: '"그 우편 손에는 장수(영생)"' },
    { ref: "전10:2", text: '"지혜자의 마음은 오른편에"' },
    { ref: "마25:46", text: '"의인(양)들은 영생에"' },
  ];

  const rightVerses = [
    { ref: "민16:22", text: '"육체의 생명 하나님"' },
    { ref: "갈4:8", text: '"본질상 하나님이 아닌자"' },
    { ref: "롬5:17", text: '"사망의 왕"' },
    { ref: "고전15:45", text: '"첫사람 아담은 산영"' },
    { ref: "고전15:46", text: '"먼저는 신령한 자가 아니요 육있는 자"' },
    { ref: "고전15:47", text: '"첫사람은 땅에서 났으니 흙에 속한자"' },
    { ref: "고전15:22", text: '"아담 안에서 모든 사람이 죽음"' },
    { ref: "갈5:17", text: '"육체의 소욕"' },
    { ref: "고전15:49", text: '"우리가 흙에 속한 자의 형상"' },
    { ref: "고전15:40", text: '"땅에 영광"' },
    { ref: "마10:28", text: '"몸은 죽어도 영혼은 능히 죽이지 못하는 자"' },
    { ref: "마23:9", text: '"땅에 있는 자를 아비라 하지 말고"' },
    { ref: "잠3:16", text: '"그 좌편 손에는 부귀(물질)"' },
    { ref: "전10:2", text: '"우메자의 마음은 왼편에"' },
    { ref: "마25:46", text: '"저희(염소)는 영벌에"' },
  ];

  return (
    <div className="flex flex-col h-full bg-white transition-colors duration-300 overflow-hidden select-none">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-14 flex items-center px-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center pr-10">십자가의 도</h1>
      </header>

      <main className="flex-1 overflow-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="grid grid-cols-[1fr_80px_1fr] relative">
            
            {/* 1st Row: Top Titles & Cross Head (Added Top Segment) */}
            <div className="text-center self-end pb-4 px-2">
              <div className="text-[14px] font-bold text-blue-800 tracking-tighter">(우)</div>
              <div className="text-sm font-black text-slate-800 whitespace-nowrap">하늘의 주인</div>
            </div>
            <div className="bg-[#0d47a1] h-20 w-full rounded-t-lg shadow-inner flex items-center justify-center">
              {/* 십자가 상단 기둥 (텍스트 없음) */}
            </div>
            <div className="text-center self-end pb-4 px-2">
              <div className="text-[14px] font-bold text-red-800 tracking-tighter">(좌)</div>
              <div className="text-sm font-black text-slate-800 whitespace-nowrap">땅의 주인</div>
            </div>

            {/* 2nd Row: Cross Horizontal Bar (예수 - 보 - 아담) */}
            <div className="bg-[#0d47a1] flex items-center justify-center py-6 rounded-l-lg shadow-inner">
               <span className="text-white text-3xl font-black tracking-widest pl-2">예수</span>
            </div>
            <div className="bg-[#0d47a1] flex items-center justify-center relative border-y border-white/5">
               <span className="text-white text-4xl font-black">보</span>
            </div>
            <div className="bg-[#0d47a1] flex items-center justify-center py-6 rounded-r-lg shadow-inner">
               <span className="text-white text-3xl font-black tracking-widest pl-2">아담</span>
            </div>

            {/* 3rd Row: Body Content & Vertical Bar (혜, 사) */}
            {/* LEFT SIDE: 진리의 사랑 */}
            <div className="pt-6 px-1">
              <div className="text-center font-black text-base mb-6 text-blue-800 border-b-2 border-blue-800 pb-1 mx-2">진리의 사랑</div>
              <div className="space-y-4">
                {leftVerses.map((v, i) => (
                  <div key={i} className="flex flex-col text-[10px] leading-tight mb-3">
                    <span className="font-black text-blue-900 mb-0.5">{v.ref}</span>
                    <span className="text-slate-800 font-bold">{v.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER VERTICAL BAR (CONTINUOUS CROSS SHAPE) */}
            <div className="bg-[#0d47a1] flex flex-col items-center text-white font-black rounded-b-lg shadow-lg" style={{ minHeight: '800px' }}>
               <div className="flex flex-col items-center gap-[240px] pt-24">
                  <span className="text-4xl drop-shadow-md">혜</span>
                  <span className="text-4xl drop-shadow-md">사</span>
               </div>
            </div>

            {/* RIGHT SIDE: 율법의 진노 */}
            <div className="pt-6 px-1">
              <div className="text-center font-black text-base mb-6 text-red-800 border-b-2 border-red-800 pb-1 mx-2">율법의 진노</div>
              <div className="space-y-4">
                {rightVerses.map((v, i) => (
                  <div key={i} className="flex flex-col text-[10px] leading-tight mb-3">
                    <span className="font-black text-red-900 mb-0.5">{v.ref}</span>
                    <span className="text-slate-800 font-bold">{v.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4th Row: Bottom Labels (생 명 / 사 망) */}
            <div className="text-center pt-12">
              <div className="inline-block bg-[#0d47a1] text-white py-3 px-5 rounded-xl shadow-lg border border-white/20 active:scale-95 transition-transform">
                <span className="text-xl font-black tracking-[0.4em] ml-[0.4em]">생명</span>
              </div>
            </div>
            
            <div></div>
            
            <div className="text-center pt-12">
              <div className="inline-block bg-[#b71c1c] text-white py-3 px-5 rounded-xl shadow-lg border border-white/20 active:scale-95 transition-transform">
                <span className="text-xl font-black tracking-[0.4em] ml-[0.4em]">사망</span>
              </div>
            </div>
          </div>
          
          <div className="h-24"></div>
        </div>
      </main>
    </div>
  );
};

export default CrossDiagram;
