/* eslint-disable @typescript-eslint/no-explicit-any */
// Ambient module fallbacks for third-party dependencies when their published
// type definitions are unavailable. These shims intentionally prioritise
// permissive `any` typings to keep the project compiling in offline tooling
// environments.

declare module 'clsx' {
  export type ClassValue = any;
  export function clsx(...inputs: ClassValue[]): string;
  export default clsx;
}

declare module 'tailwind-merge' {
  export function twMerge(...classLists: Array<string | null | undefined | false>): string;
}

declare module 'tailwindcss' {
  export interface Config {
    [key: string]: any;
  }
  const config: Config;
  export default config;
}

declare module 'tailwindcss-animate' {
  const plugin: any;
  export default plugin;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    url?: string;
    method?: string;
    headers?: Record<string, any>;
    timeout?: number;
    params?: Record<string, any>;
    data?: any;
    baseURL?: string;
    [key: string]: any;
  }

  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, any>;
    config: AxiosRequestConfig;
    request?: any;
  }

  export interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
    toJSON(): Record<string, any>;
  }

  export interface AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    create(config?: AxiosRequestConfig): AxiosInstance;
  }

  export interface AxiosStatic extends AxiosInstance {
    AxiosError: { new <T = any>(message?: string): AxiosError<T> };
    isAxiosError(payload: unknown): payload is AxiosError;
  }

  declare const axios: AxiosStatic;
  export default axios;
  export { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance };
}

declare module '@testing-library/react' {
  export const render: (...args: any[]) => any;
  export const screen: Record<string, any>;
  export const fireEvent: Record<string, any>;
}

declare module '@testing-library/dom' {
  export const screen: Record<string, any>;
  export const fireEvent: Record<string, any>;
  export const waitFor: (...args: any[]) => Promise<any>;
  export const within: (...args: any[]) => any;
}

declare module '@testing-library/user-event' {
  const userEvent: any;
  export default userEvent;
}

declare module '@heroicons/react/24/outline' {
  const icons: Record<string, React.ComponentType<any>>;
  export default icons;
}

declare module '@heroicons/react/24/solid' {
  const icons: Record<string, React.ComponentType<any>>;
  export default icons;
}

declare module '@radix-ui/react-toast' {
  export const ToastProvider: React.FC<any>;
  export const ToastViewport: React.FC<any>;
  export const Toast: React.FC<any>;
  export const ToastTitle: React.FC<any>;
  export const ToastDescription: React.FC<any>;
  export const ToastClose: React.FC<any>;
}

declare module 'next/image' {
  const Image: React.FC<any>;
  export default Image;
}

declare module 'next/link' {
  const Link: React.FC<any>;
  export default Link;
}

declare module 'next/navigation' {
  export const useRouter: () => { push: (path: string) => void; replace: (path: string) => void };
  export const usePathname: () => string;
  export const useSearchParams: () => URLSearchParams;
  export const redirect: (path: string) => void;
}

declare module 'next/head' {
  const Head: React.FC<any>;
  export default Head;
}

declare module 'next/script' {
  const Script: React.FC<any>;
  export default Script;
}

declare module 'next-themes' {
  export const ThemeProvider: React.FC<any>;
  export const useTheme: () => { theme: string; setTheme: (theme: string) => void };
}

declare module 'next/server' {
  export class NextRequest extends Request {
    nextUrl: URL;
  }

  export class NextResponse<T = any> extends Response {
    static json(body: any, init?: ResponseInit & { headers?: Record<string, string> }): NextResponse;
    constructor(body?: BodyInit | null, init?: ResponseInit);
  }
}

declare module 'zustand' {
  export type StateCreator<T> = (set: any, get: any, api: any) => T;
  export function create<T>(creator: StateCreator<T>): () => T & Record<string, any>;
}

declare module 'framer-motion' {
  export const motion: Record<string, React.FC<any>>;
  export const AnimatePresence: React.FC<any>;
  export const useAnimationControls: () => any;
  export function useMotionValue<T = number>(initial: T): any;
  export function useSpring(value: any, config?: Record<string, any>): any;
}

declare module 'leva' {
  export const useControls: (...args: any[]) => any;
}

declare module '@tanstack/react-query' {
  export const useQuery: (...args: any[]) => any;
  export const QueryClient: new (config?: any) => any;
  export const QueryClientProvider: React.FC<any>;
}

declare module 'date-fns' {
  export function format(date: Date, formatStr: string): string;
  export function subDays(date: Date, amount: number): Date;
  export function subMonths(date: Date, amount: number): Date;
  export function eachDayOfInterval(interval: { start: Date; end: Date }): Date[];
  export function formatDistanceToNow(date: Date, options?: Record<string, any>): string;
}

declare module 'swr' {
  const useSWR: any;
  export default useSWR;
}

declare module 'next' {
  export interface Metadata {
    [key: string]: any;
  }
}

declare module 'next/font/google' {
  export function Inter(options?: Record<string, any>): {
    className: string;
    variable?: string;
    style?: Record<string, any>;
  };
}
