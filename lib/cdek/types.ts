export type CdekDeliveryType = "pvz" | "postamat" | "courier";

export type CdekOfficeType = "PVZ" | "POSTAMAT";

export type CdekOffice = {
  code: string;
  name: string;
  location: {
    country_code: string;
    region_code: number;
    region: string;
    city_code: number;
    city: string;
    postal_code?: string;
    longitude: number;
    latitude: number;
    address: string;
    address_full: string;
  };
  address_comment?: string;
  nearest_station?: string;
  nearest_metro_station?: string;
  work_time: string;
  phones?: Array<{ number: string }>;
  email?: string;
  type: CdekOfficeType;
  owner_code: string;
  is_dressing_room: boolean;
  have_cashless: boolean;
  have_cash: boolean;
  allowed_cod: boolean;
  site?: string;
  office_image_list?: Array<{ url: string }>;
  work_time_list?: Array<{
    day: number;
    time: string;
  }>;
  weight_min?: number;
  weight_max?: number;
};

export type CdekCity = {
  code: number;
  city: string;
  fias_guid?: string;
  kladr_code?: string;
  country_code: string;
  country: string;
  region: string;
  region_code?: number;
  sub_region?: string;
  longitude: number;
  latitude: number;
  time_zone: string;
  payment_limit?: number;
};

export type CdekPackage = {
  weight: number;
  length?: number;
  width?: number;
  height?: number;
};

export type CdekTariffRequest = {
  from_location: {
    code?: number;
    postal_code?: string;
    city?: string;
    address?: string;
  };
  to_location: {
    code?: number;
    postal_code?: string;
    city?: string;
    address?: string;
  };
  packages: CdekPackage[];
  tariff_code?: number;
  currency?: number;
};

export type CdekTariffResponse = {
  delivery_sum: number;
  period_min: number;
  period_max: number;
  weight_calc: number;
  total_sum: number;
  currency: string;
  services?: Array<{
    code: string;
    sum: number;
  }>;
  errors?: Array<{
    code: string;
    message: string;
  }>;
};

export type CdekTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  jti: string;
};

export const CDEK_TARIFF_CODES = {
  /** 136: Посылка склад-склад (до ПВЗ / постамата) */
  WAREHOUSE_TO_OFFICE: 136,
  /** 137: Посылка склад-дверь (курьер) */
  WAREHOUSE_TO_DOOR: 137,
  /** 139: Посылка дверь-дверь */
  DOOR_TO_DOOR: 139,
} as const;

export type CdekTariffCode = (typeof CDEK_TARIFF_CODES)[keyof typeof CDEK_TARIFF_CODES];

export type CdekWidgetPoint = {
  code: string;
  name: string;
  address: string;
  city: string;
  cityCode: number;
  type: CdekOfficeType;
  workTime: string;
  phone?: string;
};
