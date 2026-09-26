import { SessionPort } from "@/application/ports/session.port";
import { UserRepository } from "@/application/ports/user.repository";
import { AuthService } from "@/application/services/auth.service";
import bcrypt from "bcrypt";

jest.mock("bcrypt");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fake-token"),
}));

describe("AuthService", () => {
  const userRecord = {
    id: "u1",
    email: "test@example.com",
    username: "test",
    password: "hashed",
    createdAt: new Date(),
  };

  let userRepository: jest.Mocked<UserRepository>;
  let session: jest.Mocked<SessionPort>;
  let service: AuthService;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      existsById: jest.fn(),
      create: jest.fn(),
    };
    session = {
      create: jest.fn(),
      destroy: jest.fn(),
      updateLastActivity: jest.fn(),
      validate: jest.fn(),
    };
    service = new AuthService(userRepository);
    jest.clearAllMocks();
  });

  it("register creates user, session and returns token", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(userRecord);
    session.create.mockResolvedValue();

    const result = await service.register(
      {
        email: "test@example.com",
        password: "password",
        username: "test",
      },
      session
    );

    expect(result.token).toBe("fake-token");
    expect(result.user).toEqual({
      id: "u1",
      email: "test@example.com",
      username: "test",
    });
    expect(session.create).toHaveBeenCalledWith("u1");
  });

  it("register throws when email already exists", async () => {
    userRepository.findByEmail.mockResolvedValue(userRecord);

    await expect(
      service.register(
        {
          email: "test@example.com",
          password: "password",
          username: "test",
        },
        session
      )
    ).rejects.toMatchObject({
      message: "Un utilisateur avec cet email existe déjà",
      statusCode: 400,
    });
  });

  it("login succeeds with valid credentials", async () => {
    userRepository.findByEmail.mockResolvedValue(userRecord);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    session.create.mockResolvedValue();

    const result = await service.login(
      { email: "test@example.com", password: "password" },
      session
    );

    expect(result.token).toBe("fake-token");
    expect(session.create).toHaveBeenCalledWith("u1");
  });

  it("login fails with wrong password", async () => {
    userRepository.findByEmail.mockResolvedValue(userRecord);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login(
        { email: "test@example.com", password: "wrong" },
        session
      )
    ).rejects.toMatchObject({
      message: "Email ou mot de passe incorrect",
      statusCode: 401,
    });
  });

  it("logout destroys session", async () => {
    session.destroy.mockResolvedValue();
    await service.logout(session);
    expect(session.destroy).toHaveBeenCalled();
  });

  it("getCurrentUser returns user", async () => {
    userRepository.findById.mockResolvedValue({
      id: "u1",
      email: "test@example.com",
      username: "test",
      createdAt: userRecord.createdAt,
    });

    await expect(service.getCurrentUser("u1")).resolves.toMatchObject({
      id: "u1",
      email: "test@example.com",
    });
  });

  it("getCurrentUser throws when missing", async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(service.getCurrentUser("missing")).rejects.toMatchObject({
      message: "Utilisateur non trouvé",
      statusCode: 404,
    });
  });
});
