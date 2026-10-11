import { ArrowUpRight } from 'lucide-react'
import { whatsappHref } from './whatsapp-config'
import './whatsapp.css'

export function WhatsAppAction({ message, label, className }: { message: string; label: string; className: string }) {
  const href = whatsappHref(message)
  if (!href) {
    return <span className={`${className} whatsapp-unconfigured`} aria-disabled="true" title="Add the business WhatsApp number to activate this action">
      {label}<small>Number needed</small>
    </span>
  }
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">
    {label}<ArrowUpRight size={16}/>
  </a>
}
