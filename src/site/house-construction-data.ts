export type PackageStatus = 'included' | 'excluded' | 'to_confirm'
export type PackageItem = { item: string; status: PackageStatus }
export type HouseConstructionPackage = {
  startingRate: number
  description: string
  scopeItems: PackageItem[]
  separatelyQuotedCandidates: PackageItem[]
  qualityNotes: string[]
  paymentMilestones: string[]
  terms: string[]
  faqs: { question: string; answer: string }[]
}

export const defaultHouseConstructionPackage: HouseConstructionPackage = {
  startingRate: 1750,
  description: 'House construction in Hyderabad, with the final scope, material specifications and terms confirmed in a written quotation.',
  scopeItems: [
    'Excavation and site preparation',
    'Foundation',
    'RCC structure and reinforcement steel',
    'Masonry and plastering',
    'Cement and other construction materials',
    'Plumbing and electrical work',
    'Flooring',
    'Doors and windows',
    'Painting and finishing',
  ].map(item => ({ item, status: 'to_confirm' })),
  separatelyQuotedCandidates: [
    'Design and engineering fees',
    'Approvals and statutory charges',
    'Borewell and sump',
    'Premium fittings',
    'Modular kitchen, wardrobes and TV units',
    'Aluminium upgrades and false ceiling',
    'Furniture, compound wall and landscaping',
    'Unusual site work',
  ].map(item => ({ item, status: 'to_confirm' })),
  qualityNotes: [
    'Material brands, grades, makes and finish specifications are to be confirmed in the written quotation.',
    'No material brand, grade or warranty is assumed by this indicative starting rate.',
  ],
  paymentMilestones: ['Payment milestones and amounts: To be confirmed in the written quotation.'],
  terms: [
    'The starting rate is indicative and is not a binding offer.',
    'Chargeable area, scope, material specifications, site conditions and applicable taxes are to be confirmed in the written quotation.',
    'Approvals, design fees and separately quoted work are not assumed to be included.',
    'No completion date or warranty is promised until recorded in the signed agreement.',
  ],
  faqs: [
    {
      question: 'What does the ₹1,750 per sq. ft. starting rate include?',
      answer: 'The package scope has not been confirmed yet. Each work item, material specification, chargeable area and applicable tax must be stated in your written quotation.',
    },
    {
      question: 'How is the final construction price calculated?',
      answer: 'The estimator multiplies the area you enter by the advertised starting rate only. Final pricing depends on agreed scope, specifications, site conditions, chargeable area and applicable taxes.',
    },
    {
      question: 'Are approvals, design charges or interiors included?',
      answer: 'Their inclusion is not confirmed. Ask for each item to be listed clearly in the written quotation before proceeding.',
    },
    {
      question: 'When will payment milestones and the completion schedule be shared?',
      answer: 'Payment milestones and any construction schedule must be agreed and recorded in the written quotation and agreement.',
    },
  ],
}
