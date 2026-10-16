// One normalization function is shared by scope checks and retrieval.
export const normalise=s=>String(s).toLowerCase().replace(/δ/g,'delta ').normalize('NFKD')
 .replace(/[\u0300-\u036f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g,'')
 .replace(/ł/g,'l').replace(/[^a-z0-9%/]+/g,' ').replace(/\s+/g,' ').trim();
