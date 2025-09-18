/* eslint-disable @typescript-eslint/no-explicit-any */
// Global fallback type declarations to enable offline type-checking when
// third-party @types packages are unavailable. These shims intentionally
// provide minimal structure and treat most values as `any` so that the
// project's source files can be type-checked without external dependencies.

declare namespace JSX {
  interface Element {}
  interface ElementClass {
    render?: any;
  }
  interface ElementAttributesProperty {
    props: any;
  }
  interface ElementChildrenAttribute {
    children: any;
  }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare namespace React {
  type Key = string | number;
  type ReactText = string | number;
  type ReactNode = any;
  type ReactElement<T = any, P = any> = any;
  type PropsWithChildren<P = {}> = P & { children?: ReactNode; key?: Key };

  interface Attributes {
    key?: Key;
  }

  interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  interface ErrorInfo {
    componentStack: string;
  }

  interface RefObject<T> {
    readonly current: T | null;
  }

  interface MutableRefObject<T> {
    current: T;
  }

  type RefCallback<T> = (instance: T | null) => void;
  type ForwardedRef<T> = RefCallback<T> | MutableRefObject<T> | null;

  class Component<P = {}, S = any> {
    constructor(props: P);
    props: P;
    state: S;
    setState(state: Partial<S> | ((prevState: S) => Partial<S> | null)): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
  }

  interface ComponentClass<P = {}, S = any> {
    new (props: P): Component<P, S>;
    displayName?: string;
    propTypes?: any;
    contextTypes?: any;
  }

  interface FunctionComponent<P = {}> {
    (props: PropsWithChildren<P>): ReactElement | null;
    displayName?: string;
    propTypes?: any;
    defaultProps?: Partial<P>;
  }

  type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
  type FC<P = {}> = FunctionComponent<P>;

  interface ForwardRefExoticComponent<P> extends ComponentType<P> {
    defaultProps?: Partial<P>;
    propTypes?: any;
  }

  interface RefAttributes<T> {
    ref?: ForwardedRef<T>;
  }

  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);

  interface Context<T> {
    Provider: ComponentType<{ value: T }>;
    Consumer: ComponentType<{ children: (value: T) => ReactNode }>;
    displayName?: string;
  }

  function createContext<T>(defaultValue: T): Context<T>;
  function useContext<T>(context: Context<T>): T;
  function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  function cloneElement(element: any, props?: any, ...children: any[]): ReactElement;

  function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  function useReducer<R extends (state: any, action: any) => any, I>(
    reducer: R,
    initialArg: I,
    init?: (arg: I) => ReturnType<R>
  ): [ReturnType<R>, Dispatch<Parameters<R>[1]>];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useMemo<T>(factory: () => T, deps?: any[]): T;
  function useCallback<T extends (...args: any[]) => any>(fn: T, deps?: any[]): T;
  function useRef<T>(initialValue: T): MutableRefObject<T>;
  function useRef<T>(initialValue: T | null): MutableRefObject<T | null>;
  function useRef<T = undefined>(): MutableRefObject<T | undefined>;
  function useImperativeHandle(ref: any, init: () => any, deps?: any[]): void;
  function useTransition(): [boolean, (callback: () => void) => void];
  function useDeferredValue<T>(value: T): T;
  function useId(): string;
  function startTransition(callback: () => void): void;
  function lazy<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
  ): ComponentType<any>;
  function memo<T extends ComponentType<any>>(
    component: T,
    propsAreEqual?: (prevProps: any, nextProps: any) => boolean
  ): T;
  function forwardRef<T, P = {}>(
    component: (props: P, ref: ForwardedRef<T>) => any
  ): ForwardRefExoticComponent<P & RefAttributes<T>>;

  const Fragment: unique symbol;
  const StrictMode: any;
  const Suspense: any;
  const Profiler: any;

  interface SyntheticEvent<T = Element, E = Event> {
    target: T;
    currentTarget: T;
    nativeEvent: E;
    preventDefault(): void;
    stopPropagation(): void;
  }

  interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {}
  interface MouseEvent<T = Element> extends SyntheticEvent<T, globalThis.MouseEvent> {
    button: number;
    clientX: number;
    clientY: number;
  }

  type ReactNodeArray = ReactNode[];
}

declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'react-dom' {
  const ReactDOM: any;
  export function createPortal(children: any, container: any): any;
  export default ReactDOM;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: React.ReactNode): void;
    unmount(): void;
  };
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react/jsx-dev-runtime' {
  export const jsxDEV: any;
  export const Fragment: any;
}

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
  cwd(): string;
  version: string;
  platform: string;
  uptime(): number;
  memoryUsage?: () => { heapUsed: number; [key: string]: number };
};

interface NodeRequire {
  (module: string): any;
  main?: { filename: string } | null;
}

declare const require: NodeRequire;

declare const module: any;

declare const __dirname: string;

declare const __filename: string;

declare const describe: any;

declare const it: any;

declare const test: any;

declare const expect: any;

declare const beforeAll: any;

declare const beforeEach: any;

declare const afterAll: any;

declare const afterEach: any;

declare const jest: any;

declare const global: any;

declare module '*';
