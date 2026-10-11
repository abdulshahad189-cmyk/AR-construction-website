export type Service = {
  title: string
  slug: string
  description: string
  scope: string[]
  image: string
  localImage?: string
  imageAlt?: string
  localImageWidth?: number
}

export const services: Service[] = [
  { title: 'Civil Construction', slug: 'civil-construction', description: 'A considered approach to building, grounded in clear planning, capable execution and attention to the details that last.', scope: ['Project planning and coordination', 'Structural and civil works', 'Material and finish coordination'], image: 'photo-1504307651254-35680f356dfd', localImage: '/images/projects/civil/construction-site-scaffolding.jpg', imageAlt: 'Building exterior behind construction scaffolding; project location and status are unconfirmed.', localImageWidth: 590 },
  { title: 'Homes & Villas', slug: 'homes-villas', description: 'Spaces shaped around the way you want to live, from a first conversation through construction and handover.', scope: ['Independent houses and villas', 'Residential construction', 'Site coordination'], image: 'photo-1600607687939-ce8a6c25118c' },
  { title: 'Commercial Spaces', slug: 'commercial-spaces', description: 'Purposeful spaces for business, planned with a practical view of function, finish and delivery.', scope: ['Commercial construction', 'Space planning coordination', 'Fit-out and finishing'], image: 'photo-1486406146926-c627a92ad1ab' },
  { title: 'Interior Design', slug: 'interior-design', description: 'Warm, functional interiors where material, light and proportion work together.', scope: ['Interior concepts and finishes', 'Residential and commercial interiors', 'Turnkey interior execution'], image: 'photo-1600210492486-724fe5c67fb0', localImage: '/images/projects/interiors/kitchen-cabinetry-installation.jpg', imageAlt: 'Kitchen cabinetry and countertop during an interior installation; project details are unconfirmed.', localImageWidth: 736 },
  { title: 'Aluminium Works', slug: 'aluminium-works', description: 'Selected archive photos show framed wardrobe and storage work. Materials and the scope for each project are confirmed in its quotation.', scope: ['Aluminium-framed wardrobe systems', 'Framed storage and cabinetry', 'Other aluminium work as specified in a quotation'], image: 'photo-1600607687939-ce8a6c25118c', localImage: '/images/projects/aluminium/aluminium-framed-wardrobe.jpg', imageAlt: 'Aluminium-framed wardrobe installation from the company photo archive; project details are unconfirmed.', localImageWidth: 1080 },
  { title: 'Renovation', slug: 'renovation', description: 'Thoughtful updates that bring new life and better function to existing places.', scope: ['Renovation and remodeling', 'Finish upgrades', 'Project coordination'], image: 'photo-1600607687920-4e2a09cf159d' },
  { title: 'Consultation', slug: 'consultation', description: 'An experienced conversation to help clarify your brief, priorities and next steps.', scope: ['Building and project consultation', 'Scope definition', 'Proposal and scheduling'], image: 'photo-1487958449943-2429e8be8625' },
]

export type CompanyWorkImage = {
  image: string
  imageWidth: number
  category: string
  alt: string
}

export const companyWorkImages: CompanyWorkImage[] = [
  {
    image: '/images/projects/civil/construction-site-scaffolding.jpg',
    imageWidth: 590,
    category: 'Civil Construction Work',
    alt: 'Building exterior behind construction scaffolding; location, scope and project status are unconfirmed.',
  },
  {
    image: '/images/projects/aluminium/aluminium-framed-wardrobe.jpg',
    imageWidth: 1080,
    category: 'Aluminium Work',
    alt: 'Framed wardrobe installation from the company photo archive; project details are unconfirmed.',
  },
  {
    image: '/images/projects/interiors/modular-kitchen-installation.jpg',
    imageWidth: 1600,
    category: 'Kitchen Installation',
    alt: 'Installed L-shaped kitchen cabinetry from the company photo archive; project details are unconfirmed.',
  },
  {
    image: '/images/projects/woodwork/wood-tv-wall-installation.jpg',
    imageWidth: 1600,
    category: 'Interior & Woodwork',
    alt: 'Wood-panel television wall and storage installation from the company photo archive; project details are unconfirmed.',
  },
]

export function publicAssetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export function responsiveImageSrcSet(path: string, sourceWidth: number): string {
  const assetPath = publicAssetUrl(path)
  const prefix = assetPath.replace(/\.jpg$/i, '')
  const sizes = sourceWidth > 960 ? [480, 960] : sourceWidth > 480 ? [480] : []
  return sizes.map(width => `${prefix}-${width}w.jpg ${width}w`).concat(`${assetPath} ${sourceWidth}w`).join(', ')
}

// Curated editorial imagery for the design prototype. These are stock photos, not AR CONSTRUCTION projects.
export const sampleProjects = [
  { title: 'Light, Line & Living', category: 'Interiors', description: 'An editorial study in calm, natural materials and considered daylight.', image: 'photo-1600210492486-724fe5c67fb0' },
  { title: 'The Courtyard House', category: 'Residential', description: 'A contemporary home reference with a strong connection to its landscape.', image: 'photo-1600607687939-ce8a6c25118c' },
  { title: 'A Place to Gather', category: 'Interiors', description: 'Warm textures and measured forms for an inviting everyday interior.', image: 'photo-1600607687920-4e2a09cf159d' },
]

export const photo = (id: string, width = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`
