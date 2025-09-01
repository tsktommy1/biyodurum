import { useEffect, useMemo, useRef, useState } from "preact/hooks";

type Lang = "fr" | "en" | "de" | "es";

type Review = {
	author_name: string;
	rating: number; // 1-5
	relative_time_description?: string;
	text: string;
};

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_ID = import.meta.env.VITE_GOOGLE_PLACES_ID;
const MAP_QUERY = encodeURIComponent("Biyo Durum Paris");

const i18n: Record<Lang, Record<string, string | string[]>> = {
	fr: {
		brand: "Biyo Dürüm",
		hero_title: "Saisonnier, au feu de bois, inoubliable.",
		hero_sub: "",
		cta_book: "Commander",
		cta_menu: "Voir le menu",
		about_title: "À propos",
		about_body:
		"Biyo Dürüm est un restaurant turc qui invite ses clients à découvrir les saveurs authentiques de la Turquie. Notre établissement propose une expérience culinaire unique avec un menu riche et varié qui met à l'honneur les traditions gastronomiques turques. Du dürüm savoureux aux grillades parfumées, chaque plat est préparé avec des ingrédients frais et de qualité. Notre ambiance chaleureuse et accueillante est idéale pour partager un repas entre amis ou en famille. Venez chez Biyo Dürüm pour un voyage culinaire inoubliable qui éveillera vos sens.",
		menu_title: "Menu",
		menu_sub: "Un aperçu des favoris du soir",
		location_title: "Nous trouver",
		phone_label: "Appeler",
		reviews_title: "Avis des clients",
		reviews_loading: "Chargement des avis…",
		reviews_none: "Pas encore d'avis.",
		contact_title: "Contact",
		contact_hours: "Horaires",
		contact_open: [
			"Lun: Fermé",
			"Mar-Ven: 11:30-23:00",
			"Sam-Dim: 11:30-23:00",
		],
		contact_addr: "Adresse",
		footer_note: "© Biyo Dürüm. Tous droits réservés.",
		cta_order_uber: "Commander sur Uber Eats",
		cta_order_deliveroo: "Commander sur Deliveroo",
	},
	en: {
		brand: "Biyo Dürüm",
		hero_title: "Seasonal, wood-fired, unforgettable.",
		hero_sub: "",
		cta_book: "Order",
		cta_menu: "View Menu",
		about_title: "About",
		about_body:
		"We celebrate simplicity: live-fire cooking, seasonal ingredients, and a cellar of natural wines.",
		menu_title: "Menu",
		menu_sub: "A snapshot of tonight's favorites",
		location_title: "Find Us",
		phone_label: "Call",
		reviews_title: "Guest Reviews",
		reviews_loading: "Loading reviews…",
		reviews_none: "No reviews yet.",
		contact_title: "Contact",
		contact_hours: "Hours",
		contact_open: [
			"Mon: Closed",
			"Tue-Fri: 11:30am-11:00pm",
			"Sat-Sun: 11:30am-11:00pm",
		],
		contact_addr: "Address",
		footer_note: "© Biyo Dürüm. All rights reserved.",
		cta_order_uber: "Order on Uber Eats",
		cta_order_deliveroo: "Order on Deliveroo"
	},
	de: {
		brand: "Biyo Dürüm",
		hero_title: "Saisonal, holzbefeuert, unvergesslich.",
		hero_sub: "",
		cta_book: "Bestellen",
		cta_menu: "Speisekarte",
		about_title: "Über uns",
		about_body:
		"Wir feiern Einfachheit: Holzfeuerküche, saisonale Zutaten und ein Keller mit Naturweinen.",
		menu_title: "Speisekarte",
		menu_sub: "Ein Blick auf die Favoriten des Abends",
		location_title: "Anfahrt",
		phone_label: "Anrufen",
		reviews_title: "Gästebewertungen",
		reviews_loading: "Bewertungen werden geladen…",
		reviews_none: "Noch keine Bewertungen.",
		contact_title: "Kontakt",
		contact_hours: "Öffnungszeiten",
		contact_open: [
			"Mon: Geschlossen",
			"Tue-Fri: 11:30-23:00",
			"Sat-Sun: 11:30-23:00",
		],
		contact_addr: "Adresse",
		footer_note: "© Biyo Dürüm. Alle Rechte vorbehalten.",
		cta_order_uber: "Bestellen auf Uber Eats",
		cta_order_deliveroo: "Bestellen auf Deliveroo",
	},
	es: {
		brand: "Biyo Dürüm",
		hero_title: "De temporada, a la leña, inolvidable.",
		hero_sub: "",
		cta_book: "Pedir",
		cta_menu: "Ver carta",
		about_title: "Sobre nosotros",
		about_body:
		"Celebramos la sencillez: fuego vivo, ingredientes de temporada y una bodega de vinos naturales.",
		menu_title: "Carta",
		menu_sub: "Un vistazo a los favoritos de esta noche",
		location_title: "Dónde estamos",
		phone_label: "Llamar",
		reviews_title: "Opiniones",
		reviews_loading: "Cargando opiniones…",
		reviews_none: "Aún no hay opiniones.",
		contact_title: "Contacto",
		contact_hours: "Horario",
		contact_open: [
			"Lun: Cerrado",
			"Mar-Vie: 11:30-23:00",
			"Sab-Dom: 11:30-23:00",
		],
		contact_addr: "Dirección",
		footer_note: "© Biyo Dürüm. Todos los derechos reservados.",
		cta_order_uber: "Pedir en Uber Eats",
		cta_order_deliveroo: "Pedir en Deliveroo",
	},
};

