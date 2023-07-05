export type Message = {
  type?: string;
  data?: string;
  id?: number;
};

export type User = {
  id?: string;
  name: string;
  password: string;
};
