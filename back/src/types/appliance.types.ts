import { BaseModel } from "@/types/base.types";

export interface Appliance extends BaseModel {
  userId: string;
  name: string;
  description: string | null;
}

export interface CreateApplianceDto {
  userId: string;
  name: string;
  description: string | null;
}

export type UpdateApplianceDto = Partial<CreateApplianceDto>;
