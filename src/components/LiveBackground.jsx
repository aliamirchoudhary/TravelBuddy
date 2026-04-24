import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'

function Scene({ accent = '#2dd4bf' }) {
  return (
    <>
      <Stars radius={90} depth={45} count={900} factor={2.8} saturation={0} fade speed={0.35} />
      <Sparkles count={48} scale={14} size={2.2} speed={0.2} opacity={0.45} color={accent} />
    </>
  )
}

/**
 * Full-bleed Three.js background (stars + sparkles).
 * Canvas mounts only after client hydration to avoid blank screens from Strict Mode / WebGL edge cases.
 */
export default function LiveBackground({ accent = '#2dd4bf', style = {} }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,212,191,0.08), transparent 65%)',
          ...style,
        }}
      />
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <Suspense fallback={null}>
          <Scene accent={accent} />
        </Suspense>
      </Canvas>
    </div>
  )
}
