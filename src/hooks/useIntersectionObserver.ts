import { useEffect, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        if (!isElementIntersecting || !freezeOnceVisible) {
          setIsIntersecting(isElementIntersecting);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options.threshold, options.root, options.rootMargin, options.freezeOnceVisible]);

  return isIntersecting;
}