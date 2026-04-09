// PostHog analytics hook
// Set VITE_POSTHOG_KEY in your .env to activate

const PH_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const PH_HOST = "https://app.posthog.com";

let ph: any = null;

async function getPosthog() {
  if (!PH_KEY) return null;
  if (ph) return ph;
  try {
    const { default: posthog } = await import("posthog-js");
    posthog.init(PH_KEY, { api_host: PH_HOST, capture_pageview: false });
    ph = posthog;
    return ph;
  } catch {
    return null;
  }
}

export function useAnalytics() {
  const track = async (event: string, props?: Record<string, unknown>) => {
    const posthog = await getPosthog();
    if (!posthog) return;
    posthog.capture(event, props);
  };

  const identify = async (userId: string, traits?: Record<string, unknown>) => {
    const posthog = await getPosthog();
    if (!posthog) return;
    posthog.identify(userId, traits);
  };

  const page = async (pageName: string) => {
    const posthog = await getPosthog();
    if (!posthog) return;
    posthog.capture("$pageview", { page: pageName });
  };

  return { track, identify, page };
}

// Named event helpers for consistency across the app
export const EVENTS = {
  // Article
  ARTICLE_OPENED:        "article_opened",
  PERSPECTIVE_CHANGED:   "perspective_changed",
  PERSPECTIVE_VOTED:     "perspective_voted",
  COMPARE_MODE_OPENED:   "compare_mode_opened",
  READ_MODE_CHANGED:     "read_mode_changed",
  ARTICLE_BOOKMARKED:    "article_bookmarked",
  ARTICLE_SHARED:        "article_shared",
  CONTEXT_TOOLTIP_OPENED:"context_tooltip_opened",
  // Feed
  SECTION_CHANGED:       "section_changed",
  TOPIC_SELECTED:        "topic_selected",
  // Auth / onboarding
  SIGNUP_COMPLETED:      "signup_completed",
  WAITLIST_SIGNUP:       "waitlist_signup",
  // Daily brief
  DAILY_BRIEF_OPENED:    "daily_brief_opened",
} as const;
