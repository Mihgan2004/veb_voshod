"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  useCheckout,
  type CdekPointData,
  type CourierAddressData,
} from "@/lib/checkout/checkout-store";
import type { CdekDeliveryType, DeliveryProvider } from "@/lib/cdek/types";
import { PvzSelector } from "./PvzSelector";

const inputBase =
  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10";

type CdekSubTab = {
  id: CdekDeliveryType;
  label: string;
  description: string;
};

const cdekSubTabs: CdekSubTab[] = [
  { id: "pvz", label: "ПВЗ", description: "Пункт выдачи заказов СДЭК" },
  { id: "postamat", label: "Постамат", description: "Автоматическая выдача 24/7" },
  { id: "courier", label: "Курьер", description: "Доставка до двери" },
];

type ProviderTab = {
  id: DeliveryProvider;
  label: string;
  logo: string;
};

const providerTabs: ProviderTab[] = [
  { id: "cdek", label: "СДЭК", logo: "/logo/cdek-1.svg" },
  { id: "yandex", label: "Яндекс", logo: "/logo/ZIF.png" },
  { id: "ozon", label: "Озон", logo: "/logo/Ozon_idTmLIuY6b_0.png" },
];

type StepDeliveryProps = {
  onNext: () => void;
  onBack: () => void;
};

