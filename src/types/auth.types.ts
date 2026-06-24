export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  role?: string;
  hasPassword?: boolean;  
  mfaEnabled?: boolean;   
}

export interface AuthState {
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  setUser: React.Dispatch<
    React.SetStateAction<User | null>
  >;
}