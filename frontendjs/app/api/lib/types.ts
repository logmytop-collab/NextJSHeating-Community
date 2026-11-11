export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  createdAt: Date;
}

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: Omit<User, "password">;
  accessToken?: string;
}

export interface AppUser {
  id: number;
  username: string;
  email: string;
  rooms: Room[];
}

export interface Room {
  id: number;
  name: string;
  size: number;
  targetTemperature: number;
  strangs: Strang[];
  thermostats: Thermostat[];
}

export enum StrangState {
  disabled = 0,
  enabled = 1,
  movingUp = 2,
  movingDown = 4,
}

export interface Strang {
  id: number;
  name: string;
  pin1: number;
  pin2: number;
  currentPos: number;
  maxPos: number;
  openPos: number;
  closePos: number;
  state: StrangState;
  room_Id: number;
}

export interface Thermostat {
  id: number;
  name: string;
  temperature: number;
  humidity: number;
  battery: number;
  deviceID: string;
  room_id: number;
  room: string;
  updatedAt: Date;
}