export function StepDelivery({ onNext, onBack }: StepDeliveryProps) {
  const deliveryProvider = useCheckout((s) => s.deliveryProvider);
  const deliveryType = useCheckout((s) => s.deliveryType);
  const cdekPoint = useCheckout((s) => s.cdekPoint);
  const courierAddress = useCheckout((s) => s.courierAddress);
  const manualPvzAddress = useCheckout((s) => s.manualPvzAddress);
  const deliveryCost = useCheckout((s) => s.deliveryCost);
  const deliveryDays = useCheckout((s) => s.deliveryDays);
  const isLoading = useCheckout((s) => s.isLoading);
  const setDeliveryProvider = useCheckout((s) => s.setDeliveryProvider);
  const setDeliveryType = useCheckout((s) => s.setDeliveryType);
  const setCdekPoint = useCheckout((s) => s.setCdekPoint);
  const setCourierAddress = useCheckout((s) => s.setCourierAddress);
  const setManualPvzAddress = useCheckout((s) => s.setManualPvzAddress);
  const setDeliveryCost = useCheckout((s) => s.setDeliveryCost);
  const setDeliveryDays = useCheckout((s) => s.setDeliveryDays);
  const setIsLoading = useCheckout((s) => s.setIsLoading);
  const isDeliveryValid = useCheckout((s) => s.isDeliveryValid);

  const continueRef = useRef<HTMLDivElement>(null);

  const [cityInput, setCityInput] = useState(courierAddress?.city || "");
  const [citySuggestions, setCitySuggestions] = useState<
    Array<{ code: number; name: string; region?: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCourierCity, setSelectedCourierCity] = useState<{
    code: number;
    name: string;
  } | null>(
    courierAddress?.cityCode
      ? { code: courierAddress.cityCode, name: courierAddress.city }
      : null
  );
  const [courierError, setCourierError] = useState<string | null>(null);

  const handlePointSelect = useCallback(
    (point: CdekPointData, tariff: { cost: number; days: string }) => {
      setCdekPoint(point);
      setDeliveryCost(Math.ceil(tariff.cost));
      setDeliveryDays(`${tariff.days}`);
      setTimeout(() => {
        continueRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    },
    [setCdekPoint, setDeliveryCost, setDeliveryDays]
  );

  const handleCdekTabChange = (type: CdekDeliveryType) => {
    setDeliveryType(type);
  };

  const handleCourierAddressChange = (
    field: keyof CourierAddressData,
    value: string | number
  ) => {
    const current = courierAddress || {
      city: "",
      cityCode: 0,
      street: "",
      house: "",
      flat: "",
    };
    setCourierAddress({ ...current, [field]: value });
  };

  const calculateCourierCost = useCallback(
    async (cityCode: number) => {
      setIsLoading(true);
      setCourierError(null);

      try {
        const res = await fetch("/api/cdek/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toCityCode: cityCode,
            tariffCode: 137,
          }),
        });

        const data = await res.json();

        if (data.ok) {
          setDeliveryCost(Math.ceil(data.total_sum));
          setDeliveryDays(`${data.period_min}-${data.period_max} дн.`);
        } else {
          setDeliveryCost(0);
          setDeliveryDays("");
          setCourierError("Не удалось рассчитать стоимость доставки");
        }
      } catch (e) {
        console.error("[delivery] Calculation error:", e);
        setDeliveryCost(0);
        setDeliveryDays("");
        setCourierError("Ошибка расчёта стоимости доставки");
      } finally {
        setIsLoading(false);
      }
    },
    [setDeliveryCost, setDeliveryDays, setIsLoading]
  );

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
      console.error("[delivery] City search error:", e);
    }
  }, []);

  useEffect(() => {
    if (deliveryType !== "courier" || deliveryProvider !== "cdek") return;

    const timeout = setTimeout(() => {
      if (cityInput.length >= 2 && !selectedCourierCity) {
        searchCities(cityInput);
      } else {
        setCitySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [cityInput, searchCities, deliveryType, selectedCourierCity, deliveryProvider]);

  const selectCourierCity = (city: {
    code: number;
    name: string;
    region?: string;
  }) => {
    setCityInput(city.name);
    setCitySuggestions([]);
    setShowSuggestions(false);
    setSelectedCourierCity({ code: city.code, name: city.name });
    const current = courierAddress || {
      city: "",
      cityCode: 0,
      street: "",
      house: "",
      flat: "",
    };
    setCourierAddress({
      ...current,
      city: city.name,
      cityCode: city.code,
    });
    calculateCourierCost(city.code);
  };

  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    if (selectedCourierCity) {
      setSelectedCourierCity(null);
      setDeliveryCost(0);
      setDeliveryDays("");
      setCourierError(null);
      const current = courierAddress || {
        city: "",
        cityCode: 0,
        street: "",
        house: "",
        flat: "",
      };
      setCourierAddress({ ...current, city: value, cityCode: 0 });
    }
  };

  const canProceed = isDeliveryValid();

  const providerLabel: Record<DeliveryProvider, string> = {
    cdek: "СДЭК",
    yandex: "Яндекс Доставка",
    ozon: "Озон Доставка",
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45 mb-4">
          Служба доставки
        </p>
      </div>

      {/* Provider tabs — logos крупно на всю плашку, СДЭК чуть больше */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {providerTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setDeliveryProvider(tab.id)}
            className={`relative flex items-center justify-center min-h-[64px] sm:min-h-[76px] py-4 sm:py-5 px-2 rounded-xl border transition-all duration-200 ${
              deliveryProvider === tab.id
                ? "border-gold/40 bg-gold/[0.08]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
            }`}
          >
            <Image
              src={tab.logo}
              alt={tab.label}
              width={tab.id === "cdek" ? 140 : 120}
              height={tab.id === "cdek" ? 52 : 44}
              className={`max-w-[95%] w-auto h-auto object-contain transition-opacity ${
                tab.id === "cdek" ? "max-h-12 sm:max-h-14" : "max-h-10 sm:max-h-12"
              } ${deliveryProvider === tab.id ? "opacity-100" : "opacity-45"}`}
              unoptimized
            />
            {deliveryProvider === tab.id && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* СДЭК sub-tabs */}
      {deliveryProvider === "cdek" && (
        <>
          <div>
            <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45 mb-3">
              Способ доставки
            </p>
          </div>
          <div className="flex rounded-xl bg-white/[0.02] border border-white/[0.06] p-1">
            {cdekSubTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleCdekTabChange(tab.id)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-[12px] font-mono uppercase tracking-[0.1em] transition-all ${
                  deliveryType === tab.id
                    ? "bg-white/[0.08] text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="text-[13px] text-white/50">
            {cdekSubTabs.find((t) => t.id === deliveryType)?.description}
          </p>

          {/* PVZ / Postamat */}
          {(deliveryType === "pvz" || deliveryType === "postamat") && (
            <PvzSelector
              filterType={deliveryType === "pvz" ? "PVZ" : "POSTAMAT"}
              onSelect={handlePointSelect}
            />
          )}

          {/* Courier */}
          {deliveryType === "courier" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-[12px] text-white/60">
                  Введите адрес для курьерской доставки. Курьер доставит заказ до двери.
                </p>
              </div>

              <div className="relative">
                <label htmlFor="courier-city" className="block text-[12px] text-white/50 mb-1.5">
                  Город <span className="text-crimson">*</span>
                </label>
                <input
                  id="courier-city"
                  type="text"
                  value={cityInput}
                  onChange={(e) => handleCityInputChange(e.target.value)}
                  onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Начните вводить название города"
                  className={`${inputBase} ${selectedCourierCity ? "border-gold/30" : "border-white/10"}`}
                  autoComplete="off"
                />
                {!selectedCourierCity && cityInput.length >= 2 && (
                  <p className="text-[11px] text-amber-400/70 mt-1">
                    Выберите город из списка подсказок
                  </p>
                )}
                {showSuggestions && citySuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 rounded-xl border border-white/[0.08] bg-[#11151b] shadow-2xl max-h-52 overflow-y-auto">
                    {citySuggestions.map((city) => (
                      <button
                        key={city.code}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectCourierCity(city)}
                        className="w-full text-left px-4 py-3 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-b-0"
                      >
                        <span className="block text-[14px] text-white/90">{city.name}</span>
                        {city.region && (
                          <span className="block text-[11px] text-white/40 mt-0.5">{city.region}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="courier-street" className="block text-[12px] text-white/50 mb-1.5">
                  Улица <span className="text-crimson">*</span>
                </label>
                <input
                  id="courier-street"
                  type="text"
                  value={courierAddress?.street || ""}
                  onChange={(e) => handleCourierAddressChange("street", e.target.value)}
                  placeholder="Название улицы"
                  className={`${inputBase} border-white/10`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="courier-house" className="block text-[12px] text-white/50 mb-1.5">
                    Дом <span className="text-crimson">*</span>
                  </label>
                  <input
                    id="courier-house"
                    type="text"
                    value={courierAddress?.house || ""}
                    onChange={(e) => handleCourierAddressChange("house", e.target.value)}
                    placeholder="№ дома"
                    className={`${inputBase} border-white/10`}
                  />
                </div>
                <div>
                  <label htmlFor="courier-flat" className="block text-[12px] text-white/50 mb-1.5">
                    Квартира
                  </label>
                  <input
                    id="courier-flat"
                    type="text"
                    value={courierAddress?.flat || ""}
                    onChange={(e) => handleCourierAddressChange("flat", e.target.value)}
                    placeholder="№ кв."
                    className={`${inputBase} border-white/10`}
                  />
                </div>
              </div>

              {courierError && (
                <div className="rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-[13px] text-crimson">
                  {courierError}
                </div>
              )}

              {deliveryCost > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div>
                    <p className="text-[12px] text-white/50">Стоимость доставки</p>
                    <p className="text-[13px] text-white/40 mt-0.5">{deliveryDays}</p>
                  </div>
                  <p className="text-[18px] font-semibold text-white vx-price">
                    {deliveryCost.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              )}

              {deliveryType === "courier" && !canProceed && selectedCourierCity && deliveryCost > 0 && (
                <p className="text-[11px] text-white/30">
                  Заполните все обязательные поля для продолжения
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Яндекс / Озон — manual PVZ address */}
      {(deliveryProvider === "yandex" || deliveryProvider === "ozon") && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-[12px] text-white/60">
              Укажите адрес ПВЗ {providerLabel[deliveryProvider]}, куда вам удобно забрать заказ. Стоимость доставки будет рассчитана менеджером.
            </p>
          </div>

          <div>
            <label htmlFor="manual-pvz" className="block text-[12px] text-white/50 mb-1.5">
              Адрес ПВЗ <span className="text-crimson">*</span>
            </label>
            <input
              id="manual-pvz"
              type="text"
              value={manualPvzAddress}
              onChange={(e) => setManualPvzAddress(e.target.value)}
              placeholder={`Город, адрес ПВЗ ${providerLabel[deliveryProvider]}`}
              className={`${inputBase} ${manualPvzAddress.trim().length >= 5 ? "border-gold/30" : "border-white/10"}`}
            />
            {manualPvzAddress.trim().length > 0 && manualPvzAddress.trim().length < 5 && (
              <p className="text-[11px] text-amber-400/70 mt-1">
                Введите полный адрес ПВЗ
              </p>
            )}
          </div>

          {manualPvzAddress.trim().length >= 5 && (
            <div className="rounded-xl border border-gold/20 bg-gold/[0.04] p-4">
              <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-gold/70 mb-1">
                Доставка
              </p>
              <p className="text-[13px] text-white/70">
                Стоимость и сроки доставки через {providerLabel[deliveryProvider]} будут уточнены менеджером после оформления заказа.
              </p>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[13px] text-white/40">Расчёт стоимости...</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div ref={continueRef} className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 vx-back-btn"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 vx-gold-btn"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}
