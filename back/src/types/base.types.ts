export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseModel {
  email: string;
  username: string;
  password: string;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}
