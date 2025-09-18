/* eslint-disable @typescript-eslint/no-explicit-any */
// Extremely lightweight D3 type shims that surface the chainable APIs used in
// the project while defaulting all datum and event types to `any`. This allows
// the TypeScript compiler to contextualise callback parameters without raising
// implicit `any` errors when the real `@types/d3` package is unavailable.

declare module 'd3' {
  export interface Selection<GElement = any, Datum = any, PElement = any, PDatum = any> {
    attr(name: string, value: any): Selection<GElement, Datum, PElement, PDatum>;
    attr(
      name: string,
      value: (this: GElement, datum: Datum, index: number, groups: GElement[]) => any
    ): Selection<GElement, Datum, PElement, PDatum>;
    style(name: string, value: any): Selection<GElement, Datum, PElement, PDatum>;
    style(
      name: string,
      value: (this: GElement, datum: Datum, index: number, groups: GElement[]) => any
    ): Selection<GElement, Datum, PElement, PDatum>;
    text(value: any): Selection<GElement, Datum, PElement, PDatum>;
    text(
      value: (this: GElement, datum: Datum, index: number, groups: GElement[]) => any
    ): Selection<GElement, Datum, PElement, PDatum>;
    html(value: any): Selection<GElement, Datum, PElement, PDatum>;
    data(
      data:
        | Datum[]
        | ((datum: Datum, index: number, groups: Datum[]) => Datum[]),
      key?: (datum: Datum, index: number) => any
    ): Selection<GElement, Datum, PElement, PDatum>;
    enter(): Selection<GElement, Datum, PElement, PDatum>;
    exit(): Selection<GElement, Datum, PElement, PDatum>;
    append(name: string): Selection<GElement, Datum, PElement, PDatum>;
    select(selector: string): Selection;
    selectAll(selector: string): Selection;
    join(...args: any[]): Selection;
    call(fn: any, ...args: any[]): Selection;
    on(type: string, listener: (event: any, datum: Datum) => any): Selection;
    transition(): Selection;
    duration(ms: number): Selection;
    ease(easing: any): Selection;
    delay(
      value: number | ((this: GElement, datum: Datum, index: number, groups: GElement[]) => number)
    ): Selection;
    datum(value?: Datum | ((this: GElement, datum: Datum, index: number, groups: GElement[]) => Datum)):
      Selection<GElement, Datum, PElement, PDatum>;
    lower(): Selection;
    remove(): Selection;
    merge(other: Selection): Selection;
    each(callback: (this: GElement, datum: Datum, index: number, groups: GElement[]) => void): Selection;
  }

  export interface DragBehavior<GElement = any, Datum = any> {
    on(type: string, listener: (event: any, datum: Datum) => any): DragBehavior<GElement, Datum>;
  }

  export type ScaleLinear<Output = number> = {
    (value: number): Output;
    domain(values: number[]): ScaleLinear<Output>;
    range(values: Output[]): ScaleLinear<Output>;
    clamp(value?: boolean): ScaleLinear<Output>;
    nice(count?: number): ScaleLinear<Output>;
    ticks(count?: number): number[];
    tickFormat(count?: number, specifier?: string): (value: number) => string;
  };

  export type ScaleBand = {
    (value: string): number | undefined;
    domain(values: string[]): ScaleBand;
    range(values: number[]): ScaleBand;
    padding(value: number): ScaleBand;
    bandwidth(): number;
  };

  export type ScalePoint<Domain = string> = {
    (value: Domain): number | undefined;
    domain(values: Domain[]): ScalePoint<Domain>;
    range(values: number[]): ScalePoint<Domain>;
    padding(value: number): ScalePoint<Domain>;
    bandwidth(): number;
  };

  export type ScaleTime<Output = number> = {
    (value: Date): Output;
    domain(values: Date[]): ScaleTime<Output>;
    range(values: Output[]): ScaleTime<Output>;
    clamp(value?: boolean): ScaleTime<Output>;
    nice(count?: number): ScaleTime<Output>;
    ticks(count?: number): Date[];
    tickFormat(count?: number, specifier?: string): (value: Date) => string;
    invert(value: Output extends number ? Output : number): Date;
  };

  export type ScaleOrdinal<Domain = any, Range = any> = {
    (value: Domain): Range;
    domain(values: Domain[]): ScaleOrdinal<Domain, Range>;
    range(values: Range[]): ScaleOrdinal<Domain, Range>;
  };

