"use client";

import React, { useEffect, useRef, useCallback } from "react";
import type { CdekPointData } from "@/lib/checkout/checkout-store";

declare global {
  interface Window {
    CDEKWidget?: new (config: CdekWidgetConfig) => CdekWidgetInstance;
  }
}

type CdekWidgetConfig = {
  from: string | CdekFromLocation;
  root: string;
  apiKey: string;
  servicePath: string;
  defaultLocation?: string | [number, number];
  canChoose?: boolean;
  hideFilters?: {
    have_cashless?: boolean;
    have_cash?: boolean;
    is_dressing_room?: boolean;
    type?: boolean;
  };
  forceFilters?: {
    type?: "ALL" | "PVZ" | "POSTAMAT" | null;
  };
  hideDeliveryOptions?: {
    door?: boolean;
    office?: boolean;
  };
  goods?: Array<{
    width: number;
    height: number;
    length: number;
    weight: number;
  }>;
  tariffs?: {
    office?: number[];
    door?: number[];
  };
  lang?: "rus" | "eng";
  currency?: string;
  onReady?: () => void;
  onCalculate?: (tariffs: CdekTariffs, address: CdekCalcAddress) => void;
  onChoose?: (
    mode: "office" | "door",
    tariff: CdekTariff,
    address: CdekChooseAddress
  ) => void;
};

type CdekFromLocation = {
  country_code?: string;
  city?: string;
  postal_code?: number;
  code?: number;
  address?: string;
};

type CdekTariff = {
  tariff_code: number;
  tariff_name: string;
  tariff_description: string;
  delivery_mode: number;
  period_min: number;
  period_max: number;
  delivery_sum: number;
};

type CdekTariffs = {
  office: CdekTariff[];
  door: CdekTariff[];
  pickup: CdekTariff[];
};

type CdekCalcAddress = {
  code?: number;
  address?: string;
};

type CdekChooseAddress = {
  city_code: number;
  city: string;
  type: string;
  postal_code: string;
  country_code: string;
  have_cashless: boolean;
  have_cash: boolean;
  allowed_cod: boolean;
  is_dressing_room: boolean;
  code: string;
  name: string;
  address: string;
  work_time: string;
  location: [number, number];
};

type CdekWidgetInstance = {
  open: () => void;
  close: () => void;
  updateLocation: (location: string | [number, number]) => void;
};

type CdekMapWidgetProps = {
  filterType?: "ALL" | "PVZ" | "POSTAMAT";
  defaultCity?: string;
  onSelect: (point: CdekPointData, tariff: { cost: number; days: string }) => void;
  onCalculate?: (tariffs: CdekTariffs) => void;
  className?: string;
};

const CDEK_WIDGET_URL = "https://cdn.cdek.ru/widget/widjet.js";

let scriptLoaded = false;
let scriptLoading = false;
const scriptCallbacks: Array<() => void> = [];

function loadCdekScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded && window.CDEKWidget) {
      resolve();
      return;
    }

    scriptCallbacks.push(resolve);

    if (scriptLoading) {
      return;
    }

    scriptLoading = true;

    const script = document.createElement("script");
    script.src = CDEK_WIDGET_URL;
    script.async = true;
    script.charset = "utf-8";

    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      scriptCallbacks.forEach((cb) => cb());
      scriptCallbacks.length = 0;
    };

    script.onerror = () => {
      scriptLoading = false;
      scriptCallbacks.length = 0;
      reject(new Error("Failed to load CDEK widget script"));
    };

    document.head.appendChild(script);
  });
}

