export interface UserRecord {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  username: string;
  createdAt?: Date;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserPublic | null>;
  existsById(id: string): Promise<boolean>;
  create(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<UserRecord>;
}