const flag: Record<Lang, string> = {
	fr: "🇫🇷",
	en: "🇬🇧",
	de: "🇩🇪",
	es: "🇪🇸",
};

const menu = [
	{
		name: {
			en: "Lamb Dürüm",
			fr: "Dürüm Agneau",
			de: "Lamm Dürüm",
			es: "Dürüm de cordero",
		},
		desc: {
			en: "salad, tomato, onion, parsley, rocket, lamb",
			fr: "salade, tomate, oignon, persil, roquette, agneau",
			de: "Salat, Tomate, Zwiebel, Petersilie, Rucola, Lamm",
			es: "Ensalada, tomate, cebolla, perejil, rucula, cordero",
		},
		price: "€13.00"
	},
	{
		name: {
			en: "Beef Dürüm",
			fr: "Dürüm Viande Hâchée",
			de: "Rind Dürüm",
			es: "Dürüm de carne",
		},
		desc: {
			en: "salad, tomato, onion, parsley, rocket, beef",
			fr: "salade, tomate, oignon, persil, roquette, viande hâchée",
			de: "Salat, Tomate, Zwiebel, Petersilie, Rucola, Rind",
			es: "Ensalada, tomate, cebolla, perejil, rucula, carne",
		},
		price: "€11.00"
	},
	{
		name: {
			en: "Chicken Dürüm",
			fr: "Dürüm Poulet",
			de: "Hühner Dürüm",
			es: "Dürüm de pollo",
		},
		desc: {
			en: "salad, tomato, onion, parsley, rocket, chicken",
			fr: "salade, tomate, oignon, persil, roquette, poulet",
			de: "Salat, Tomate, Zwiebel, Petersilie, Rucola, Hühner",
			es: "Ensalada, tomate, cebolla, perejil, rucula, pollo",
		},
		price: "€12.00"
	},
	{
		name: {
			en: "Vegetarian Dürüm",
			fr: "Dürüm Végétarien",
			de: "Vegetarier Dürüm",
			es: "Dürüm vegetariano",
		},
		desc: {
			en: "salad, tomato, onion, parsley, rocket, vegetarian",
			fr: "salade, tomate, oignon, persil, roquette, végétarien",
			de: "Salat, Tomate, Zwiebel, Petersilie, Rucola, Vegetarier",
			es: "Ensalada, tomate, cebolla, perejil, rucula, vegetariano",
		},
		price: "€12.00"
	},
	{
		name: {
			en: "Gozleme",
			fr: "Gozleme",
			de: "Gozleme",
			es: "Gozleme",
		},
		desc: {
			en: "salad, tomato, onion, parsley, rocket, gozleme",
			fr: "salade, tomate, oignon, persil, roquette, gozleme",
			de: "Salat, Tomate, Zwiebel, Petersilie, Rucola, Gozleme",
			es: "Ensalada, tomate, cebolla, perejil, rucula, gozleme",
		},
		price: "€7.00"
	},
	{
		name: {
			en: "Lahmacun",
			fr: "Lahmacun",
			de: "Lahmacun",
			es: "Lahmacun",
		},
		desc: {
			en: "salad, tomato, onion, parsley, rocket, lahmacun",
			fr: "salade, tomate, oignon, persil, roquette, lahmacun",
			de: "Salat, Tomate, Zwiebel, Petersilie, Rucola, Lahmacun",
			es: "Ensalada, tomate, cebolla, perejil, rucula, lahmacun",
		},
		price: "€5.00"
	},
];

