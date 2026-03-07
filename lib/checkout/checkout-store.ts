"use client";

import { create } from "zustand";
import type { CdekDeliveryType, CdekOfficeType, DeliveryProvider } from "@/lib/cdek/types";

export type CheckoutStep = 1 | 2 | 3;

export type ContactsData = {
  name: string;
  email: string;
  phone: string;
  comment: string;
};

export type CdekPointData = {
  code: string;
  name: string;
  address: string;
  city: string;
  cityCode: number;
  type: CdekOfficeType;
  workTime: string;
  phone?: string;
};

export type CourierAddressData = {
  city: string;
  cityCode: number;
  street: string;
  house: string;
  flat: string;
  postalCode?: string;
};

export type CheckoutStore = {
  step: CheckoutStep;
  contacts: ContactsData;
  deliveryProvider: DeliveryProvider;
  deliveryType: CdekDeliveryType;
  cdekPoint: CdekPointData | null;
  courierAddress: CourierAddressData | null;
  manualPvzAddress: string;
  deliveryCost: number;
  deliveryDays: string;
  isLoading: boolean;
  agreedToTerms: boolean;

  setStep: (step: CheckoutStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  setContacts: (contacts: Partial<ContactsData>) => void;
  setDeliveryProvider: (provider: DeliveryProvider) => void;
  setDeliveryType: (type: CdekDeliveryType) => void;
  setCdekPoint: (point: CdekPointData | null) => void;
  setCourierAddress: (address: CourierAddressData | null) => void;
  setManualPvzAddress: (address: string) => void;
  setDeliveryCost: (cost: number) => void;
  setDeliveryDays: (days: string) => void;
  setIsLoading: (loading: boolean) => void;
  setAgreedToTerms: (agreed: boolean) => void;

  reset: () => void;

  isContactsValid: () => boolean;
  isDeliveryValid: () => boolean;
  canProceedToPayment: () => boolean;
  getDeliveryAddress: () => string;
};

const initialContacts: ContactsData = {
  name: "",
  email: "",
  phone: "",
  comment: "",
};

export const useCheckout = create<CheckoutStore>((set, get) => ({
  step: 1,
  contacts: initialContacts,
  deliveryProvider: "cdek",
  deliveryType: "pvz",
  cdekPoint: null,
  courierAddress: null,
  manualPvzAddress: "",
  deliveryCost: 0,
  deliveryDays: "",
  isLoading: false,
  agreedToTerms: false,

  setStep: (step) => set({ step }),

  nextStep: () => {
    const { step } = get();
    if (step < 3) {
      set({ step: (step + 1) as CheckoutStep });
    }
  },

  prevStep: () => {
    const { step } = get();
    if (step > 1) {
      set({ step: (step - 1) as CheckoutStep });
    }
  },

  setContacts: (contacts) =>
    set((state) => ({
      contacts: { ...state.contacts, ...contacts },
    })),

  setDeliveryProvider: (deliveryProvider) =>
    set({
      deliveryProvider,
      cdekPoint: null,
      courierAddress: null,
      manualPvzAddress: "",
      deliveryCost: 0,
      deliveryDays: "",
      deliveryType: "pvz",
    }),

  setDeliveryType: (deliveryType) =>
    set({
      deliveryType,
      cdekPoint: null,
      courierAddress: null,
      deliveryCost: 0,
      deliveryDays: "",
    }),

  setCdekPoint: (cdekPoint) => set({ cdekPoint }),
  setCourierAddress: (courierAddress) => set({ courierAddress }),
  setManualPvzAddress: (manualPvzAddress) => set({ manualPvzAddress }),
  setDeliveryCost: (deliveryCost) => set({ deliveryCost }),
  setDeliveryDays: (deliveryDays) => set({ deliveryDays }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setAgreedToTerms: (agreedToTerms) => set({ agreedToTerms }),

  reset: () =>
    set({
      step: 1,
      contacts: initialContacts,
      deliveryProvider: "cdek",
      deliveryType: "pvz",
      cdekPoint: null,
      courierAddress: null,
      manualPvzAddress: "",
      deliveryCost: 0,
      deliveryDays: "",
      isLoading: false,
      agreedToTerms: false,
    }),

  isContactsValid: () => {
    const { contacts } = get();
    const nameValid = contacts.name.trim().length >= 2;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacts.email.trim());
    return nameValid && emailValid;
  },

  isDeliveryValid: () => {
    const { deliveryProvider, deliveryType, cdekPoint, courierAddress, deliveryCost, manualPvzAddress } = get();

    if (deliveryProvider === "yandex" || deliveryProvider === "ozon") {
      return manualPvzAddress.trim().length >= 5;
    }

    if (deliveryCost <= 0) return false;

    if (deliveryType === "pvz" || deliveryType === "postamat") {
      return cdekPoint !== null;
    }

    if (deliveryType === "courier") {
      return (
        courierAddress !== null &&
        courierAddress.city.trim().length > 0 &&
        courierAddress.street.trim().length > 0 &&
        courierAddress.house.trim().length > 0
      );
    }

    return false;
  },

  canProceedToPayment: () => {
    const { isContactsValid, isDeliveryValid } = get();
    return isContactsValid() && isDeliveryValid();
  },

  getDeliveryAddress: () => {
    const { deliveryProvider, deliveryType, cdekPoint, courierAddress, manualPvzAddress } = get();

    if (deliveryProvider === "yandex" || deliveryProvider === "ozon") {
      return manualPvzAddress.trim();
    }

    if (deliveryType === "pvz" || deliveryType === "postamat") {
      if (!cdekPoint) return "";
      return `${cdekPoint.city}, ${cdekPoint.address}`;
    }

    if (deliveryType === "courier") {
      if (!courierAddress) return "";
      const parts = [
        courierAddress.city,
        courierAddress.street,
        `д. ${courierAddress.house}`,
      ];
      if (courierAddress.flat) parts.push(`кв. ${courierAddress.flat}`);
      return parts.join(", ");
    }

    return "";
  },
}));
