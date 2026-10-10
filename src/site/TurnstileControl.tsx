import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string
      remove: (id: string) => void
      reset: (id: string) => void
    }
  }
}

export function TurnstileControl({ siteKey, onToken }: { siteKey: string; onToken: (value: string) => void }) {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!siteKey || !el.current) return
    let widget: string | undefined
    let alive = true
    const render = () => {
      if (alive && el.current && window.turnstile && !widget) {
        widget = window.turnstile.render(el.current, {
          sitekey: siteKey,
          action: 'enquiry',
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        })
      }
    }
    let script = document.querySelector<HTMLScriptElement>('script[data-turnstile]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.dataset.turnstile = 'true'
      document.head.append(script)
    }
    script.addEventListener('load', render)
    render()
    return () => {
      alive = false
      script?.removeEventListener('load', render)
      if (widget) window.turnstile?.remove(widget)
      onToken('')
    }
  }, [siteKey, onToken])
  return <div className="turnstile-wrap"><div ref={el}/></div>
}
