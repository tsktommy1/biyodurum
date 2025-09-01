// RestaurantLandingPage.tsx — Preact + TailwindCSS (single-file)
// Drop into your Preact project. Requires TailwindCSS set up.
// Optional props: apiKey (Google Maps JS API key), placeId (Google Place ID), address, phone.
// The Reviews section will use Google Places JS API (no server needed) when apiKey + placeId are provided.

import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

// --------- Types ---------
type Lang = 'en' | 'fr' | 'de' | 'es';

type Props = {
  apiKey?: string;
  placeId?: string;
  address?: string;
  phone?: string;
  googleMapsEmbedUrl?: string; // optional override for the map iframe src
};

type Review = {
  author_name: string;
  rating: number;
  relative_time_description?: string;
  text?: string;
  profile_photo_url?: string;
};

// --------- Minimal inline icons (no extra deps) ---------
const Star = ({ filled = false }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" class="w-4 h-4 inline-block" aria-hidden>
    <path d="M12 .587l3.668 7.431 8.207 1.193-5.938 5.79 1.403 8.176L12 18.896l-7.34 3.881 1.403-8.176L.125 9.211l8.207-1.193L12 .587z" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden>
    <path d="M3 5a2 2 0 012-2h2a1 1 0 011 .8l1 5a1 1 0 01-.27.9l-1.6 1.6a16 16 0 006.67 6.67l1.6-1.6a1 1 0 01.9-.27l5 1a1 1 0 01.8 1v2a2 2 0 01-2 2h-1C9.163 22 2 14.837 2 6V5a2 2 0 011-1z" fill="currentColor"/>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden>
    <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" fill="currentColor"/>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden>
    <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" fill="currentColor"/>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden>
    <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="currentColor"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="currentColor"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden>
    <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v.5l-10 6-10-6V6zm0 3.236V18a2 2 0 002 2h16a2 2 0 002-2V9.236l-9.445 5.667a2 2 0 01-2.11 0L2 9.236z" fill="currentColor"/>
  </svg>
);

// --------- i18n ---------
const I18N: Record<Lang, any> = {
  en: {
    locale: 'English',
    heroTitle: 'Modern Mediterranean Kitchen',
    heroSubtitle: 'Seasonal. Local. Fire-kissed.',
    bookTable: 'Book a Table',
    aboutTitle: 'About',
    aboutBody:
      'We are a chef-led neighborhood restaurant celebrating wood fire, peak-season produce, and warm hospitality.',
    menuTitle: 'Menu',
    locationTitle: 'Location',
    call: 'Call',
    reviewsTitle: 'Reviews',
    contactTitle: 'Contact',
    footerNote: '© Your Restaurant. All rights reserved.',
    addressLabel: 'Address',
    phoneLabel: 'Phone',
    getDirections: 'Get Directions',
    loadingReviews: 'Loading reviews…',
    noReviews: 'No reviews yet.',
  },
  fr: {
    locale: 'Français',
    heroTitle: 'Cuisine Méditerranéenne Moderne',
    heroSubtitle: 'De saison. Locale. Au feu de bois.',
    bookTable: 'Réserver',
    aboutTitle: 'À propos',
    aboutBody:
      'Restaurant de quartier dirigé par un chef : feu de bois, produits de saison et hospitalité chaleureuse.',
    menuTitle: 'Menu',
    locationTitle: 'Adresse',
    call: 'Appeler',
    reviewsTitle: 'Avis',
    contactTitle: 'Contact',
    footerNote: '© Votre Restaurant. Tous droits réservés.',
    addressLabel: 'Adresse',
    phoneLabel: 'Téléphone',
    getDirections: 'Itinéraire',
    loadingReviews: 'Chargement des avis…',
    noReviews: "Pas encore d'avis.",
  },
  de: {
    locale: 'Deutsch',
    heroTitle: 'Moderne Mediterrane Küche',
    heroSubtitle: 'Saisonal. Regional. Über Feuer.',
    bookTable: 'Tisch reservieren',
    aboutTitle: 'Über uns',
    aboutBody:
      'Ein chefgeführtes Nachbarschaftsrestaurant: Holzfeuer, Saisonprodukte und herzliche Gastfreundschaft.',
    menuTitle: 'Speisekarte',
    locationTitle: 'Standort',
    call: 'Anrufen',
    reviewsTitle: 'Bewertungen',
    contactTitle: 'Kontakt',
    footerNote: '© Ihr Restaurant. Alle Rechte vorbehalten.',
    addressLabel: 'Adresse',
    phoneLabel: 'Telefon',
    getDirections: 'Route',
    loadingReviews: 'Bewertungen werden geladen…',
    noReviews: 'Noch keine Bewertungen.',
  },
  es: {
    locale: 'Español',
    heroTitle: 'Cocina Mediterránea Moderna',
    heroSubtitle: 'De temporada. Local. Al fuego.',
    bookTable: 'Reservar',
    aboutTitle: 'Acerca de',
    aboutBody:
      'Restaurante de barrio dirigido por chef: fuego de leña, producto de temporada y hospitalidad cálida.',
    menuTitle: 'Menú',
    locationTitle: 'Ubicación',
    call: 'Llamar',
    reviewsTitle: 'Reseñas',
    contactTitle: 'Contacto',
    footerNote: '© Su Restaurante. Todos los derechos reservados.',
    addressLabel: 'Dirección',
    phoneLabel: 'Teléfono',
    getDirections: 'Cómo llegar',
    loadingReviews: 'Cargando reseñas…',
    noReviews: 'Aún no hay reseñas.',
  },
};

