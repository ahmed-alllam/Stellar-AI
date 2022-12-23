import Browser from 'webextension-polyfill'

export const TRIGGER_MODES = {
  enabled: 'Enabled',
  disabled: 'Disabled',
}

export async function getUserConfig() {
  return Browser.storage.local.get(['triggerMode'])
}

export async function updateUserConfig(updates) {
  return Browser.storage.local.set(updates)
}
