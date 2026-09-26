import { Appliance, CreateApplianceDto, UpdateApplianceDto } from '@/types/appliance.types';

export interface ApplianceRepository {
  create(data: CreateApplianceDto): Promise<Appliance>;
  findAllByUser(userId: string): Promise<Appliance[]>;
  findById(id: string): Promise<Appliance | null>;
  update(id: string, data: UpdateApplianceDto): Promise<Appliance>;
  delete(id: string): Promise<void>;
}
