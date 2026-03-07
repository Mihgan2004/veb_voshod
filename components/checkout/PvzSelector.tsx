"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { CdekPointData } from "@/lib/checkout/checkout-store";
import type { CdekOfficeType } from "@/lib/cdek/types";

const DeliveryMap = dynamic(
  () => import("./DeliveryMap").then((mod) => mod.DeliveryMap),
  { ssr: false }
);

type CityOption = {
  code: number;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
};

type OfficeData = {
  code: string;
  name: string;
  address: string;
  city: string;
  cityCode: number;
  type: CdekOfficeType;
  workTime: string;
  lat: number;
  lng: number;
  hasCashless: boolean;
  hasCash: boolean;
  isDressingRoom: boolean;
  nearestMetro?: string;
  addressComment?: string;
};

type PvzSelectorProps = {
  filterType: CdekOfficeType;
  onSelect: (
    point: CdekPointData,
    tariff: { cost: number; days: string }
  ) => void;
};

const inputBase =
  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10";

export function PvzSelector({ filterType, onSelect }: PvzSelectorProps) {
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CityOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [offices, setOffices] = useState<OfficeData[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [officesError, setOfficesError] = useState<string | null>(null);

  const [selectedOffice, setSelectedOffice] = useState<OfficeData | null>(null);

  const [deliveryCost, setDeliveryCost] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState("");
  const [costLoading, setCostLoading] = useState(false);
  const [costError, setCostError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const hasYandexKey = !!process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  // --- City search ---

  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setCitySuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/cdek/cities?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.ok && data.cities) {
        setCitySuggestions(data.cities);
        setShowSuggestions(true);
      }
    } catch (e) {
      console.error("[PvzSelector] City search error:", e);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (cityInput.length >= 2 && !selectedCity) {
        searchCities(cityInput);
      } else {
        setCitySuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [cityInput, searchCities, selectedCity]);

  // --- Fetch offices when city selected ---

  const fetchOffices = useCallback(
    async (cityCode: number) => {
      setLoadingOffices(true);
      setOfficesError(null);
      setOffices([]);
      setSelectedOffice(null);

      try {
        const typeParam = filterType === "PVZ" || filterType === "POSTAMAT" ? `&type=${filterType}` : "";
        const res = await fetch(
          `/api/cdek/offices?cityCode=${cityCode}${typeParam}`
        );
        const data = await res.json();

        if (data.ok && data.offices) {
          setOffices(data.offices);
          if (data.offices.length === 0) {
            setOfficesError(
              filterType === "POSTAMAT"
                ? "В этом городе нет постаматов СДЭК"
                : "В этом городе нет пунктов выдачи СДЭК"
            );
          }
        } else {
          setOfficesError("Не удалось загрузить пункты выдачи");
        }
      } catch (e) {
        console.error("[PvzSelector] Offices fetch error:", e);
        setOfficesError("Ошибка загрузки пунктов выдачи");
      } finally {
        setLoadingOffices(false);
      }
    },
    [filterType]
  );

  // --- Calculate cost for city ---

  const calculateCost = useCallback(async (cityCode: number) => {
    setCostLoading(true);
    setCostError(null);
    try {
      const res = await fetch("/api/cdek/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toCityCode: cityCode, tariffCode: 136 }),
      });
      const data = await res.json();
      if (data.ok) {
        setDeliveryCost(Math.ceil(data.total_sum));
        setDeliveryDays(`${data.period_min}-${data.period_max} дн.`);
      } else {
        setDeliveryCost(0);
        setDeliveryDays("");
        setCostError("Не удалось рассчитать стоимость доставки");
      }
    } catch (e) {
      console.error("[PvzSelector] Cost calculation error:", e);
      setDeliveryCost(0);
      setDeliveryDays("");
      setCostError("Ошибка расчёта стоимости");
    } finally {
      setCostLoading(false);
    }
  }, []);

  // --- Handlers ---

  const selectCity = useCallback(
    (city: CityOption) => {
      setCityInput(city.name);
      setCitySuggestions([]);
      setShowSuggestions(false);
      setSelectedCity(city);
      fetchOffices(city.code);
      calculateCost(city.code);
    },
    [fetchOffices, calculateCost]
  );

  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    if (selectedCity) {
      setSelectedCity(null);
      setOffices([]);
      setSelectedOffice(null);
      setDeliveryCost(0);
      setDeliveryDays("");
      setCostError(null);
    }
  };

  const handleOfficeClick = useCallback(
    (code: string) => {
      const office = offices.find((o) => o.code === code);
      if (!office) return;

      setSelectedOffice(office);

      const point: CdekPointData = {
        code: office.code,
        name: office.name,
        address: office.address,
        city: office.city,
        cityCode: office.cityCode,
        type: office.type,
        workTime: office.workTime,
      };

      onSelect(point, {
        cost: deliveryCost,
        days: deliveryDays,
      });
    },
    [offices, deliveryCost, deliveryDays, onSelect]
  );

  const scrollToOffice = (code: string) => {
    const el = listRef.current?.querySelector(`[data-code="${code}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleMapOfficeClick = useCallback(
    (code: string) => {
      handleOfficeClick(code);
      scrollToOffice(code);
    },
    [handleOfficeClick]
  );

  // --- Map data ---

  const mapOffices = offices.map((o) => ({
    code: o.code,
    lat: o.lat,
    lng: o.lng,
    name: o.name,
    address: o.address,
    workTime: o.workTime,
    type: o.type,
  }));

  const mapCenter: [number, number] | undefined = selectedCity
    ? [selectedCity.latitude, selectedCity.longitude]
    : undefined;

  return (
    <div className="space-y-4">
      {/* City search */}
      <div className="relative">
        <label className="block text-[12px] text-white/50 mb-1.5">
          Город <span className="text-crimson">*</span>
        </label>
        <input
          type="text"
          value={cityInput}
          onChange={(e) => handleCityInputChange(e.target.value)}
          onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Начните вводить название города"
          className={`${inputBase} border-white/10`}
          autoComplete="off"
        />
        {showSuggestions && citySuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 rounded-xl border border-white/[0.08] bg-[#11151b] shadow-2xl max-h-52 overflow-y-auto">
            {citySuggestions.map((city) => (
              <button
                key={city.code}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectCity(city)}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-b-0"
              >
                <span className="block text-[14px] text-white/90">
                  {city.name}
                </span>
                {city.region && (
                  <span className="block text-[11px] text-white/40 mt-0.5">
                    {city.region}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cost info */}
      {costLoading && (
        <div className="flex items-center gap-2 text-[13px] text-white/40">
          <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          Расчёт стоимости...
        </div>
      )}

      {costError && !costLoading && (
        <div className="rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-[13px] text-crimson">
          {costError}
        </div>
      )}

      {deliveryCost > 0 && !costLoading && (
        <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <div>
            <p className="text-[12px] text-white/50">
              Доставка в {selectedCity?.name}
            </p>
            <p className="text-[12px] text-white/35 mt-0.5">{deliveryDays}</p>
          </div>
          <p className="text-[16px] font-semibold text-gold tabular-nums">
            {deliveryCost.toLocaleString("ru-RU")} ₽
          </p>
        </div>
      )}

      {/* Map */}
      {hasYandexKey && selectedCity && (
        <DeliveryMap
          offices={mapOffices}
          center={mapCenter}
          selectedCode={selectedOffice?.code}
          onOfficeClick={handleMapOfficeClick}
        />
      )}

      {/* Loading offices */}
      {loadingOffices && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-white/40">
            Загрузка пунктов выдачи...
          </p>
        </div>
      )}

      {/* Error */}
      {officesError && !loadingOffices && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
          <p className="text-[13px] text-white/40">{officesError}</p>
        </div>
      )}

      {/* Offices list */}
      {offices.length > 0 && !loadingOffices && (
        <div>
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/40 mb-3">
            {filterType === "POSTAMAT" ? "Постаматы" : "Пункты выдачи"} (
            {offices.length})
          </p>
          <div
            ref={listRef}
            className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin"
          >
            {offices.map((office) => {
              const isSelected = selectedOffice?.code === office.code;
              return (
                <button
                  key={office.code}
                  type="button"
                  data-code={office.code}
                  onClick={() => handleOfficeClick(office.code)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-gold/40 bg-gold/[0.07]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[14px] font-medium truncate ${
                          isSelected ? "text-gold" : "text-white/90"
                        }`}
                      >
                        {office.name}
                      </p>
                      <p className="text-[13px] text-white/55 mt-1">
                        {office.address}
                      </p>
                      <p className="text-[11px] text-white/35 mt-1">
                        {office.workTime}
                      </p>
                      {office.nearestMetro && (
                        <p className="text-[11px] text-white/30 mt-1">
                          м. {office.nearestMetro}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="shrink-0 w-5 h-5 rounded-full bg-gold flex items-center justify-center mt-0.5">
                        <svg
                          className="w-3 h-3 text-graphite"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-2">
                    {office.hasCashless && (
                      <span className="text-[10px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded">
                        Безнал
                      </span>
                    )}
                    {office.isDressingRoom && (
                      <span className="text-[10px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded">
                        Примерочная
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected point summary */}
      {selectedOffice && deliveryCost > 0 && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-gold mb-2">
            Выбранный пункт
          </p>
          <p className="text-[14px] text-white font-medium">
            {selectedOffice.name}
          </p>
          <p className="text-[13px] text-white/60 mt-1">
            {selectedOffice.city}, {selectedOffice.address}
          </p>
          <p className="text-[12px] text-white/40 mt-1">
            {selectedOffice.workTime}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/20">
            <span className="text-[12px] text-white/50">
              Доставка: {deliveryDays}
            </span>
            <span className="text-[16px] font-semibold text-gold">
              {deliveryCost.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>
      )}

      {/* Prompt when no city selected */}
      {!selectedCity && !loadingOffices && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
          </div>
          <p className="text-[13px] text-white/50 mb-1">
            Введите название города
          </p>
          <p className="text-[12px] text-white/30">
            Мы покажем доступные{" "}
            {filterType === "POSTAMAT" ? "постаматы" : "пункты выдачи"} в вашем
            городе
          </p>
        </div>
      )}
    </div>
  );
}
