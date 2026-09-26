import { ApplianceRepository } from '@/application/ports/appliance.repository';
import { AppError } from '@/domain/errors/app-error';
import { Appliance, CreateApplianceDto, UpdateApplianceDto } from '@/types/appliance.types';

export class ApplianceService {
  constructor(private readonly applianceRepository: ApplianceRepository) {}

  async createAppliance(applianceData: CreateApplianceDto): Promise<Appliance> {
    try {
      return await this.applianceRepository.create(applianceData);
    } catch (error) {
      console.log('error create appliance', error);
      throw new AppError("Erreur lors de la création de l'appareil", 500);
    }
  }

  async getAppliances(userId: string): Promise<Appliance[]> {
    try {
      return await this.applianceRepository.findAllByUser(userId);
    } catch {
      throw new AppError('Erreur lors de la récupération des appareils', 500);
    }
  }

  async getApplianceById(id: string): Promise<Appliance> {
    const appliance = await this.applianceRepository.findById(id);
    if (!appliance) {
      throw new AppError('Appareil non trouvé', 404);
    }
    return appliance;
  }

  async updateAppliance(id: string, applianceData: UpdateApplianceDto): Promise<Appliance> {
    try {
      return await this.applianceRepository.update(id, applianceData);
    } catch (error) {
      console.log('error update appliance', error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la mise à jour de l'appareil", 500);
    }
  }

  async deleteAppliance(id: string): Promise<void> {
    try {
      await this.applianceRepository.delete(id);
    } catch (error) {
      console.log('error delete appliance', error);
      throw new AppError("Erreur lors de la suppression de l'appareil", 500);
    }
  }
}