export function CdekMapWidget({
  filterType = "ALL",
  defaultCity = "Москва",
  onSelect,
  onCalculate,
  className = "",
}: CdekMapWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<CdekWidgetInstance | null>(null);
  const widgetIdRef = useRef<string>(`cdek-map-${Date.now()}`);

  const handleChoose = useCallback(
    (mode: "office" | "door", tariff: CdekTariff, address: CdekChooseAddress) => {
      if (mode === "office") {
        const point: CdekPointData = {
          code: address.code,
          name: address.name,
          address: address.address,
          city: address.city,
          cityCode: address.city_code,
          type: address.type === "POSTAMAT" ? "POSTAMAT" : "PVZ",
          workTime: address.work_time,
        };

        const deliveryInfo = {
          cost: tariff.delivery_sum,
          days: `${tariff.period_min}-${tariff.period_max}`,
        };

        onSelect(point, deliveryInfo);
      }
    },
    [onSelect]
  );

  const handleCalculate = useCallback(
    (tariffs: CdekTariffs) => {
      onCalculate?.(tariffs);
    },
    [onCalculate]
  );

  useEffect(() => {
    let mounted = true;

    async function initWidget() {
      try {
        await loadCdekScript();
      } catch (e) {
        console.error("[CdekWidget] Script load error:", e);
        return;
      }

      if (!mounted || !containerRef.current || !window.CDEKWidget) {
        return;
      }

      const yandexApiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "";
      const servicePath =
        typeof window !== "undefined"
          ? `${window.location.origin}/api/cdek/service`
          : "/api/cdek/service";

      const config: CdekWidgetConfig = {
        from: {
          country_code: "RU",
          city: "Москва",
          code: 44,
        },
        root: widgetIdRef.current,
        apiKey: yandexApiKey,
        servicePath,
        defaultLocation: defaultCity,
        canChoose: true,
        lang: "rus",
        currency: "RUB",
        hideDeliveryOptions: {
          door: true,
        },
        goods: [
          {
            width: 30,
            height: 20,
            length: 5,
            weight: 500,
          },
        ],
        tariffs: {
          office: [136],
          door: [137],
        },
        onReady: () => {
          console.log("[CdekWidget] Widget ready");
        },
        onCalculate: handleCalculate,
        onChoose: handleChoose,
      };

      if (filterType !== "ALL") {
        config.forceFilters = {
          type: filterType,
        };
      }

      try {
        widgetRef.current = new window.CDEKWidget(config);
      } catch (e) {
        console.error("[CdekWidget] Failed to initialize widget:", e);
      }
    }

    initWidget();

    return () => {
      mounted = false;
      widgetRef.current = null;
    };
  }, [defaultCity, filterType, handleChoose, handleCalculate]);

  return (
    <>
      <style jsx global>{`
        #${widgetIdRef.current} {
          min-height: 500px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0b0d10;
        }

        #${widgetIdRef.current} .CDEK-widget__search-input,
        #${widgetIdRef.current} input[type="text"],
        #${widgetIdRef.current} input[type="search"] {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: rgba(255, 255, 255, 0.92) !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
        }

        #${widgetIdRef.current} input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        #${widgetIdRef.current} input:focus {
          border-color: rgba(198, 144, 46, 0.5) !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(198, 144, 46, 0.15) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__panel,
        #${widgetIdRef.current} .CDEK-widget__sidebar {
          background: #0b0d10 !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__list-item,
        #${widgetIdRef.current} .CDEK-widget__office-item {
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          border-radius: 8px !important;
          margin-bottom: 8px !important;
          padding: 12px !important;
          transition: all 0.2s ease !important;
        }

        #${widgetIdRef.current} .CDEK-widget__list-item:hover,
        #${widgetIdRef.current} .CDEK-widget__office-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__list-item--selected,
        #${widgetIdRef.current} .CDEK-widget__office-item.selected {
          background: rgba(198, 144, 46, 0.1) !important;
          border-color: rgba(198, 144, 46, 0.3) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__title,
        #${widgetIdRef.current} h1,
        #${widgetIdRef.current} h2,
        #${widgetIdRef.current} h3,
        #${widgetIdRef.current} h4,
        #${widgetIdRef.current} .CDEK-widget__office-name {
          color: rgba(255, 255, 255, 0.92) !important;
          font-weight: 500 !important;
        }

        #${widgetIdRef.current} .CDEK-widget__text,
        #${widgetIdRef.current} p,
        #${widgetIdRef.current} span,
        #${widgetIdRef.current} .CDEK-widget__office-address {
          color: rgba(255, 255, 255, 0.65) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__office-time {
          color: rgba(255, 255, 255, 0.45) !important;
          font-size: 12px !important;
        }

        #${widgetIdRef.current} .CDEK-widget__price,
        #${widgetIdRef.current} .CDEK-widget__delivery-sum {
          color: #c6902e !important;
          font-weight: 600 !important;
        }

        #${widgetIdRef.current} .CDEK-widget__btn,
        #${widgetIdRef.current} button[type="button"],
        #${widgetIdRef.current} button[type="submit"] {
          background: #c6902e !important;
          color: #0b0d10 !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          padding: 10px 20px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        #${widgetIdRef.current} .CDEK-widget__btn:hover,
        #${widgetIdRef.current} button:hover {
          background: #d9a340 !important;
        }

        #${widgetIdRef.current} .CDEK-widget__tabs,
        #${widgetIdRef.current} .CDEK-widget__filter-tabs {
          background: rgba(255, 255, 255, 0.02) !important;
          border-radius: 8px !important;
          padding: 4px !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__tab,
        #${widgetIdRef.current} .CDEK-widget__filter-tab {
          color: rgba(255, 255, 255, 0.5) !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
          transition: all 0.2s ease !important;
        }

        #${widgetIdRef.current} .CDEK-widget__tab--active,
        #${widgetIdRef.current} .CDEK-widget__tab.active,
        #${widgetIdRef.current} .CDEK-widget__filter-tab--active {
          background: rgba(255, 255, 255, 0.08) !important;
          color: rgba(255, 255, 255, 0.92) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__map {
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        #${widgetIdRef.current} .CDEK-widget__loader {
          border-color: rgba(198, 144, 46, 0.2) !important;
          border-top-color: #c6902e !important;
        }

        #${widgetIdRef.current} .CDEK-widget__close,
        #${widgetIdRef.current} .CDEK-widget__back {
          color: rgba(255, 255, 255, 0.5) !important;
          transition: color 0.2s ease !important;
        }

        #${widgetIdRef.current} .CDEK-widget__close:hover,
        #${widgetIdRef.current} .CDEK-widget__back:hover {
          color: rgba(255, 255, 255, 0.92) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__dropdown,
        #${widgetIdRef.current} .CDEK-widget__suggestions {
          background: #11151b !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__dropdown-item,
        #${widgetIdRef.current} .CDEK-widget__suggestion {
          padding: 10px 16px !important;
          color: rgba(255, 255, 255, 0.8) !important;
          transition: background 0.15s ease !important;
        }

        #${widgetIdRef.current} .CDEK-widget__dropdown-item:hover,
        #${widgetIdRef.current} .CDEK-widget__suggestion:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        #${widgetIdRef.current} .CDEK-widget__checkbox,
        #${widgetIdRef.current} input[type="checkbox"] {
          accent-color: #c6902e !important;
        }

        #${widgetIdRef.current} label {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        #${widgetIdRef.current} ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        #${widgetIdRef.current} ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 3px;
        }

        #${widgetIdRef.current} ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        #${widgetIdRef.current} ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        #${widgetIdRef.current} a {
          color: #c6902e !important;
        }

        #${widgetIdRef.current} a:hover {
          color: #d9a340 !important;
        }
      `}</style>
      <div
        id={widgetIdRef.current}
        ref={containerRef}
        className={`cdek-widget-container ${className}`}
      />
    </>
  );
}
