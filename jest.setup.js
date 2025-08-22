import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    a: ({ children, ...props }) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => <div data-testid="animate-presence">{children}</div>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
});

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => (dynamicFunction) => {
  const DynamicComponent = dynamicFunction();
  DynamicComponent.displayName = 'LoadableComponent';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

// Mock Three.js and related libraries
jest.mock('three', () => ({
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  BufferGeometry: jest.fn(),
  BufferAttribute: jest.fn(),
  Mesh: jest.fn(),
  MeshBasicMaterial: jest.fn(),
}));

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }) => <div data-testid="three-canvas" {...props}>{children}</div>,
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({ camera: {}, scene: {} })),
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Text: ({ children, ...props }) => <div data-testid="three-text" {...props}>{children}</div>,
  Box: (props) => <div data-testid="three-box" {...props} />,
  Sphere: (props) => <div data-testid="three-sphere" {...props} />,
}));

// Mock D3.js
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      data: jest.fn(() => ({
        enter: jest.fn(() => ({
          append: jest.fn(() => ({
            attr: jest.fn(() => ({})),
            style: jest.fn(() => ({})),
            text: jest.fn(() => ({})),
          })),
        })),
        exit: jest.fn(() => ({
          remove: jest.fn(),
        })),
      })),
      attr: jest.fn(() => ({})),
      style: jest.fn(() => ({})),
      text: jest.fn(() => ({})),
    })),
    attr: jest.fn(() => ({})),
    style: jest.fn(() => ({})),
    append: jest.fn(() => ({})),
  })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn(() => ({})),
    range: jest.fn(() => ({})),
  })),
  scaleTime: jest.fn(() => ({
    domain: jest.fn(() => ({})),
    range: jest.fn(() => ({})),
  })),
  axisBottom: jest.fn(),
  axisLeft: jest.fn(),
  line: jest.fn(() => ({
    x: jest.fn(() => ({})),
    y: jest.fn(() => ({})),
  })),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock performance.now for timing tests
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
  },
});

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});