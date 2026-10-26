/**
 * Hiring facts — one source for the Hire Me panel (recruiter mode) and the
 * "Ask my Portfolio" chat's system prompt. Edit here and both stay in sync.
 */
export interface HireMe {
  roles: string[]
  location: string
  visa: string
  japanese: string
  languages: string[]
  /** public/ path or full URL of a downloadable CV; leave empty to hide the button. */
  cvUrl: string
  linkedin: string
}

export const HIRE_ME: HireMe = {
  roles: ['Junior Software Engineer', 'AI / ML Engineer (Junior)', 'Web / Frontend Developer', 'Internship'],
  location: 'Tokyo · Chiba, Japan',
  visa: 'Discussed on request',
  japanese: 'JLPT N3',
  languages: ['Burmese (native)', 'English', 'Japanese (JLPT N3)'],
  cvUrl: '',
  linkedin: 'https://www.linkedin.com/in/myothantnaing',
}
