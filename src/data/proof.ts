// Real proof only. Add entries here as the owner supplies them; sections stay hidden while their list is empty.

// Before/after pairs: two photos of the SAME spot, before and after cleaning, taken on a real job.
export const beforeAfter: { before: string; after: string; title: string; place?: string }[] = [];

// Testimonials: real customers, with their consent. video is an optional path under /public/video.
export const testimonials: { name: string; city: string; text: string; system?: string; video?: string; poster?: string }[] = [];

// Public rating, only if real and linkable (e.g. Google Business profile).
export const rating: { score: number; count: number; source: string; url: string } | null = null;