// --------- Utilities ---------
const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

// Dynamically load Google Maps JS with Places library
function useGooglePlaces(apiKey?: string) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!apiKey) return;
    const existing = document.querySelector<HTMLScriptElement>('script[data-gmaps]');
    if (existing && (window as any).google?.maps?.places) {
      setReady(true);
      return;
    }
    const script = document.createElement('script');
    script.dataset.gmaps = '1';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
    return () => {};
  }, [apiKey]);
  return ready && !!(window as any).google?.maps?.places;
}

// --------- Components ---------
function LanguageSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const flags: Record<Lang, string> = { en: '🇬🇧', fr: '🇫🇷', de: '🇩🇪', es: '🇪🇸' };
  return (
    <div class="inline-flex items-center gap-1 rounded-2xl bg-white/70 backdrop-blur px-2 py-1 shadow">
      {(Object.keys(flags) as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          class={`px-2 py-1 rounded-xl text-sm transition ${
            lang === l ? 'bg-black text-white' : 'hover:bg-black/10'
          }`}
          aria-label={I18N[l].locale}
        >
          <span class="mr-1" aria-hidden>{flags[l]}</span>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span class="inline-flex items-center gap-0.5" aria-label={`${rating} stars`}>
      {[1,2,3,4,5].map(i => <Star key={i} filled={i <= full} />)}
    </span>
  );
}

function Section({ id, title, children }:{ id: string; title: string; children: any }){
  return (
    <section id={id} class="max-w-5xl mx-auto px-4 py-16">
      <h2 class="text-3xl font-semibold tracking-tight mb-6">{title}</h2>
      {children}
    </section>
  );
}

function Hero({ t, onBook }:{ t: any; onBook: () => void }){
  return (
    <header id="home" class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-amber-100 to-white"/>
      <div class="relative max-w-5xl mx-auto px-4 pt-20 pb-24">
        <div class="flex items-center justify-between mb-8">
          <div class="text-xl font-bold">Fire&Fig</div>
          {/* Language switch injected via parent */}
        </div>
        <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          {t.heroTitle}
        </h1>
        <p class="mt-4 text-lg text-black/70">{t.heroSubtitle}</p>
        <div class="mt-8 flex gap-3">
          <a href="#menu" onClick={(e)=>{e.preventDefault(); scrollToId('menu');}} class="px-5 py-3 rounded-2xl bg-black text-white shadow hover:shadow-lg active:scale-[0.99]">{t.menuTitle}</a>
          <button onClick={onBook} class="px-5 py-3 rounded-2xl bg-white border shadow hover:bg-black/5">{t.bookTable}</button>
        </div>
        <div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {title:'Wood Fire', desc:'Live flame grill'},
            {title:'Seasonal', desc:'Peak fresh produce'},
            {title:'Local', desc:'Farm partners'},
            {title:'Natural Wine', desc:'Curated list'},
          ].map((f) => (
            <div class="rounded-2xl p-4 bg-white/70 backdrop-blur shadow" key={f.title}>
              <div class="font-semibold">{f.title}</div>
              <div class="text-sm text-black/60">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function About({ t }:{ t:any }){
  return (
    <Section id="about" title={t.aboutTitle}>
      <div class="grid md:grid-cols-2 gap-6 items-center">
        <p class="text-lg leading-relaxed text-black/80">{t.aboutBody}</p>
        <div class="aspect-video rounded-2xl bg-center bg-cover shadow" style={{backgroundImage:'url(https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=60)'}}/>
      </div>
    </Section>
  );
}

function MenuSection({ t }:{ t:any }){
  const items = [
    { name: 'Charred Octopus', desc: 'chickpea purée, lemon, chili oil', price: '18' },
    { name: 'Heirloom Tomato Salad', desc: 'feta, oregano, olive oil', price: '14' },
    { name: 'Lamb Kofta', desc: 'tahini, herbs, pickled onion', price: '22' },
    { name: 'Roasted Eggplant', desc: 'pomegranate, yogurt, mint', price: '19' },
  ];
  return (
    <Section id="menu" title={t.menuTitle}>
      <div class="grid md:grid-cols-2 gap-6">
        {items.map((it) => (
          <div class="rounded-2xl p-5 bg-white shadow flex items-start justify-between" key={it.name}>
            <div>
              <div class="font-semibold">{it.name}</div>
              <div class="text-sm text-black/60">{it.desc}</div>
            </div>
            <div class="font-semibold">€{it.price}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function LocationSection({ t, address, phone, embedUrl }:{ t:any; address:string; phone:string; embedUrl:string }){
  return (
    <Section id="location" title={t.locationTitle}>
      <div class="grid lg:grid-cols-2 gap-6 items-start">
        <iframe
          title="map"
          class="w-full aspect-video rounded-2xl border shadow"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
        />
        <div class="rounded-2xl p-6 bg-white shadow">
          <div class="space-y-3">
            <div>
              <div class="text-sm text-black/60">{t.addressLabel}</div>
              <div class="font-semibold">{address}</div>
            </div>
            <div class="flex items-center gap-3">
              <PhoneIcon />
              <div>
                <div class="text-sm text-black/60">{t.phoneLabel}</div>
                <a href={`tel:${phone}`} class="font-semibold underline">
                  {phone}
                </a>
              </div>
            </div>
            <a target="_blank" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`} class="inline-block px-4 py-2 rounded-xl bg-black text-white shadow">
              {t.getDirections}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ReviewsSection({ t, placeId, apiKey }:{ t:any; placeId?:string; apiKey?:string }){
  const canUsePlaces = useGooglePlaces(apiKey);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!apiKey || !placeId || !canUsePlaces) return;
    const svc = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
    const req = { placeId, fields: ['reviews','rating','user_ratings_total'] } as any;
    svc.getDetails(req, (place: any, status: any) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
        setReviews(place.reviews || []);
        setRating(place.rating || null);
        setCount(place.user_ratings_total || null);
      }
    });
  }, [apiKey, placeId, canUsePlaces]);

  return (
    <Section id="reviews" title={t.reviewsTitle}>
      <div class="flex items-center gap-3 mb-6">
        <StarIcon />
        <div class="text-lg font-semibold">
          {rating ? (
            <>
              {rating.toFixed(1)} <span class="text-black/60">({count} Google)</span>
            </>
          ) : (
            <span class="text-black/60">Google</span>
          )}
        </div>
      </div>

      {!apiKey || !placeId ? (
        <div class="text-black/60">
          {/* Fallback copy when not configured */}
          {t.loadingReviews} Set <code>apiKey</code> and <code>placeId</code> props to show live Google reviews.
        </div>
      ) : reviews === null ? (
        <div class="text-black/60">{t.loadingReviews}</div>
      ) : reviews.length === 0 ? (
        <div class="text-black/60">{t.noReviews}</div>
      ) : (
        <div class="grid md:grid-cols-2 gap-4">
          {reviews.slice(0,4).map((r) => (
            <div key={r.author_name + r.relative_time_description} class="rounded-2xl p-5 bg-white shadow">
              <div class="flex items-center gap-3 mb-3">
                {r.profile_photo_url ? (
                  <img src={r.profile_photo_url} alt={r.author_name} class="w-8 h-8 rounded-full" />
                ) : (
                  <div class="w-8 h-8 rounded-full bg-black/10"/>
                )}
                <div class="font-semibold">{r.author_name}</div>
              </div>
              <div class="mb-2"><Stars rating={r.rating || 0}/></div>
              <p class="text-black/80 whitespace-pre-line">{r.text || ''}</p>
              {r.relative_time_description && (
                <div class="text-xs text-black/50 mt-2">{r.relative_time_description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function ContactFooter({ t, email='hello@example.com' }:{ t:any; email?:string }){
  return (
    <footer id="contact" class="border-t bg-white/80 backdrop-blur">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="grid md:grid-cols-3 gap-6 items-start">
          <div>
            <div class="text-xl font-bold mb-2">Fire&Fig</div>
            <p class="text-black/60">{t.contactTitle}</p>
          </div>
          <form class="space-y-3">
            <input class="w-full px-4 py-3 rounded-xl border" placeholder="Name" />
            <input class="w-full px-4 py-3 rounded-xl border" placeholder="Email" type="email" />
            <textarea class="w-full px-4 py-3 rounded-xl border" placeholder="Message" rows={4} />
            <button class="px-5 py-3 rounded-2xl bg-black text-white shadow">Send</button>
          </form>
          <div class="flex items-center gap-2">
            <MailIcon />
            <a class="underline font-semibold" href={`mailto:${email}`}>{email}</a>
          </div>
        </div>
        <div class="text-sm text-black/50 mt-8">{t.footerNote}</div>
      </div>
    </footer>
  );
}

function BottomNav(){
  const items = [
    { id:'home', label:'Home', icon:<HomeIcon/> },
    { id:'menu', label:'Menu', icon:<MenuIcon/> },
    { id:'location', label:'Map', icon:<MapPinIcon/> },
    { id:'reviews', label:'Reviews', icon:<StarIcon/> },
    { id:'contact', label:'Contact', icon:<MailIcon/> },
  ];
  return (
    <nav class="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
      <div class="flex gap-2 bg-white/90 backdrop-blur rounded-2xl shadow-lg px-3 py-2 border">
        {items.map(it => (
          <button key={it.id} onClick={()=>scrollToId(it.id)} class="flex flex-col items-center px-3 py-1 rounded-xl hover:bg-black/5 active:scale-95">
            {it.icon}
            <span class="text-xs">{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// --------- Main ---------
export default function RestaurantLandingPage(props: Props){
  const [lang, setLang] = useLocalStorage<Lang>('lang', 'en');
  const t = I18N[lang];

  const address = props.address || '25 Rue Exemple, 75001 Paris, France';
  const phone = props.phone || '+33 1 23 45 67 89';
  const embedUrl = props.googleMapsEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div class="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(255,237,213,0.5),white)] text-black">
      <div class="fixed top-4 right-4 z-40">
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>

      <Hero t={t} onBook={() => scrollToId('contact')} />
      <About t={t} />
      <MenuSection t={t} />
      <LocationSection t={t} address={address} phone={phone} embedUrl={embedUrl} />
      <ReviewsSection t={t} apiKey={props.apiKey} placeId={props.placeId} />
      <ContactFooter t={t} />
      <BottomNav />
    </div>
  );
}

