import React from 'react';

export const Stamp: React.FC<{ visible: boolean }> = ({ visible }) => {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white/90 text-[13px] font-mono tracking-[0.1em]">
        добавлено в корзину )
      </div>
    </div>
  );
};
