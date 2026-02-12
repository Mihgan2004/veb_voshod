function Hero() {
  return (
    <section className="relative min-h-[92vh] bg-[#070A0E] text-white overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover opacity-35"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/flower.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#070A0E]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] tracking-[0.3em] uppercase text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C6902E]" />
            Project VOSKHOD
          </div>

          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight">
            Премиальный
            <span className="block text-white/80">технический мерч</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-white/65 leading-relaxed">
            Материалы. Посадка. Деталь. Лимитированные дропы и база.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
export { Hero };
