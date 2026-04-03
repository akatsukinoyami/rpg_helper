import { appDiscord, appGoogle, appTelegram } from '$lib/icons';
import * as m from '$lib/paraglide/messages';

export const providerLabels = {
  google: 'Google',
  discord: 'Discord',
  telegram: 'Telegram',
  credential: 'Email & password'
} as const;

export const providerIcons = {
  google: appGoogle,
  discord: appDiscord,
  telegram: appTelegram
} as const;

export const schemeLabels = {
  github: m.settings_scheme_github,
  catppuccin: m.settings_scheme_catppuccin,
  gruvbox: m.settings_scheme_gruvbox
} as const;

export const modeLabels = {
  light: m.settings_mode_light,
  dark: m.settings_mode_dark,
  system: m.settings_mode_system
} as const;

export const langLabels = {
  en: 'English',
  ru: 'Русский',
  ua: 'Українська'
} as const;

export const errorMsgs = {
  wrong_password: m.settings_error_wrong_password,
  name_taken: m.settings_error_name_taken,
  email_taken: m.settings_error_email_taken,
  mismatch: m.settings_error_password_mismatch,
  too_short: m.settings_error_password_too_short,
} as const;