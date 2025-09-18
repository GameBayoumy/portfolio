declare namespace React {
  type ReactNode = any;
  interface FormEvent<T = Element> {
    preventDefault(): void;
    target: T;
  }
  interface ChangeEvent<T = Element> {
    target: T & { name: string; value: string };
  }
  type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactNode;
  type ComponentType<P = any> = (props: P & { children?: ReactNode }) => ReactNode;
}

declare module 'react' {
  export type ReactNode = React.ReactNode;
  export type FormEvent<T = Element> = React.FormEvent<T>;
  export type ChangeEvent<T = Element> = React.ChangeEvent<T>;
  export function useState<S>(initialState: S): [S, (value: S | ((prev: S) => S)) => void];
  export function useEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  export const Fragment: any;
  const React: {
    useState: typeof useState;
    useEffect: typeof useEffect;
    Fragment: any;
  };
  export default React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'framer-motion' {
  export const motion: any;
}

declare module 'react-intersection-observer' {
  export function useInView(options?: any): { ref: (node: any) => void; inView: boolean; entry?: IntersectionObserverEntry };
}

declare module 'lucide-react' {
  export const Mail: any;
  export const MapPin: any;
  export const Clock: any;
  export const Send: any;
  export const Github: any;
  export const Linkedin: any;
  export const ExternalLink: any;
  export const CheckCircle: any;
  export const AlertCircle: any;
}

declare module 'next/server' {
  export const NextResponse: {
    json: (body: any, init?: { status?: number }) => any;
  };
}

declare module 'zod' {
  namespace z {
    type infer<T> = any;
  }

  const z: any;
  export { z };
  export type infer<T> = any;
  export default z;
}

declare const process: {
  env: Record<string, string | undefined>;
};
