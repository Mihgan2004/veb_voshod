"use client";

import React, { useMemo } from "react";
import { PHASE, smoothstep } from "./earthScrollConfig";

const R01 = "/voshod-map/contours/01-russia-outline.svg";
const R02 = "/voshod-map/contours/02-russia-with-moscow-oblast-marker.svg";
const M03 = "/voshod-map/contours/03-moscow-oblast-outline.svg";
const M04 = "/voshod-map/contours/04-moscow-oblast-with-solnechnogorsk-marker.svg";
const S05 = "/voshod-map/contours/05-solnechnogorsk-outline.svg";

function crossfadeOpacity(
  progress: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number
) {
  const a = smoothstep(fadeInStart, fadeInEnd, progress);
  const b = 1 - smoothstep(fadeOutStart, fadeOutEnd, progress);
  return Math.max(0, Math.min(1, a * b));
}

export function VoshodGeoOverlay({ progress, isMobile }: { progress: number; isMobile: boolean }) {
  const layers = useMemo(() => {
    const p = progress;
    const r01 = crossfadeOpacity(p, PHASE.earthDimHudRussia[0], PHASE.earthDimHudRussia[0] + 0.04, 0.66, 0.73);
    const r02 = crossfadeOpacity(p, PHASE.russiaMarker[0], PHASE.russiaMarker[0] + 0.035, 0.74, 0.8);
    const m03 = crossfadeOpacity(p, PHASE.moscowTransition[0], PHASE.moscowTransition[0] + 0.04, 0.82, 0.87);
    const m04 = crossfadeOpacity(p, PHASE.moscowSolMarker[0] - 0.015, PHASE.moscowSolMarker[0] + 0.04, 0.89, 0.925);
    const s05 = Math.max(0, Math.min(1, smoothstep(0.88, 0.915, p)));
    const finalUi = smoothstep(PHASE.solCallout[0] + 0.02, PHASE.finalCta[0], p);
    const calloutGraphics = smoothstep(PHASE.solCallout[0], PHASE.solCallout[0] + 0.045, p);
    return { r01, r02, m03, m04, s05, finalUi, calloutGraphics };
  }, [progress]);

  if (progress < PHASE.earthDimHudRussia[0]) {
    return <div className="voshod-geo-overlay" aria-hidden />;
  }

  return (
    <div className={`voshod-geo-overlay ${isMobile ? "voshod-geo-overlay--mobile" : ""}`}>
      <div
        className="voshod-geo-layer voshod-geo-layer--russia"
        style={{ opacity: layers.r01 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={R01} alt="" aria-hidden />
      </div>

      <div
        className="voshod-geo-layer voshod-geo-layer--russia"
        style={{ opacity: layers.r02 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={R02} alt="" aria-hidden />
      </div>

      <div
        className="voshod-geo-layer voshod-geo-layer--moscow"
        style={{ opacity: layers.m03 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={M03} alt="" aria-hidden />
      </div>

      <div
        className="voshod-geo-layer voshod-geo-layer--moscow"
        style={{ opacity: layers.m04 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={M04} alt="" aria-hidden />
      </div>

      <div
        className="voshod-geo-layer voshod-geo-layer--solnechnogorsk"
        style={{ opacity: layers.s05 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={S05} alt="" aria-hidden />
      </div>

      <div className="earth-scroll-final-ui" style={{ opacity: layers.finalUi }}>
        <div className="earth-scroll-callout" style={{ opacity: layers.calloutGraphics }}>
          <div className="earth-scroll-callout__track">
            <span className="earth-scroll-callout__dot" />
            <span className="earth-scroll-callout__line" />
          </div>
          <div className="earth-scroll-callout__copy">
            <p className="earth-scroll-callout__title">город Солнечногорск</p>
            <p className="earth-scroll-callout__subtitle">дислокация проекта ВОСХОД</p>
          </div>
        </div>
      </div>
    </div>
  );
}
