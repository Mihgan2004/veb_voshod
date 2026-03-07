"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export type MapOffice = {
  code: string;
  lat: number;
  lng: number;
  name: string;
  address: string;
  workTime?: string;
  type?: string;
};

type DeliveryMapProps = {
  offices: MapOffice[];
  center?: [number, number];
  selectedCode?: string;
  onOfficeClick?: (code: string) => void;
  className?: string;
};

type YMap = {
  geoObjects: { add: (o: unknown) => void; removeAll: () => void };
  setCenter: (c: [number, number], z?: number, opts?: Record<string, unknown>) => void;
  setBounds: (b: number[][], opts?: Record<string, unknown>) => void;
  destroy: () => void;
};

type YGeoCollection = {
  add: (o: unknown) => void;
  getBounds: () => number[][] | null;
};

type Ymaps = {
  ready: (cb: () => void) => void;
  Map: new (el: HTMLElement, state: Record<string, unknown>) => YMap;
  Placemark: new (
    coords: [number, number],
    properties: Record<string, string>,
    options: Record<string, unknown>
  ) => { events: { add: (e: string, cb: () => void) => void } };
  GeoObjectCollection: new () => YGeoCollection;
};

declare global {
  interface Window {
    ymaps?: Ymaps;
  }
}

let scriptState: "idle" | "loading" | "loaded" | "error" = "idle";
const pendingCallbacks: Array<() => void> = [];

function loadYmaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptState === "loaded" && window.ymaps) {
      resolve();
      return;
    }
    if (scriptState === "error") {
      reject(new Error("Yandex Maps failed previously"));
      return;
    }

    pendingCallbacks.push(resolve);

    if (scriptState === "loading") return;
    scriptState = "loading";

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;

    script.onload = () => {
      window.ymaps?.ready(() => {
        scriptState = "loaded";
        pendingCallbacks.forEach((cb) => cb());
        pendingCallbacks.length = 0;
      });
    };

    script.onerror = () => {
      scriptState = "error";
      pendingCallbacks.length = 0;
      reject(new Error("Failed to load Yandex Maps script"));
    };

    document.head.appendChild(script);
  });
}

export function DeliveryMap({
  offices,
  center,
  selectedCode,
  onOfficeClick,
  className = "",
}: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("API ключ Яндекс.Карт не настроен");
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        await loadYmaps(apiKey);
      } catch {
        if (mounted) {
          setError("Не удалось загрузить Яндекс.Карты");
          setLoading(false);
        }
        return;
      }

      if (!mounted || !containerRef.current || !window.ymaps) return;

      mapRef.current = new window.ymaps.Map(containerRef.current, {
        center: center || [55.76, 37.64],
        zoom: 11,
        controls: ["zoomControl"],
      });

      setLoading(false);
    })();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const updateCenter = useCallback((newCenter: [number, number]) => {
    mapRef.current?.setCenter(newCenter, 12, { duration: 300 });
  }, []);

  useEffect(() => {
    if (center && mapRef.current) {
      updateCenter(center);
    }
  }, [center, updateCenter]);

  useEffect(() => {
    if (!mapRef.current || !window.ymaps) return;

    const map = mapRef.current;
    map.geoObjects.removeAll();

    if (offices.length === 0) return;

    const collection = new window.ymaps.GeoObjectCollection();

    offices.forEach((office) => {
      const isSelected = office.code === selectedCode;

      const placemark = new window.ymaps.Placemark(
        [office.lat, office.lng],
        {
          balloonContentHeader: office.name,
          balloonContentBody: `${office.address}<br/><small>${office.workTime || ""}</small>`,
          hintContent: office.name,
        },
        {
          preset: isSelected ? "islands#goldCircleDotIcon" : "islands#grayCircleDotIcon",
        }
      );

      placemark.events.add("click", () => {
        onOfficeClick?.(office.code);
      });

      collection.add(placemark);
    });

    map.geoObjects.add(collection);

    const bounds = collection.getBounds();
    if (bounds) {
      map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
    }
  }, [offices, selectedCode, onOfficeClick]);

  if (!apiKey) return null;

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#0b0d10] ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0b0d10]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-white/40">Загрузка карты...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0b0d10]">
          <p className="text-[13px] text-white/30">{error}</p>
        </div>
      )}
      <div ref={containerRef} style={{ height: 360, width: "100%" }} />
    </div>
  );
}
