// Prices and the active offer. Edit here (or later through the admin page) and redeploy.
// Owner-provided winter prices, 25.11.2026. Israeli consumer law requires prices shown to consumers to include VAT:
// vatIncluded must be confirmed by the owner before launch.
export const offer = {
  active: false, // owner decision 25.11.2026: no prices or promotions on the site
  title: 'הטבת חורף',
  headline: 'מכינים את המזגן לעונת החימום',
  gift: 'בישום וחיטוי אנטי־בקטריאלי במתנה',
  terms: 'בכפוף לתנאי המבצע',
  endsLabel: null as string | null, // e.g. 'עד 31.1' when the owner sets an end date
};

export const vatIncluded: boolean | null = null; // TODO owner: are 289/179 including VAT?

export const prices = {
  miniCentralUnit: 289, // ניקוי יחידה פנימית מיני מרכזי
  ductFrom: 179,        // ניקוי תעלה, החל מ
  wallUnit: null as number | null, // מזגן עילי: לא נמסר מחיר, יתומחר בהצעה
  vrfUnit: null as number | null,  // VRF: בהצעה
};

export const priceNote = 'המחיר במחשבון הוא הערכה ראשונית. המחיר הסופי נקבע אחרי שנשמע על המערכת או נראה אותה, ויכול להשתנות לפי גישה לתעלות, אורך התעלות ורמת הלכלוך.';

export const pixelId = '1320318097834094'; // Meta pixel "קמפיין לידים 2.9"
