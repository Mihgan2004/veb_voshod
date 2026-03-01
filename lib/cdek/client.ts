import type {
  CdekTokenResponse,
  CdekTariffRequest,
  CdekTariffResponse,
  CdekOffice,
  CdekPackage,
  CdekTariffCode,
  CdekOfficeType,
} from "./types";

const CDEK_API_URL = "https://api.cdek.ru/v2";
const CDEK_AUTH_URL = "https://api.cdek.ru/v2/oauth/token";

let cachedToken: { token: string; expiresAt: number } | null = null;

function getCredentials() {
  const clientId = process.env.CDEK_CLIENT_ID;
  const clientSecret = process.env.CDEK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "[cdek] CDEK_CLIENT_ID and CDEK_CLIENT_SECRET must be set"
    );
  }

  return { clientId, clientSecret };
}

export async function getToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  const { clientId, clientSecret } = getCredentials();

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(CDEK_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[cdek] getToken failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as CdekTokenResponse;

  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}

export async function calculateTariff(
  fromCityCode: number,
  toCityCode: number,
  packages: CdekPackage[],
  tariffCode: CdekTariffCode
): Promise<CdekTariffResponse> {
  const token = await getToken();

  const payload: CdekTariffRequest = {
    from_location: { code: fromCityCode },
    to_location: { code: toCityCode },
    packages,
    tariff_code: tariffCode,
  };

  const response = await fetch(`${CDEK_API_URL}/calculator/tariff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `[cdek] calculateTariff failed: ${response.status} ${errorText}`
    );
  }

  const data = (await response.json()) as CdekTariffResponse;

  if (data.errors && data.errors.length > 0) {
    throw new Error(
      `[cdek] calculateTariff error: ${data.errors.map((e) => e.message).join(", ")}`
    );
  }

  return data;
}

export async function getOffices(
  cityCode: number,
  type?: CdekOfficeType
): Promise<CdekOffice[]> {
  const token = await getToken();

  const params = new URLSearchParams({
    city_code: cityCode.toString(),
  });

  if (type) {
    params.set("type", type);
  }

  const response = await fetch(
    `${CDEK_API_URL}/deliverypoints?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `[cdek] getOffices failed: ${response.status} ${errorText}`
    );
  }

  return (await response.json()) as CdekOffice[];
}

export async function searchCities(query: string): Promise<{ code: number; city: string }[]> {
  const token = await getToken();

  const params = new URLSearchParams({
    city: query,
    size: "10",
  });

  const response = await fetch(
    `${CDEK_API_URL}/location/cities?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `[cdek] searchCities failed: ${response.status} ${errorText}`
    );
  }

  const data = (await response.json()) as Array<{ code: number; city: string }>;
  return data;
}

export function getFromCityCode(): number {
  const code = process.env.CDEK_FROM_CITY_CODE;
  return code ? parseInt(code, 10) : 44;
}

export function getDefaultPackage(): CdekPackage {
  return {
    weight: 500,
    length: 30,
    width: 20,
    height: 5,
  };
}