const classNames = (...xs: Array<string | false | undefined>) => xs.filter(Boolean).join(" ");

function StarRow({ rating }: { rating: number }) {
	const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
	return (
		<div class="flex gap-0.5" aria-label={`${rating} out of 5`}>
			{stars.map((on, i) => (
				<svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" class="h-4 w-4">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.023 4.102a.563.563 0 00.424.308l4.53.658c.513.074.718.705.346 1.065l-3.276 3.195a.563.563 0 00-.162.498l.773 4.508a.562.562 0 01-.815.592l-4.046-2.128a.563.563 0 00-.524 0L7.27 18.425a.562.562 0 01-.815-.592l.773-4.508a.563.563 0 00-.162-.498L3.79 9.632a.563.563 0 01.346-1.065l4.53-.658a.563.563 0 00.424-.308l2.023-4.102z" />
				</svg>
			))}
		</div>
	);
}

function Section({ id, children, className }: { id: string; children: preact.ComponentChildren; className?: string }) {
	return (
		<section id={id} class={classNames("scroll-mt-24 px-4 py-12 md:py-20", className)}>
			{children}
		</section>
	);
}

export default function Landing() {
	const [lang, setLang] = useState<Lang>("fr");
	const t = useMemo(() => i18n[lang], [lang]);

	const [reviews, setReviews] = useState<Review[]>([]);
	const [loadingReviews, setLoadingReviews] = useState(false);
	const [active, setActive] = useState<string>("home");

	const sections = ["home", "about", "menu", "location", "reviews", "contact"] as const;

	// Intersection Observer for bottom nav active state
	const observers = useRef<IntersectionObserver | null>(null);
	useEffect(() => {
		const opts = { root: null, rootMargin: "-40% 0px -55% 0px", threshold: 0 };
		observers.current = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) setActive(e.target.id);
			});
		}, opts);
		sections.forEach((id) => {
			const el = document.getElementById(id);
			if (el) observers.current?.observe(el);
		});
		return () => observers.current?.disconnect();
	}, []);

	// Fetch Google reviews (optional)
	useEffect(() => {
		async function load() {
			console.log(GOOGLE_PLACES_ID);
			if (!GOOGLE_PLACES_ID || !GOOGLE_PLACES_API_KEY) {
				setReviews(reviews);
				return;
			}
			setLoadingReviews(true);
			try {
				// Place Details API (Fields: reviews)
				// In the browser, this may require a lightweight server proxy to avoid CORS.
				const url = `https://places.googleapis.com/v1/places/${GOOGLE_PLACES_ID}?fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;
				const res = await fetch(url);
				if (!res.ok) throw new Error("Failed to fetch reviews");
				const data = await res.json();
				const mapped: Review[] = (data.reviews || []).map((r: any) => ({
					author_name: r.authorAttribution?.displayName || "Guest",
					rating: r.rating || 0,
					relative_time_description: r.relativePublishTimeDescription,
					text: r.text?.text || r.text || "",
				}));
				setReviews(mapped.length ? mapped : reviews);
			} catch (e) {
				console.warn(e);
				setReviews(reviews);
			} finally {
				setLoadingReviews(false);
			}
		}
		load();
	}, []);

	const jump = (id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<div class="min-h-screen bg-orange-50 text-zinc-900 antialiased">
			{/* Top bar */}
			<header class="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-zinc-200">
				<div class="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
					<div class="font-semibold tracking-tight">{t.brand}</div>
					<nav class="flex items-center gap-2">
						{(Object.keys(i18n) as Lang[]).map((code) => (
							<button
								key={code}
								onClick={() => setLang(code)}
								class={classNames(
									"px-2 py-1 rounded-lg text-sm flex items-center gap-1 transition",
									lang === code ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"
								)}
								aria-pressed={lang === code}
							>
								<span role="img" aria-label={code} class="text-base leading-none">{flag[code]}</span>
								<span class="uppercase">{code}</span>
							</button>
						))}
					</nav>
				</div>
			</header>

			<Section id="home" className="bg-gradient-to-b from-amber-50 to-transparent">
				<div class="mx-auto max-w-5xl grid md:grid-cols-2 gap-8 items-center">
					<div class="space-y-4">
						<h1 class="text-4xl md:text-5xl font-semibold tracking-tight">{t.hero_title}</h1>
						<p class="text-zinc-600 text-lg">{t.hero_sub}</p>
						<div class="flex gap-3 pt-2">
							<a href="#contact" class="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 bg-zinc-900 text-white hover:opacity-90">
								{t.cta_book}
							</a>
							<a href="#menu" class="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 border border-zinc-300 hover:bg-zinc-100">
								{t.cta_menu}
							</a>
						</div>
					</div>
					<div class="aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-sm">
						<img
							src="src/assets/hero.jpeg"
							alt="Dürüms placed on a wooden plate"
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					</div>
				</div>
			</Section>

			<Section id="about">
				<div class="mx-auto max-w-3xl text-center space-y-4">
					<h2 class="text-2xl md:text-3xl font-semibold tracking-tight">{t.about_title}</h2>
					<p class="text-zinc-600 leading-relaxed">{t.about_body}</p>
				</div>
			</Section>

			<Section id="menu" className="bg-white/70">
				<div class="mx-auto max-w-5xl">
					<div class="mb-6 text-center">
						<h2 class="text-2xl md:text-3xl font-semibold tracking-tight">{t.menu_title}</h2>
						<p class="text-zinc-600">{t.menu_sub}</p>
					</div>
					<div class="grid md:grid-cols-3 gap-4">
						{menu.map((item) => (
							<div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
								<div class="flex items-start justify-between gap-4">
									<div>
										<h3 class="font-semibold">{(item.name as any)[lang]}</h3>
										<p class="text-sm text-zinc-600">{(item.desc as any)[lang]}</p>
									</div>
									<div class="font-medium whitespace-nowrap">{item.price}</div>
								</div>
							</div>
						))}
					</div>
				</div>
				{/* order on uber button */}
				<div class="flex justify-center mt-6 gap-2">
					<a href="https://www.ubereats.com/store/biyodurum/j6R5_ANAX0GTv6ls0Yn2zg" class="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 bg-zinc-900 text-white hover:opacity-90">
						{t.cta_order_uber}
					</a>
					<a href="https://deliveroo.fr/menu/paris/paris-10eme-gare-de-lest/biyo-durum" class="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 bg-zinc-900 text-white hover:opacity-90">
						{t.cta_order_deliveroo}
					</a>
				</div>
			</Section>

			<Section id="location">
				<div class="mx-auto max-w-5xl grid md:grid-cols-2 gap-6 items-start">
					<div class="space-y-3">
						<h2 class="text-2xl md:text-3xl text-center font-semibold tracking-tight">{t.location_title}</h2>
						<div class="rounded-2xl overflow-hidden border border-zinc-200">
							<iframe
								title="Map"
								src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
								class="w-full h-72 md:h-[420px]"
								loading="lazy"
								referrerpolicy="no-referrer-when-downgrade"
							/>
						</div>
					</div>
					<div class="space-y-4">
						<div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
							<div class="font-medium mb-2">{t.contact_addr}</div>
							<p class="text-zinc-600">144 Rue du Faubourg Saint-Antoine</p>
						</div>
						<div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
							<div class="font-medium mb-2">{t.contact_hours}</div>
							<ul class="text-zinc-600 space-y-1">
								{(t.contact_open as string[]).map((open) => (
									<li>{open}</li>
								))}
							</ul>
						</div>
						<div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
							<a href="tel:+33782476538" class="inline-flex items-center gap-2">
								<PhoneIcon class="h-5 w-5" />
								<span class="font-medium">{t.phone_label}: +33 7 82 47 65 38</span>
							</a>
						</div>
					</div>
				</div>
			</Section>

			<Section id="reviews" className="bg-white/70">
				<div class="mx-auto max-w-5xl">
					<h2 class="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-6">{t.reviews_title}</h2>
					{loadingReviews && (
						<p class="text-center text-zinc-600">{t.reviews_loading}</p>
					)}
					<div class="grid md:grid-cols-3 gap-4">
						{(reviews || []).map((r, idx) => (
							<div key={idx} class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col gap-3">
								<div class="flex items-center justify-between">
									<div class="font-medium">{r.author_name}</div>
									<StarRow rating={r.rating} />
								</div>
								{r.relative_time_description && (
									<div class="text-xs text-zinc-500">{r.relative_time_description}</div>
								)}
								<p class="text-zinc-700 leading-relaxed">{r.text}</p>
							</div>
						))}
					</div>
					{!loadingReviews && (!reviews || reviews.length === 0) && (
						<p class="text-center text-zinc-600 mt-6">{t.reviews_none}</p>
					)}
				</div>
			</Section>

			<Section id="contact">
				<div class="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
					<div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
						<div class="font-medium mb-2">{t.contact_title}</div>
						<a href="mailto:hello@biyodurum.com" class="text-zinc-600">hello@biyodurum.com</a>
						<br />
						<a href="https://www.instagram.com/biyodurum/" class="text-zinc-600">Instagram</a>
						<br />
						<a href="tel:+33782476538" class="text-zinc-600">+33 7 82 47 65 38</a>
					</div>
					<div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
						<div class="font-medium mb-2">{t.contact_addr}</div>
						<p class="text-zinc-600">144 Rue du Faubourg Saint-Antoine, Paris, 75012</p>
					</div>
					<div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
						<div class="font-medium mb-2">{t.contact_hours}</div>
						<ul class="text-zinc-600 space-y-1">
							{(t.contact_open as string[]).map((open) => (
								<li>{open}</li>
							))}
						</ul>
					</div>
				</div>
				<div class="mx-auto max-w-5xl text-center text-sm text-zinc-500 mt-8">
					{t.footer_note}
				</div>
			</Section>

			<nav class="fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
				<div class="flex gap-1 rounded-3xl border border-zinc-200 bg-white/90 shadow-lg backdrop-blur px-1 py-1">
					{sections.map((id) => (
						<button
							key={id}
							onClick={() => jump(id)}
							class={classNames(
								"flex flex-col items-center justify-center px-2 py-2 rounded-3xl text-xs transition",
								active === id ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"
							)}
							aria-current={active === id ? "page" : undefined}
						>
							{iconFor(id)}
							{/* <span class="capitalize">{id}</span> */}
						</button>
					))}
				</div>
			</nav>
		</div>
	);
}

function PhoneIcon(props: { class?: string }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class={props.class}>
			<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.03a1.5 1.5 0 00-1.086-1.448l-3.471-.993a1.5 1.5 0 00-1.566.54l-.53.662a.75.75 0 01-1.04.125 12.035 12.035 0 01-5.317-5.317.75.75 0 01.125-1.04l.662-.53a1.5 1.5 0 00.54-1.566l-.994-3.471A1.5 1.5 0 007.03 2.25H6a2.25 2.25 0 00-2.25 2.25v2.25z" />
		</svg>
	);
}

function iconFor(id: string) {
	const common = "h-5 w-5";
	switch (id) {
		case "home":
			return (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class={common}>
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
				</svg>
			);
		case "about":
			return (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class={common}>
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
				</svg>
			);
		case "menu":
			return (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class={common}>
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h10" />
				</svg>
			);
		case "location":
			return (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class={common}>
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
				</svg>
			);
		case "reviews":
			return (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class={common}>
					<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3h6.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			);
		case "contact":
			return (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class={common}>
					<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 17.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.286a2.25 2.25 0 01-2.16 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75" />
				</svg>
			);
		default:
			return null;
	}
}
