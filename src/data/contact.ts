/**
 * Contact and availability facts — one source for the footer and the
 * "Ask my Portfolio" chat. Edit here and both stay in sync.
 */
export interface Contact {
  roles: string[]
  location: string
  visa: string
  languages: string[]
  /** public/ path or full URL of a downloadable CV; while empty the footer offers "Request CV". */
  cvUrl: string
  linkedin: string
}

export const CONTACT: Contact = {
  roles: ['Junior Software Engineer', 'AI / ML Engineer (Junior)', 'Web / Frontend Developer', 'Internship'],
  location: 'Tokyo · Chiba, Japan',
  visa: 'Discussed on request',
  languages: ['Burmese (native)', 'English', 'Japanese (JLPT N3)'],
  cvUrl: '',
  linkedin: 'https://www.linkedin.com/in/myothantnaing',
}
