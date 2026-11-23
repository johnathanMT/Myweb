/** Language codes used by LangContext. */
export type LangCode = 'en' | 'jp' | 'mm' | 'vn' | 'ne' | 'id' | 'zh'

/** Translated into every language: a missing one is a type error. */
export type AllLangs<T = string> = Record<LangCode, T>

/** English is required; other languages fall back to it. */
export type Localized<T = string> = { en: T } & Partial<Record<LangCode, T>>

export const pickLang = <T>(value: Localized<T>, lang: string): T =>
  (value as Partial<Record<string, T>>)[lang] || value.en
