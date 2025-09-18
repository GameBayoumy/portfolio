/**
 * Minimal ambient type shims that allow the project to type-check when
 * third-party type packages are unavailable in offline environments.
 */

declare const process: {
  env: Record<string, string | undefined>;
};

declare function require(moduleName: string): any;

declare const module: { exports: any };

declare const global: any;

declare module 'react' {
  export type ReactNode = any;
  export type ReactElement = any;
  export interface CSSProperties {
    [key: string]: string | number | undefined;
  }
  export interface ErrorInfo {
    componentStack: string;
  }
  export interface FC<P = {}> {
    (props: P & { children?: ReactNode }): ReactElement | null;
  }
  export interface ComponentType<P = {}> {
    (props: P): ReactElement | null;
  }
  export interface PropsWithChildren<P = {}> extends P {
    children?: ReactNode;
  }
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type MutableRefObject<T> = { current: T };
  export type RefObject<T> = MutableRefObject<T | null>;
  export function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  export function createContext<T>(defaultValue: T): any;
  export function useContext<T>(context: any): T;
  export function useState<S>(initialState: S): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(effect: (...args: any[]) => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps?: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T;
  export function useRef<T>(initialValue: T | null): MutableRefObject<T | null>;
  export function useLayoutEffect(effect: (...args: any[]) => void | (() => void), deps?: any[]): void;
  export function useReducer<R extends (state: any, action: any) => any, I>(
    reducer: R,
    initialState: I
  ): [ReturnType<R>, Dispatch<Parameters<R>[1]>];
  export function forwardRef<T, P = {}>(render: (props: P, ref: any) => ReactElement | null): any;
  export function memo<T>(component: T, propsAreEqual?: (...args: any[]) => boolean): T;
  export function lazy<T extends (...args: any[]) => Promise<{ default: ComponentType<any> }>>(
    factory: T
  ): ComponentType<any>;
  export const Fragment: any;
  export const Suspense: any;
  export const Children: any;
  const React: {
    createElement: typeof createElement;
    Fragment: typeof Fragment;
  };
  export default React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-dom' {
  const ReactDOM: any;
  export const createPortal: any;
  export default ReactDOM;
}

declare module 'react-dom/client' {
  export const createRoot: any;
}

declare module 'react-dom/server' {
  export const renderToString: any;
}

declare namespace JSX {
  type Element = any;
  interface ElementClass {
    render?: (...args: any[]) => any;
  }
  interface ElementAttributesProperty {
    props: any;
  }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface IntrinsicAttributes {
    [attribute: string]: any;
  }
}

declare module 'clsx' {
  export type ClassValue = any;
  const clsx: (...values: ClassValue[]) => string;
  export { clsx };
  export default clsx;
}

declare module 'tailwind-merge' {
  export const twMerge: (...values: any[]) => string;
}

declare module 'tailwindcss' {
  export interface Config {
    content?: string[];
    theme?: Record<string, any>;
    plugins?: any[];
    [key: string]: any;
  }
  const config: Config;
  export default config;
}

declare module 'axios' {
  export interface AxiosResponse<T = any> {
    data: T;
    status?: number;
  }
  export interface AxiosError<T = any> extends Error {
    response?: {
      status?: number;
      data?: T;
    };
  }
  export function get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
  export function isAxiosError<T = any>(payload: unknown): payload is AxiosError<T>;
  const axios: {
    get: typeof get;
    isAxiosError: typeof isAxiosError;
  };
  export default axios;
}

declare module 'three' {
  export class Vector3 {
    constructor(...args: any[]);
  }
  export class Euler {
    constructor(...args: any[]);
  }
  export class Color {
    constructor(...args: any[]);
  }
  export class Texture {}
  export class Group {
    add(...objects: any[]): void;
  }
  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    constructor(...args: any[]);
    setSize(width: number, height: number): void;
    render(scene: any, camera: any): void;
    dispose(): void;
  }
  export const MathUtils: Record<string, (...args: any[]) => any>;
  const THREE: Record<string, any> & {
    Vector3: typeof Vector3;
    Euler: typeof Euler;
    Color: typeof Color;
    Texture: typeof Texture;
    Group: typeof Group;
    WebGLRenderer: typeof WebGLRenderer;
    MathUtils: typeof MathUtils;
  };
  export default THREE;
}

declare module '@testing-library/react' {
  export const render: any;
  export const screen: any;
  export const fireEvent: any;
  export function act(callback: () => void | Promise<void>): Promise<void>;
}

declare module '@testing-library/dom' {
  export const screen: any;
}

declare module '@testing-library/user-event' {
  const userEvent: any;
  export default userEvent;
}

declare module '@hookform/resolvers' {
  export const zodResolver: any;
}

declare module 'react-hook-form' {
  export const useForm: any;
  export const Controller: any;
}

declare module '@radix-ui/react-toast' {
  export const ToastProvider: any;
  export const ToastViewport: any;
  export const Toast: any;
  export const ToastTitle: any;
  export const ToastDescription: any;
}

declare module '@tanstack/react-query' {
  export const QueryClient: any;
  export const QueryClientProvider: any;
  export function useQuery(key: any, fn: any, options?: any): any;
}

declare module 'zustand' {
  const create: any;
  export default create;
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module 'leva' {
  const leva: any;
  export default leva;
}

declare module '@react-three/fiber' {
  export const Canvas: any;
  export const extend: any;
  export const useFrame: any;
  export const useLoader: any;
  export const useThree: any;
}

declare module '@react-three/drei' {
  const drei: any;
  export default drei;
}

declare module '@react-three/postprocessing' {
  const postprocessing: any;
  export default postprocessing;
}

declare module '@heroicons/react' {
  export const Icon: any;
}

declare module 'next-themes' {
  export const ThemeProvider: any;
  export function useTheme(): { theme: string | undefined; setTheme: (value: string) => void };
}

declare module 'next' {
  const nextModule: any;
  export default nextModule;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): any;
}

declare module 'next/image' {
  const NextImage: any;
  export default NextImage;
}

declare module 'next/server' {
  export const NextResponse: any;
}

declare module 'three-stdlib' {
  const threeStdlib: any;
  export default threeStdlib;
}

declare module 'swr' {
  const swr: any;
  export default swr;
}

declare module '*';

type JestLikeTestFn = (name: string, fn: (...args: any[]) => any, timeout?: number) => void;

declare const describe: JestLikeTestFn;
declare const it: JestLikeTestFn;
declare const test: JestLikeTestFn;
declare const beforeAll: (fn: (...args: any[]) => any, timeout?: number) => void;
declare const afterAll: (fn: (...args: any[]) => any, timeout?: number) => void;
declare const beforeEach: (fn: (...args: any[]) => any, timeout?: number) => void;
declare const afterEach: (fn: (...args: any[]) => any, timeout?: number) => void;
declare const expect: any;
declare const jest: any;
