import { useState } from "react";
import { Globe, Phone, MapPin, Star } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

const menuItems = [
	{
		id: "agneau",
		name: { fr: "Le Dürüm Agneau", en: "Lamb Dürüm", es: "Dürüm de Cordero", de: "Dürüm Lamm" },
		price: 10.5,
		img: "./assets/image00003.jpeg",
		ingredients: ["salade", "tomate", "oignon", "persil", "roquette", "agneau"],
		spices: ["sumak", "paprika"],
		allergens: ["gluten", "lait"]
	}
];

const translations = {
	fr: { menu: "Menu", order: "Commander", reviews: "Avis", contact: "Contact", ingredients: "Ingrédients", },
	en: { menu: "Menu", order: "Order", reviews: "Reviews", contact: "Contact", ingredients: "Ingredients", },
	es: { menu: "Menú", order: "Pedido", reviews: "Opiniones", contact: "Contacto", ingredients: "Ingredientes", },
	de: { menu: "Speisekarte", order: "Bestellen", reviews: "Bewertungen", contact: "Kontakt", ingredients: "Zutaten", },
};

function MenuCard({ item, t, lang }) {
	return (
		<div id={item.id}>
			<img src={item.img} alt={item.name[lang]} loading="lazy" />
			<div> 
				<h2>
					<span>{item.name[lang]}</span>
					<span>{item.price.toFixed(2)}€</span>
				</h2>
				<p><strong>{t.ingredients}:</strong> {item.ingredients.join(", ")}</p>
				<p><strong>{t.spices}:</strong> {item.spices.join(", ")}</p>
				<p><strong>{t.allergens}:</strong> {item.allergens.join(", ")}</p>
			</div>
		</div>);
}

export function Home() {
	const [lang, setLang] = useState("fr");



	const t = translations[lang];

	return (
		<div className="min-h-screen mb-8 bg-orange-50 flex flex-col">
			{/* Header */}
			<header className="p-4 flex justify-between items-center bg-orange-100 shadow-md">
				<h1 className="text-xl font-bold word">BIYO DÜRÜM</h1>
				<select
					className="border rounded p-1"
					value={lang}
					onChange={(e) => setLang((e.target as HTMLOptionElement).value)}
				>
					<option value="fr">FR</option>
					<option value="en">EN</option>
					<option value="es">ES</option>
					<option value="de">DE</option>
				</select>
			</header>

			{/* Hero */}
			<section className="text-center p-6">
				<h2 className="text-2xl font-bold mb-2">100% Maison · 100% Saveur · 100% BiyoDürüm</h2>
				<p className="text-gray-700">Faites au feu de bois, servis à la minute – un goût authentique sous vos yeux.</p>
			</section>

			{/* Menu Section */}
			<section id="menu" className="p-4">
				<h3 className="text-xl font-semibold mb-4">{t.menu}</h3>
				<div className="flex gap-4">
					{menuItems.map(item => (
						<MenuCard key={item.id} item={item} t={t} lang={lang} />
					))}
				</div>
			</section>

			{/* Reviews */}
			<section id="reviews" className="p-4 bg-beige-50">
				<h3 className="text-xl font-semibold mb-4">{t.reviews}</h3>
				<div className="space-y-3">
					{["Excellent!", "Super bon!", "Top qualité!"].map((rev, i) => (
						<div key={i} className="p-3 border rounded-lg flex items-center gap-2">
							<Star className="w-4 h-4 text-yellow-500" />
							<p>{rev}</p>
						</div>
					))}
				</div>
			</section>

			{/* Map */}
			<section id="contact" className="p-4">
				<h3 className="text-xl font-semibold mb-4">{t.contact}</h3>
				<iframe
					className="w-full h-64 rounded-2xl"
					src="https://www.openstreetmap.org/export/embed.html?bbox=2.3775583505630498%2C48.84735297172645%2C2.3826277256011967%2C48.85342445915591&amp;layer=mapnik&amp;marker=48.85038880747024%2C2.380093038082123"
					allowFullScreen />
				<br/>
				<small><a href="https://www.openstreetmap.org/?mlat=48.850389&amp;mlon=2.380093#map=18/48.850389/2.380093">View Larger Map</a></small>
				<Button className="mt-4 w-full flex items-center justify-center gap-2">
					<Phone className="w-4 h-4" /> +33 6 12 34 56 78
				</Button>
			</section>

		</div>
	);
}