  export function select(selector: string | Element | Document | Window): Selection;
  export function selectAll(selector: string | ArrayLike<Element>): Selection;
  export function scaleLinear(): ScaleLinear;
  export function scaleBand(): ScaleBand;
  export function scalePoint<Domain = string>(): ScalePoint<Domain>;
  export function scaleTime<Output = number>(): ScaleTime<Output>;
  export function scaleOrdinal<Domain = any, Range = any>(range?: Range[]): ScaleOrdinal<Domain, Range>;
  export function scaleSequential<Output = any>(interpolator: (value: number) => Output): any;
  export function scaleSqrt(): any;
  export function max<T, U = number>(
    array: T[],
    accessor?: (value: T, index: number, array: T[]) => U
  ): U | undefined;
  export function min<T, U = number>(
    array: T[],
    accessor?: (value: T, index: number, array: T[]) => U
  ): U | undefined;
  export function extent<T, U = T>(
    array: T[],
    accessor?: (value: T, index: number, array: T[]) => U
  ): [U | undefined, U | undefined];
  export function timeFormat(specifier: string): (date: Date) => string;
  export function format(specifier: string): (value: number) => string;
  export function interpolateTurbo(t: number): string;
  export function interpolateCool(t: number): string;
  export function interpolateWarm(t: number): string;
  export function interpolateInferno(t: number): string;
  export function interpolateBlues(t: number): string;
  export function interpolatePurples(t: number): string;
  export function interpolateGreens(t: number): string;
  export function interpolateRainbow(t: number): string;
  export function interpolate(a: any, b: any): (t: number) => any;
  export function interpolateNumber(a: number, b: number): (t: number) => number;
  export function easeCubicInOut(t: number): number;
  export function line<T = any>(): any;
  export function area<T = any>(): any;
  export function arc<T = any>(): any;
  export function pie<T = any>(): any;
  export function stack<T = any>(): any;
  export function curveCatmullRom(alpha?: number): any;
  export const curveMonotoneX: any;
  export const curveCardinalClosed: any;
  export interface Axis<Domain = any> {
    (context?: Selection | null): void;
    scale(scale: any): Axis<Domain>;
    ticks(count?: number): Axis<Domain>;
    tickFormat(formatter: (value: Domain) => any): Axis<Domain>;
    tickValues(values: Domain[]): Axis<Domain>;
    tickSize(size: number): Axis<Domain>;
    tickSizeOuter(size: number): Axis<Domain>;
    tickPadding(padding: number): Axis<Domain>;
  }

  export function axisBottom(scale: any): Axis;
  export function axisLeft(scale: any): Axis;
  export function histogram(): any;
  export function bin(): any;
  export function range(start: number, stop?: number, step?: number): number[];
  export function forceSimulation(nodes?: any[]): any;
  export function forceManyBody(): any;
  export function forceCenter(x?: number, y?: number): any;
  export function forceLink(links?: any[]): any;
  export function drag<GElement = any, Datum = any>(): DragBehavior<GElement, Datum>;

  export interface ZoomBehavior<GElement = any, Datum = any> {
    (selection: Selection<GElement, Datum, any, any>): void;
    scaleExtent(extent: [number, number]): ZoomBehavior<GElement, Datum>;
    extent(extent: [[number, number], [number, number]]): ZoomBehavior<GElement, Datum>;
    on(type: string, listener: (event: any, datum: Datum) => any): ZoomBehavior<GElement, Datum>;
    transform(selection: Selection<GElement, Datum, any, any>, transform: any): void;
    filter(filterFn: (event: any) => boolean): ZoomBehavior<GElement, Datum>;
  }

  export function zoom<GElement = any, Datum = any>(): ZoomBehavior<GElement, Datum>;

  export interface BrushBehavior<Datum = any> {
    (selection: Selection<any, Datum, any, any>): void;
    extent(extent: [[number, number], [number, number]]): BrushBehavior<Datum>;
    on(type: string, listener: (event: any) => void): BrushBehavior<Datum>;
  }

  export function brushX<Datum = any>(): BrushBehavior<Datum>;
  export function brushY<Datum = any>(): BrushBehavior<Datum>;
  export function brush<Datum = any>(): BrushBehavior<Datum>;
  export const easeBackOut: {
    (t: number): number;
    overshoot(s: number): (t: number) => number;
  };

  export function group<T, K>(
    iterable: Iterable<T>,
    key: (value: T, index: number, iterable: Iterable<T>) => K
  ): Map<K, T[]>;

  export function rollup<T, K, V>(
    iterable: Iterable<T>,
    reduce: (values: T[]) => V,
    key: (value: T) => K
  ): Map<K, V>;

  interface TimeInterval {
    (date: Date): Date;
    floor(date: Date): Date;
    ceil(date: Date): Date;
    round(date: Date): Date;
    offset(date: Date, step?: number): Date;
    range(start: Date, stop: Date, step?: number): Date[];
    every(step: number): TimeInterval;
  }

  export const timeDay: TimeInterval & {
    offset(date: Date, step?: number): Date;
  };
  export const timeWeek: TimeInterval;
  export const timeMonth: TimeInterval;
  export const timeYear: TimeInterval;
}
