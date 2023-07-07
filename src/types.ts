export type Message = {
  type?: string;
  data?: string;
  id?: number;
};

export type User = {
  id?: string;
  name: string;
  password: string;
  victories: number;
};

export type Hit = 'miss' | 'killed' | 'shot';

export type Ship = {
  position: { x: number; y: number };
  direction: boolean;
  type?: 'small' | 'medium' | 'large' | 'huge';
  length: number;
  hitCapacity?: number;
};

export type ClientRegistrationPacketPayload = {
  name: string;
  password: string;
};

export type ServerRegistrationPacketPayload = {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
};
