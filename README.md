# אתר המרכז למיזוג וחיטוי

Astro 7, נבנה כאתר סטטי ומיועד להעלאה ל-Vercel.

- התקנה: `npm install`
- הרצה מקומית: `npm run dev`
- בנייה: `npm run build` (הפלט בתיקייה `dist`)

## לפני עלייה לאוויר
- `src/data/site.ts`: למלא טלפון, וואטסאפ (בפורמט 9725XXXXXXXX), אימייל וכתובת דומיין.
- `astro.config.mjs` ו-`public/robots.txt`: להחליף את כתובת הדומיין.
- `src/pages/testimonials.astro`: להוסיף המלצות אמיתיות, באישור הלקוחות.
