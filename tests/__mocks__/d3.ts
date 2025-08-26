// Lightweight mock of d3 for Jest tests to avoid ESM/node_modules transform issues
// and heavy DOM/transition behavior. Only implements chainable no-ops used by the code.

type Chain = any;

const makeChain = (): Chain => {
  const chain: any = () => chain;
  const self = chain;

  // Chainable no-ops
  self.select = () => self;
  self.selectAll = () => self;
  self.remove = () => self;
  self.append = () => self;
  self.attr = () => self;
  self.style = () => self;
  self.text = () => self;
  self.call = (fn?: any, ...args: any[]) => {
    if (typeof fn === 'function') fn(self, ...args);
    return self;
  };
  self.transition = () => self;
  self.duration = () => self;
  self.delay = () => self;
  self.on = () => self;
  self.enter = () => ({ append: () => self });
  self.data = () => ({ enter: () => ({ append: () => self }) });
  return self;
};

export const select = () => makeChain();

// Scales return a function with chainable domain/range returning itself
const makeScale = () => {
  const fn: any = (x: any) => 0;
  fn.domain = () => fn;
  fn.range = () => fn;
  fn.padding = () => fn;
  return fn;
};

export const scaleTime = () => makeScale();
export const scalePoint = () => makeScale();

// axisBottom returns a function that can be passed to .call()
export const axisBottom = () => {
  const axis: any = (_selection?: any) => {};
  axis.ticks = () => axis;
  axis.tickFormat = () => axis;
  return axis;
};

// timeFormat returns a simple formatter
export const timeFormat = () => (date: Date) => `${date instanceof Date ? date.getFullYear() : ''}`;

// Common utilities used in code
export const extent = (arr: any[], fn: (d: any) => any) => {
  try {
    const values = arr.map(fn).filter((v) => v != null).sort((a, b) => +a - +b);
    return [values[0], values[values.length - 1]];
  } catch {
    return [undefined, undefined] as any;
  }
};

export default {
  select,
  scaleTime,
  scalePoint,
  axisBottom,
  timeFormat,
  extent,
};
