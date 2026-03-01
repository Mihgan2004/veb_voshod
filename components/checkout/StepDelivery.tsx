"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  useCheckout,
  type CdekPointData,
  type CourierAddressData,
} from "@/lib/checkout/checkout-store";
import type { CdekDeliveryType } from "@/lib/cdek/types";

const CdekMapWidget = dynamic(
  () => import("./CdekMapWidget").then((mod) => mod.CdekMapWidget),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[500px] rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-white/40">Загрузка виджета СДЭК...</p>
        </div>
      </div>
    ),
  }
);

const inputBase =
  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10";

type DeliveryTab = {
  id: CdekDeliveryType;
  label: string;
  description: string;
};

const deliveryTabs: DeliveryTab[] = [
  { id: "pvz", label: "ПВЗ", description: "Пункт выдачи заказов СДЭК" },
  { id: "postamat", label: "Постамат", description: "Автоматическая выдача 24/7" },
  { id: "courier", label: "Курьер", description: "Доставка до двери" },
];

type StepDeliveryProps = {
  onNext: () => void;
  onBack: () => void;
};

export function StepDelivery({ onNext, onBack }: StepDeliveryProps) {
  const deliveryType = useCheckout((s) => s.deliveryType);
  const cdekPoint = useCheckout((s) => s.cdekPoint);
  const courierAddress = useCheckout((s) => s.courierAddress);
  const deliveryCost = useCheckout((s) => s.deliveryCost);
  const deliveryDays = useCheckout((s) => s.deliveryDays);
  const isLoading = useCheckout((s) => s.isLoading);
  const setDeliveryType = useCheckout((s) => s.setDeliveryType);
  const setCdekPoint = useCheckout((s) => s.setCdekPoint);
  const setCourierAddress = useCheckout((s) => s.setCourierAddress);
  const setDeliveryCost = useCheckout((s) => s.setDeliveryCost);
  const setDeliveryDays = useCheckout((s) => s.setDeliveryDays);
  const setIsLoading = useCheckout((s) => s.setIsLoading);
  const isDeliveryValid = useCheckout((s) => s.isDeliveryValid);

  const [cityInput, setCityInput] = useState(courierAddress?.city || "");
  const [citySuggestions, setCitySuggestions] = useState<
    Array<{ code: number; name: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);

  const handlePointSelect = useCallback(
    (point: CdekPointData, tariff: { cost: number; days: string }) => {
      setCdekPoint(point);
      setDeliveryCost(Math.ceil(tariff.cost));
      setDeliveryDays(`${tariff.days} дн.`);
    },
    [setCdekPoint, setDeliveryCost, setDeliveryDays]
  );

  const handleTabChange = (type: CdekDeliveryType) => {
    setDeliveryType(type);
    setWidgetError(null);
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

      try {
        const res = await fetch("/api/cdek/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toCityCode: cityCode,
            tariffCode: 139,
          }),
        });

        const data = await res.json();

        if (data.ok) {
          setDeliveryCost(Math.ceil(data.total_sum));
          setDeliveryDays(`${data.period_min}-${data.period_max} дн.`);
        } else {
          console.error("[delivery] Calculation failed:", data);
          setDeliveryCost(0);
          setDeliveryDays("");
        }
      } catch (e) {
        console.error("[delivery] Calculation error:", e);
        setDeliveryCost(0);
        setDeliveryDays("");
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
      const res = await fetch(`/api/cdek/cities?q=${encodeURIComponent(query)}`);
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
    const timeout = setTimeout(() => {
      if (cityInput.length >= 2) {
        searchCities(cityInput);
      } else {
        setCitySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [cityInput, searchCities]);

  const selectCity = (city: { code: number; name: string }) => {
    setCityInput(city.name);
    handleCourierAddressChange("city", city.name);
    handleCourierAddressChange("cityCode", city.code);
    setShowSuggestions(false);
    calculateCourierCost(city.code);
  };

  const canProceed = isDeliveryValid();
  const showYandexKeyWarning = !process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45 mb-4">
          Способ доставки
        </p>
      </div>

      <div className="flex rounded-xl bg-white/[0.02] border border-white/[0.06] p-1">
        {deliveryTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
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
        {deliveryTabs.find((t) => t.id === deliveryType)?.description}
      </p>

      {showYandexKeyWarning && (deliveryType === "pvz" || deliveryType === "postamat") && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-300">
          <strong>Внимание:</strong> Для работы карты СДЭК необходимо добавить ключ Яндекс.Карт
          в переменную окружения <code className="bg-white/10 px-1 rounded">NEXT_PUBLIC_YANDEX_MAPS_API_KEY</code>
        </div>
      )}

      {(deliveryType === "pvz" || deliveryType === "postamat") && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-[12px] text-white/60 mb-3">
              Введите город в поле поиска виджета, затем выберите удобный пункт выдачи на карте или из списка.
            </p>
            <ul className="text-[11px] text-white/40 space-y-1">
              <li>• Начните вводить название города</li>
              <li>• Выберите город из подсказок</li>
              <li>• Кликните на ПВЗ на карте или в списке</li>
              <li>• Нажмите кнопку «Выбрать»</li>
            </ul>
          </div>

          {widgetError ? (
            <div className="rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-[13px] text-crimson">
              {widgetError}
            </div>
          ) : (
            <CdekMapWidget
              filterType={deliveryType === "pvz" ? "PVZ" : "POSTAMAT"}
              onSelect={handlePointSelect}
            />
          )}

          {cdekPoint && (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
              <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-gold mb-2">
                Выбранный пункт
              </p>
              <p className="text-[14px] text-white font-medium">{cdekPoint.name}</p>
              <p className="text-[13px] text-white/60 mt-1">
                {cdekPoint.city}, {cdekPoint.address}
              </p>
              <p className="text-[12px] text-white/40 mt-1">{cdekPoint.workTime}</p>
              {deliveryCost > 0 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/20">
                  <span className="text-[12px] text-white/50">
                    Доставка: {deliveryDays}
                  </span>
                  <span className="text-[16px] font-semibold text-gold">
                    {deliveryCost.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {deliveryType === "courier" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-[12px] text-white/60">
              Введите адрес для курьерской доставки. Курьер доставит заказ до двери.
            </p>
          </div>

          <div className="relative">
            <label
              htmlFor="courier-city"
              className="block text-[12px] text-white/50 mb-1.5"
            >
              Город <span className="text-crimson">*</span>
            </label>
            <input
              id="courier-city"
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Начните вводить название города"
              className={`${inputBase} border-white/10`}
              autoComplete="off"
            />
            {showSuggestions && citySuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 rounded-xl border border-white/[0.08] bg-graphite-light shadow-lg max-h-48 overflow-y-auto">
                {citySuggestions.map((city) => (
                  <button
                    key={city.code}
                    type="button"
                    onClick={() => selectCity(city)}
                    className="w-full text-left px-4 py-2.5 text-[14px] text-white/80 hover:bg-white/[0.05] transition-colors"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="courier-street"
              className="block text-[12px] text-white/50 mb-1.5"
            >
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
              <label
                htmlFor="courier-house"
                className="block text-[12px] text-white/50 mb-1.5"
              >
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
              <label
                htmlFor="courier-flat"
                className="block text-[12px] text-white/50 mb-1.5"
              >
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

          {deliveryCost > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <div>
                <p className="text-[12px] text-white/50">Стоимость доставки</p>
                <p className="text-[13px] text-white/40 mt-0.5">{deliveryDays}</p>
              </div>
              <p className="text-[18px] font-semibold text-white tabular-nums">
                {deliveryCost.toLocaleString("ru-RU")} ₽
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

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl border border-white/10 bg-white/[0.02] font-mono text-[12px] uppercase tracking-[0.2em] text-white/60 hover:bg-white/[0.05] hover:text-white/80 transition-all"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`flex-1 h-12 rounded-xl font-mono text-[12px] uppercase tracking-[0.2em] transition-all ${
            canProceed
              ? "bg-gold text-graphite hover:bg-gold/90 active:scale-[0.99]"
              : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}
