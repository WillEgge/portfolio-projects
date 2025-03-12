export type ErrorProps = {
  error: Error;
  reset: () => void;
};

export type ProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  enableSystem?: boolean;
};
