"use client"

import React, { useId, useRef, useState } from 'react'

export type GulpState = 'idle' | 'eat' | 'furl' | 'done'

export interface GulpDeleteButtonProps {
  onDelete: () => unknown | Promise<unknown>
  onBeforeEat?: () => boolean
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'danger'
  title?: string
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

export default function GulpDeleteButton({
  onDelete,
  onBeforeEat,
  label,
  size = 'md',
  variant = 'dark',
  title,
  disabled = false,
  fullWidth = false,
  className = '',
}: GulpDeleteButtonProps) {
  const clipId = useId().replace(/:/g, '')
  const resolvedLabel = label || (size === 'xs' || size === 'sm' ? 'Borrar' : 'Eliminar')
  const chars = Array.from(resolvedLabel)

  const [state, setState] = useState<GulpState>('idle')
  const [fillProgress, setFillProgress] = useState<number>(0)
  const [isChomping, setIsChomping] = useState<boolean>(false)
  const [isShaking, setIsShaking] = useState<boolean>(false)
  const [charOffsets, setCharOffsets] = useState<number[]>([])

  const iconRef = useRef<SVGSVGElement | null>(null)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([])
  const landedCountRef = useRef<number>(0)
  const completedRef = useRef<boolean>(false)

  const sizeConfig = {
    xs: {
      btn: 'px-2 py-1 text-[10px] gap-1 min-h-[24px]',
      icon: 13,
      defaultBaseOffset: -14,
      defaultStepOffset: 5.2,
    },
    sm: {
      btn: 'px-2.5 py-1 text-[11px] gap-1.5 min-h-[28px]',
      icon: 15,
      defaultBaseOffset: -16,
      defaultStepOffset: 6,
    },
    md: {
      btn: 'px-4 py-2 text-xs gap-2 min-h-[38px]',
      icon: 18,
      defaultBaseOffset: -22,
      defaultStepOffset: 7,
    },
    lg: {
      btn: 'px-5 py-2.5 text-xs sm:text-sm gap-2.5 min-h-[42px]',
      icon: 20,
      defaultBaseOffset: -26,
      defaultStepOffset: 7.8,
    },
  }[size]

  const triggerFinishSequence = async () => {
    if (completedRef.current) return
    completedRef.current = true

    setFillProgress(1)
    setState('furl')

    await new Promise((r) => setTimeout(r, 260))
    setState('done')

    await new Promise((r) => setTimeout(r, 120))
    await onDelete()

    // Reset state in case the button remains mounted (e.g., Vaciar Comanda or failed PIN)
    setTimeout(() => {
      setState('idle')
      setFillProgress(0)
      landedCountRef.current = 0
      completedRef.current = false
    }, 300)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (disabled || state !== 'idle') return

    if (onBeforeEat && !onBeforeEat()) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 360)
      return
    }

    // Measure exact distance from each character to the trash bin mouth
    if (iconRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect()
      const targetMouthX = iconRect.left + iconRect.width * 0.58
      const measured = chars.map((_, idx) => {
        const el = charRefs.current[idx]
        if (!el) return sizeConfig.defaultBaseOffset - idx * sizeConfig.defaultStepOffset
        const rect = el.getBoundingClientRect()
        const charCenterX = rect.left + rect.width * 0.5
        return Math.round(targetMouthX - charCenterX)
      })
      setCharOffsets(measured)
    }

    landedCountRef.current = 0
    completedRef.current = false
    setFillProgress(0.05)
    setState('eat')

    // Safety fallback timer in case browser has reduced-motion or tab is backgrounded
    const totalEatDuration = 440 + chars.length * 40 + 80
    setTimeout(() => {
      triggerFinishSequence()
    }, totalEatDuration)
  }

  const handleCharAnimationEnd = (e: React.AnimationEvent<HTMLSpanElement>) => {
    if (e.animationName !== 'gulp-fly') return
    landedCountRef.current += 1
    const nonSpaceTotal = Math.max(1, chars.filter((c) => c.trim() !== '').length)
    const nextProgress = Math.min(1, landedCountRef.current / nonSpaceTotal)
    setFillProgress(nextProgress)

    // Chomp & liquid slosh effect on each letter eaten
    setIsChomping(true)
    setTimeout(() => setIsChomping(false), 140)

    if (landedCountRef.current >= chars.length) {
      triggerFinishSequence()
    }
  }

  return (
    <span
      className={`gulp ${isShaking ? 'gulp--shake' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      data-state={state}
      data-variant={variant}
      data-chomp={isChomping ? 'true' : 'false'}
      style={{ '--p': fillProgress } as React.CSSProperties}
    >
      <button
        type="button"
        disabled={disabled}
        title={title || resolvedLabel}
        onClick={handleClick}
        className={`gulp__btn ${sizeConfig.btn} ${fullWidth ? 'w-full' : ''} disabled:opacity-45 disabled:cursor-not-allowed`}
      >
        <svg
          ref={iconRef}
          className="gulp__icon"
          width={sizeConfig.icon}
          height={sizeConfig.icon}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={`gulp-clip-${clipId}`}>
              <path d="M6.8 8.2 L8.1 19.6 C8.2 20.2 8.7 20.6 9.3 20.6 H14.7 C15.3 20.6 15.8 20.2 15.9 19.6 L17.2 8.2 Z" />
            </clipPath>
          </defs>

          {/* Tapa del bote que se abre para comer las letras */}
          <g className="gulp__lid">
            <path
              d="M9.5 5.2 C9.5 4.3 10.2 3.6 11.1 3.6 H12.9 C13.8 3.6 14.5 4.3 14.5 5.2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M4.5 5.8 H19.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>

          {/* Cuerpo del bote + nivel de llenado conforme caen las letras */}
          <g className="gulp__can">
            <g clipPath={`url(#gulp-clip-${clipId})`}>
              <g className="gulp__liq">
                <path
                  className="gulp__fill"
                  d="M4 8.2 Q8 7.2 12 8.2 T20 8.2 L20 23 L4 23 Z"
                  fill="currentColor"
                  fillOpacity="0.92"
                />
              </g>
            </g>

            {/* Contorno del bote */}
            <path
              className="gulp__bin"
              d="M6.3 7.8 L7.7 19.8 C7.85 20.9 8.75 21.6 9.85 21.6 H14.15 C15.25 21.6 16.15 20.9 16.3 19.8 L17.7 7.8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>

        <span className="gulp__label">
          {chars.map((char, idx) => {
            const dx =
              charOffsets[idx] !== undefined
                ? charOffsets[idx]
                : sizeConfig.defaultBaseOffset - idx * sizeConfig.defaultStepOffset
            return (
              <span
                key={`${idx}-${char}`}
                ref={(el) => {
                  charRefs.current[idx] = el
                }}
                onAnimationEnd={handleCharAnimationEnd}
                className="gulp__char"
                style={
                  {
                    '--i': idx,
                    '--dx': `${dx}px`,
                  } as React.CSSProperties
                }
              >
                {char}
              </span>
            )
          })}
        </span>

        {/* Check de sellado al terminar de comer la etiqueta */}
        <svg
          className="gulp__check"
          width={Math.max(12, sizeConfig.icon - 3)}
          height={Math.max(12, sizeConfig.icon - 3)}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </span>
  )
}

