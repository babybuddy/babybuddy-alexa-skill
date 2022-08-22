interface GetResponse<T> {
  count: number;
  results: Array<T>;
}

interface CreateFeeding {
  child: string;
  timer: string;
  type: string;
  method: string;
  amount: number;
}

enum FeedingType {
  BREAST_MILK = 'breast milk',
  FORMULA = 'formula',
  FORTIFIED_BREAST_MILK = 'fortified breast milk',
}

enum FeedingMethod {
  BOTTLE = 'bottle',
  LEFT_BREAST = 'left breast',
  RIGHT_BREAST = 'right breast',
  BOTH_BREASTS = 'both breasts',
}

interface Feeding {
  id: number;
  child: number;
  start: string;
  end: string;
  duration: '00:37:00';
  type: FeedingType;
  method: FeedingMethod;
  amount: number;
}

interface Timer {
  id: string;
  child: string;
  name: string;
  start: string;
  end: string;
  duration: string;
  active: boolean;
  user: string;
}

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  slug: string;
  picture: string | null;
}

interface CreateDiaperChange {
  child: string;
  wet: boolean;
  solid: boolean;
  color?: string;
  amount?: number;
}

interface CloudflareZeroTrustSecret {
  cfAccessClientId: string;
  cfAccessClientSecret: string;
}

interface Secret {
  apiKey: string;
  apiUrl: string;
  cloudflare?: CloudflareZeroTrustSecret | null;
}

enum URLS {
  CHILDREN = 'api/children/',
  DIAPER_CHANGES = 'api/changes/',
  FEEDINGS = 'api/feedings/',
  NOTES = 'api/notes/',
  SLEEP = 'api/sleep/',
  TEMPERATURE = 'api/temperature/',
  TIMERS = 'api/timers/',
  TUMMY_TIMES = 'api/tummy-times/',
  WEIGHT = 'api/weight/',
}

export {
  GetResponse,
  CreateFeeding,
  FeedingType,
  FeedingMethod,
  Feeding,
  Timer,
  Child,
  CreateDiaperChange,
  CloudflareZeroTrustSecret,
  Secret,
  URLS
};
