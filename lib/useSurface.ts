import { useState, useEffect } from 'react'

export function useSurface(): 'app' | 'web' {
  const [surface, setSurface] = useState<'app' | 'web'>('web')
  useEffect(() => {
    const standalone =
      (typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches) ||
      (typeof window !== 'undefined' &&
        (window.navigator as unknown as { standalone?: boolean }).standalone === true)
    setSurface(standalone ? 'app' : 'web')
  }, [])
  return surface
}