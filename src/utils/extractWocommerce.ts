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

export interface ShippingAddress {
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
  phone: string;
}

export interface LineItemImage {
  id: string | number;
  src: string;
}

export interface LineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: any[];
  meta_data: any[];
  sku: string;
  global_unique_id: string;
  price: number;
  image?: LineItemImage;
  parent_name: string | null;
}

export interface ExtractedShipping {
  shippingAddress: ShippingAddress;
  normalizedPhone: string | null;
}

export interface PaymentInfo {
  paymentMethodTitle: string;
  installments: number | null;
  installmentAmount: number | null;
  couponDiscount: number;
  pixDiscount: number;
  shippingTotal: number;
}

export interface PaymentCustomFieldSelection {
  paymentType: 'pix' | 'card' | 'other';
  optionId: string | null;
  installments: number | null;
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

// Extrai campos de shipping e inclui telefone normalizado.
export function extractShipping(order: any): ExtractedShipping {
  const shipping = order?.shipping ?? {};
  const billing = order?.billing ?? {};

  const shippingAddress: ShippingAddress = {
    firstName: shipping.first_name ?? '',
    lastName: shipping.last_name ?? '',
    company: shipping.company ?? '',
    address1: shipping.address_1 ?? '',
    address2: shipping.address_2 ?? '',
    city: shipping.city ?? '',
    state: shipping.state ?? '',
    postcode: shipping.postcode ?? '',
    country: shipping.country ?? '',
    number: shipping.number ?? '',
    neighborhood: shipping.neighborhood ?? '',
    phone: shipping.phone ?? '',
  };

  const normalizedPhone = normalizePhone(shipping.phone || billing.cellphone || billing.phone);

  return { shippingAddress, normalizedPhone };
}

export function extractLineItems(order: any): LineItem[] {
  const items = Array.isArray(order?.line_items) ? order.line_items : [];
  return items.map((item: any) => ({
    id: Number(item?.id) || 0,
    name: item?.name ?? '',
    product_id: Number(item?.product_id) || 0,
    variation_id: Number(item?.variation_id) || 0,
    quantity: Number(item?.quantity) || 0,
    tax_class: item?.tax_class ?? '',
    subtotal: item?.subtotal ?? '0',
    subtotal_tax: item?.subtotal_tax ?? '0',
    total: item?.total ?? '0',
    total_tax: item?.total_tax ?? '0',
    taxes: Array.isArray(item?.taxes) ? item.taxes : [],
    meta_data: Array.isArray(item?.meta_data) ? item.meta_data : [],
    sku: item?.sku ?? '',
    global_unique_id: item?.global_unique_id ?? '',
    price: Number(item?.price) || 0,
    image: item?.image ? { id: item.image.id, src: item.image.src } : undefined,
    parent_name: item?.parent_name ?? null
  }));
}

function parseNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const text = String(value).trim();
  if (!text) return 0;
  const hasComma = text.includes(',');
  const hasDot = text.includes('.');
  let normalized = text;
  if (hasComma && hasDot) {
    if (text.lastIndexOf(',') > text.lastIndexOf('.')) {
      normalized = text.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = text.replace(/,/g, '');
    }
  } else if (hasComma) {
    normalized = text.replace(',', '.');
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findMetaValue(metaData: any[], keyPattern: RegExp): any {
  const item = (metaData || []).find((m: any) => keyPattern.test(String(m?.key ?? '')));
  return item?.value;
}

export function extractPaymentInfo(order: any): PaymentInfo {
  const metaData = order?.meta_data ?? [];
  const paymentMethodTitle = order?.payment_method_title ?? '';

  const installmentsRaw =
    findMetaValue(metaData, /installments$/i) ?? findMetaValue(metaData, /mp_installments/i);
  const installmentAmountRaw =
    findMetaValue(metaData, /installment_amount$/i) ??
    findMetaValue(metaData, /mp_transaction_details/i);

  const couponLines = Array.isArray(order?.coupon_lines) ? order.coupon_lines : [];
  const couponDiscount = couponLines.reduce((sum: number, item: any) => {
    return sum + parseNumber(item?.discount);
  }, 0);

  const feeLines = Array.isArray(order?.fee_lines) ? order.fee_lines : [];
  const pixFeeLine = feeLines.find((f: any) =>
    String(f?.name ?? '').toLowerCase().includes('desconto')
  );
  const pixDiscount = pixFeeLine ? Math.abs(parseNumber(pixFeeLine?.total ?? pixFeeLine?.amount)) : 0;

  const shippingLines = Array.isArray(order?.shipping_lines) ? order.shipping_lines : [];
  const shippingTotal = shippingLines.reduce((sum: number, item: any) => {
    return sum + parseNumber(item?.total);
  }, 0);

  return {
    paymentMethodTitle,
    installments: installmentsRaw ? parseNumber(installmentsRaw) : null,
    installmentAmount: installmentAmountRaw ? parseNumber(installmentAmountRaw) : null,
    couponDiscount,
    pixDiscount,
    shippingTotal
  };
}

const PAYMENT_OPTION_IDS = {
  pixCredito10x: 'a7d55397-40f6-4c66-92cb-f78363bcafcd',
  pixVista: '30753863-e400-49a4-9924-594de23ce246',
  debito: 'bd014959-efed-47ce-96a6-1f7bfc37d64d',
  creditoVista: '11c7fa7e-d222-4938-88a3-5a34c4e73dc6',
  credito1x: '54c8c965-d50b-419a-942d-beec3d01cbb4',
  credito2x: '10c008f5-be17-4f64-a893-9c9b4cc1a6cc',
  credito3x: 'a52251be-6ee2-493c-bf10-e6f9e83aaa8f',
  credito4x: '16a24f83-ba9d-4c59-b30c-baac198448aa',
  credito5x: '5f25805d-9c04-49a5-a98a-7ad88208c252',
  credito6x: 'da531f2a-c113-441a-932c-796e3c52ad7b',
  credito7x: 'bdc6c970-ca1d-417d-9f20-a8cdf052ddf9',
  credito8x: '01f330f6-2469-4640-bafe-c6121261c31e',
  credito9x: 'cee3fcac-872e-4d15-95b4-64fc1a6a5758',
  credito10x: '59b2274a-eff1-424b-8879-cad2589fbc1f',
  credito11x: '499cf218-90ce-4586-b91a-7539909a8ced',
  credito12x: '82fb2836-dc20-40c4-be3d-a35423ed06fe',
  credito13x: 'b40d980e-0827-48f8-ac5d-a12d140b5ba6',
  credito14x: '4c6da605-705e-4dd6-826e-e0e70779cbfe',
  dinheiro: '560f4902-ad7f-448f-9a3a-4b18c735113c'
};

function normalizeText(value: any): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function extractInstallments(order: any): number | null {
  const metaData = order?.meta_data ?? [];
  const raw =
    findMetaValue(metaData, /installments$/i) ?? findMetaValue(metaData, /mp_installments/i);
  const parsed = parseNumber(raw);
  return parsed > 0 ? parsed : null;
}

export function selectPaymentCustomField(order: any): PaymentCustomFieldSelection {
  const paymentMethodTitle = order?.payment_method_title ?? '';
  const paymentMethod = order?.payment_method ?? '';
  const titleNorm = normalizeText(paymentMethodTitle);
  const methodNorm = normalizeText(paymentMethod);

  const isPix = titleNorm.includes('pix') || methodNorm.includes('pix');
 // const hasDebit = titleNorm.includes('debito');
  const hasCredit = titleNorm.includes('cartao de credito e debito');
  const hasCash = titleNorm.includes('dinheiro');
  const installments = extractInstallments(order);

  if (isPix && /pix.*10x/.test(titleNorm)) {
    return { paymentType: 'pix', optionId: PAYMENT_OPTION_IDS.pixCredito10x, installments };
  }

  if (isPix) {
    return { paymentType: 'pix', optionId: PAYMENT_OPTION_IDS.pixVista, installments };
  }
/*
  if (hasDebit) {
    return { paymentType: 'other', optionId: PAYMENT_OPTION_IDS.debito, installments };
  }
*/
  if (hasCash) {
    return { paymentType: 'other', optionId: PAYMENT_OPTION_IDS.dinheiro, installments };
  }

  if (hasCredit || installments !== null) {
    const mapByInstallments: Record<number, string> = {
      1: PAYMENT_OPTION_IDS.credito1x,
      2: PAYMENT_OPTION_IDS.credito2x,
      3: PAYMENT_OPTION_IDS.credito3x,
      4: PAYMENT_OPTION_IDS.credito4x,
      5: PAYMENT_OPTION_IDS.credito5x,
      6: PAYMENT_OPTION_IDS.credito6x,
      7: PAYMENT_OPTION_IDS.credito7x,
      8: PAYMENT_OPTION_IDS.credito8x,
      9: PAYMENT_OPTION_IDS.credito9x,
      10: PAYMENT_OPTION_IDS.credito10x,
      11: PAYMENT_OPTION_IDS.credito11x,
      12: PAYMENT_OPTION_IDS.credito12x,
      13: PAYMENT_OPTION_IDS.credito13x,
      14: PAYMENT_OPTION_IDS.credito14x
    };
    if (installments && mapByInstallments[installments]) {
      return { paymentType: 'card', optionId: mapByInstallments[installments], installments };
    }
    return { paymentType: 'card', optionId: PAYMENT_OPTION_IDS.creditoVista, installments };
  }

  return { paymentType: 'other', optionId: null, installments };
}
