import React from 'react';

export const Stamp: React.FC<{ visible: boolean }> = ({ visible }) => {
  return (
    <div
      className={`fixed bottom-8 right-8 z-50 pointer-events-none transition-all duration-300 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className={`relative w-32 h-32 rounded-full border-2 border-gold/60 flex items-center justify-center bg-graphite/80 backdrop-blur-md shadow-[0_0_40px_rgba(198,144,46,0.15)] ${visible ? 'animate-stamp' : ''}`}>
        <div className="absolute inset-2 rounded-full border border-gold/30" />
        <div className="text-center">
          <div className="text-[10px] font-mono text-gold tracking-[0.2em]">ДОБАВЛЕНО</div>
          <div className="text-base font-bold text-gold tracking-[0.15em] mt-0.5">В КОРЗИНУ</div>
          <div className="text-[9px] font-mono text-gold/70 tracking-[0.25em] mt-1.5">↑ КОРЗИНА</div>
        </div>
      </div>
    </div>
  );
};
