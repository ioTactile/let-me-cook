export interface SessionData {
  userId: string;
  createdAt: Date;
  lastActivity: Date;
}

/** Port session — indépendant d'Express. */
export interface SessionPort {
  create(userId: string): Promise<void>;
  destroy(): Promise<void>;
  updateLastActivity(): Promise<void>;
  validate(): Promise<boolean>;
}

export type SessionFactory = (sessionStore: {
  get userId(): string | undefined;
  set userId(value: string);
  get createdAt(): Date | undefined;
  set createdAt(value: Date);
  get lastActivity(): Date | undefined;
  set lastActivity(value: Date);
  destroy(callback: (err?: Error) => void): void;
}) => SessionPort;
