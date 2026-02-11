import React from 'react';

export const TeeIntroBlock: React.FC = () => {
  return (
    <section
      id="tee-intro"
      className="relative max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-16"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-graphite-light/60 backdrop-blur-md">
        <div className="absolute inset-0 bg-noise opacity-35 pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 p-6 sm:p-10 lg:p-14 items-center">
          {/* IMAGE */}
          <div className="relative min-h-[340px] sm:min-h-[420px] lg:min-h-[520px]">
            {/* mobile/tablet: по центру */}
            <img
              src="/tee-project.png"
              alt="Voshod tee"
              className="
                absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                w-[92%] sm:w-[80%] lg:w-auto
                max-w-[520px] lg:max-w-none
                h-auto lg:h-[120%]
                object-contain
                drop-shadow-[0_30px_80px_rgba(0,0,0,0.65)]
              "
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/8 to-transparent" />
          </div>

          {/* TEXT */}
          <div className="relative">
            <div className="text-[10px] font-mono tracking-[0.35em] text-gray-500 uppercase">
              DROP / LIMITED
            </div>

            <h3 className="mt-4 text-2xl sm:text-4xl font-light leading-tight">
              Футболка как <span className="text-gold">сигнал</span>.
            </h3>

            <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-400 leading-relaxed">
              Лёгкий силуэт, плотная фактура, правильная посадка. Никакого “крика”.
              Только знак и качество.
            </p>

            <div className="mt-6 sm:mt-10 flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-gray-300 tracking-widest">
                PREMIUM COTTON
              </span>
              <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-gray-300 tracking-widest">
                LIMITED DROP
              </span>
              <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-gray-300 tracking-widest">
                DARK GRAPHITE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
