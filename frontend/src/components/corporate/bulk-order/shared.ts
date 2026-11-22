import type { OrgType } from "../orderData";

export interface Draft {
  orgType: OrgType;
  productValue: string;
  specChoices: Record<string, string>;
  quantity: string;
  neededBy: string;
  notes: string;
  orgName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  gstNumber: string;
}

export type FieldName = "orgName" | "contactPerson" | "email" | "phone" | "city" | "gstNumber";

export const WHATSAPP = "https://wa.me/919741808034";

