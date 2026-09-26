import { ApplianceRepository } from "@/application/ports/appliance.repository";
import { ApplianceService } from "@/application/services/appliance.service";
import { AppError } from "@/domain/errors/app-error";
import { Appliance } from "@/types/appliance.types";

describe("ApplianceService", () => {
  const appliance: Appliance = {
    id: "a1",
    userId: "u1",
    name: "Four",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let repository: jest.Mocked<ApplianceRepository>;
  let service: ApplianceService;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new ApplianceService(repository);
  });

  it("getApplianceById returns appliance when found", async () => {
    repository.findById.mockResolvedValue(appliance);
    await expect(service.getApplianceById("a1")).resolves.toEqual(appliance);
  });

  it("getApplianceById throws 404 when missing", async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getApplianceById("missing")).rejects.toMatchObject({
      message: "Appareil non trouvé",
      statusCode: 404,
    } satisfies Partial<AppError>);
  });

  it("getAppliances delegates to repository", async () => {
    repository.findAllByUser.mockResolvedValue([appliance]);
    await expect(service.getAppliances("u1")).resolves.toEqual([appliance]);
    expect(repository.findAllByUser).toHaveBeenCalledWith("u1");
  });

  it("createAppliance delegates to repository", async () => {
    const dto = { userId: "u1", name: "Four", description: null };
    repository.create.mockResolvedValue(appliance);
    await expect(service.createAppliance(dto)).resolves.toEqual(appliance);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });
});
