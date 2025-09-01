import { useLocation } from 'preact-iso';
import { Globe, MapPin, Star, ForkKnife } from "lucide-react";

export function Nav() {
	// const { url } = useLocation();

	return (
		<footer>
			<nav className="fixed bottom-0 left-0 right-0 flex justify-around
				p-2 shadow-md bg-orange-100">
				<a href="#menu" className="flex flex-col items-center text-sm"><ForkKnife className="w-5 h-5" /></a>
				<a href="#reviews" className="flex flex-col items-center text-sm"><Star className="w-5 h-5" /></a>
				<a href="#contact" className="flex flex-col items-center text-sm"><MapPin className="w-5 h-5" /></a>
			</nav>
		</footer>
	);
}
