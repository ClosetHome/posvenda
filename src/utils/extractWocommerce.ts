export interface BillingAddress {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  number: string;
  neighborhood: string;
  email: string;
  personType?: string;
  cpf?: string;
  rg?: string;
  cnpj?: string;
  ie?: string;
  birthdate?: string;
  gender?: string;
  phone: string;
  cellphone: string;
}

export interface ExtractedBilling {
  billingAddress: BillingAddress;
  normalizedPhone: string | null;
}

// Normaliza telefone para o formato +55XXXXXXXXXXX removendo qualquer formatacao.
export function normalizePhone(rawPhone?: string, countryCode = '+55'): string | null {
  if (!rawPhone) return null;

  const digits = rawPhone.replace(/\D+/g, '');
  if (!digits) return null;

  const withoutCountry = digits.startsWith('55') ? digits.slice(2) : digits;
  return `${countryCode}${withoutCountry}`;
}

// Extrai campos de billing e inclui telefone normalizado.
export function extractBilling(order: any): ExtractedBilling {
  const billing = order?.billing ?? {};

  const billingAddress: BillingAddress = {
    firstName: billing.first_name ?? '',
    lastName: billing.last_name ?? '',
    company: billing.company ?? '',
    address1: billing.address_1 ?? '',
    address2: billing.address_2 ?? '',
    city: billing.city ?? '',
    state: billing.state ?? '',
    postcode: billing.postcode ?? '',
    country: billing.country ?? '',
    number: billing.number ?? '',
    neighborhood: billing.neighborhood ?? '',
    email: billing.email ?? '',
    personType: billing.persontype,
    cpf: billing.cpf,
    rg: billing.rg,
    cnpj: billing.cnpj,
    ie: billing.ie,
    birthdate: billing.birthdate,
    gender: billing.gender,
    phone: billing.phone ?? '',
    cellphone: billing.cellphone ?? '',
  };

  const normalizedPhone = normalizePhone(billing.cellphone || billing.phone);

  return { billingAddress, normalizedPhone };
}
