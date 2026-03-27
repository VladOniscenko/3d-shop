import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type RouteSeo = {
  title: string;
  description: string;
  keywords: string;
  index: boolean;
};

const DEFAULT_SEO: RouteSeo = {
  title: "3D Print Service Nederland | PrintCraft",
  description:
    "Professionele 3D print service voor heel Nederland. Upload je model en ontvang snel een quote.",
  keywords:
    "3D print service Nederland, 3D printen Nederland, online 3D print service, prototype printen",
  index: true,
};

const SEO_BY_ROUTE: Record<string, RouteSeo> = {
  "/": {
    title: "3D Print Service Nederland | PrintCraft",
    description:
      "Professionele 3D print service voor prototypes, onderdelen en maatwerk prints in heel Nederland.",
    keywords:
      "3D print service Nederland, 3D printen Nederland, online 3D print service, maatwerk 3D print",
    index: true,
  },
  "/gallery": {
    title: "3D Print Modellen Galerie | PrintCraft Nederland",
    description:
      "Bekijk populaire 3D print modellen en start direct je bestelling vanuit heel Nederland.",
    keywords: "3D modellen printen, 3D print galerie, 3D print Nederland",
    index: true,
  },
  "/materials": {
    title: "3D Print Materialen (PLA, PETG) | PrintCraft NL",
    description:
      "Kies het juiste 3D print materiaal en kleur voor jouw project. Overzicht van beschikbare filaments.",
    keywords: "PLA printen, PETG printen, 3D filament Nederland, 3D materialen",
    index: true,
  },
  "/how-it-works": {
    title: "Hoe Werkt Onze 3D Print Service | PrintCraft",
    description:
      "Van upload tot levering: ontdek hoe je in een paar stappen jouw 3D model laat printen in Nederland.",
    keywords:
      "hoe werkt 3D print service, 3D print proces, 3D printen Nederland",
    index: true,
  },
  "/faq": {
    title: "FAQ 3D Printen | PrintCraft Nederland",
    description:
      "Veelgestelde vragen over levertijd, materialen, prijzen en kwaliteit van onze 3D print service.",
    keywords: "3D print FAQ, 3D print vragen, 3D print Nederland",
    index: true,
  },
  "/login": {
    title: "Inloggen | PrintCraft",
    description: "Log in op je PrintCraft account.",
    keywords: "PrintCraft login",
    index: false,
  },
  "/signup": {
    title: "Account Aanmaken | PrintCraft",
    description: "Maak een PrintCraft account aan.",
    keywords: "PrintCraft registratie",
    index: false,
  },
  "/quote": {
    title: "Quote Aanvragen | PrintCraft",
    description: "Vraag een 3D print quote aan.",
    keywords: "3D print quote",
    index: false,
  },
  "/orders": {
    title: "Mijn Orders | PrintCraft",
    description: "Bekijk je orderoverzicht.",
    keywords: "orders",
    index: false,
  },
  "/cart": {
    title: "Winkelwagen | PrintCraft",
    description: "Rond je bestelling af.",
    keywords: "winkelwagen",
    index: false,
  },
};

function upsertMetaByName(name: string, content: string) {
  let meta = document.querySelector(`meta[name=\"${name}\"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property=\"${property}\"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function upsertCanonical(url: string) {
  let link = document.querySelector(
    "link[rel='canonical']",
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.href = url;
}

function upsertJsonLd(pathname: string, canonicalUrl: string) {
  const existing = document.getElementById("seo-jsonld");
  if (existing) {
    existing.remove();
  }

  if (pathname !== "/") {
    return;
  }

  const script = document.createElement("script");
  script.id = "seo-jsonld";
  script.type = "application/ld+json";
  script.text = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "PrintCraft",
          url: window.location.origin,
          inLanguage: "nl-NL",
        },
        {
          "@type": "LocalBusiness",
          name: "PrintCraft",
          url: window.location.origin,
          areaServed: ["Netherlands"],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Rotterdam",
            addressCountry: "NL",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 51.9244,
            longitude: 4.4777,
          },
          sameAs: [],
        },
        {
          "@type": "WebPage",
          name: "3D Print Service Nederland",
          url: canonicalUrl,
          inLanguage: "nl-NL",
        },
      ],
    },
    null,
    2,
  );
  document.head.appendChild(script);
}

export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const isOrderDetail = location.pathname.startsWith("/orders/");
    const routeSeo = isOrderDetail
      ? { ...SEO_BY_ROUTE["/orders"], index: false }
      : SEO_BY_ROUTE[location.pathname] || DEFAULT_SEO;

    const canonicalUrl = `${window.location.origin}${location.pathname}`;

    document.documentElement.lang = "nl-NL";
    document.title = routeSeo.title;

    upsertMetaByName("description", routeSeo.description);
    upsertMetaByName("keywords", routeSeo.keywords);
    upsertMetaByName(
      "robots",
      routeSeo.index ? "index, follow" : "noindex, nofollow",
    );

    upsertMetaByProperty("og:title", routeSeo.title);
    upsertMetaByProperty("og:description", routeSeo.description);
    upsertMetaByProperty("og:url", canonicalUrl);
    upsertMetaByProperty("og:locale", "nl_NL");

    upsertMetaByName("twitter:title", routeSeo.title);
    upsertMetaByName("twitter:description", routeSeo.description);

    upsertCanonical(canonicalUrl);
    upsertJsonLd(location.pathname, canonicalUrl);
  }, [location.pathname]);

  return null;
}
