const KEY_VOTES = 'dw_guest_votes_count'
const KEY_VIEWED_IDS = 'dw_guest_viewed_outfit_ids'
const KEY_TRIGGERED = 'dw_guest_signup_nudge_triggered'
const KEY_DISMISSED = 'dw_guest_signup_nudge_dismissed'
const EVENT_NAME = 'dw-signup-nudge-updated'

const safeGet = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

const emitUpdate = () => {
  try {
    window.dispatchEvent(new Event(EVENT_NAME))
  } catch {
    // ignore
  }
}

const evaluateTrigger = () => {
  const votes = Number(safeGet(KEY_VOTES, 0) || 0)
  const viewedIds = safeGet(KEY_VIEWED_IDS, [])
  const viewedCount = Array.isArray(viewedIds) ? viewedIds.length : 0
  if (votes >= 3 || viewedCount >= 3) {
    safeSet(KEY_TRIGGERED, true)
    // Re-open banner when a new trigger round is reached.
    safeSet(KEY_DISMISSED, false)
    emitUpdate()
  }
}

export const registerGuestVote = () => {
  const next = Number(safeGet(KEY_VOTES, 0) || 0) + 1
  safeSet(KEY_VOTES, next)
  evaluateTrigger()
}

export const registerGuestOutfitView = (outfitKey) => {
  if (!outfitKey) return
  const viewedIds = safeGet(KEY_VIEWED_IDS, [])
  const list = Array.isArray(viewedIds) ? viewedIds : []
  if (list.includes(outfitKey)) return
  list.push(outfitKey)
  safeSet(KEY_VIEWED_IDS, list)
  evaluateTrigger()
}

export const isSignupNudgeTriggered = () => !!safeGet(KEY_TRIGGERED, false)
export const isSignupNudgeDismissed = () => !!safeGet(KEY_DISMISSED, false)
export const dismissSignupNudge = () => {
  // "Skip for now": hide current banner and require a fresh trigger round.
  safeSet(KEY_DISMISSED, true)
  safeSet(KEY_TRIGGERED, false)
  safeSet(KEY_VOTES, 0)
  safeSet(KEY_VIEWED_IDS, [])
  emitUpdate()
}

export const signupNudgeEventName = EVENT_NAME
