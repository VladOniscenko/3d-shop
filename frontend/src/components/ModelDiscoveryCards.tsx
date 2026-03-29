import { ExternalLink, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "../i18n/I18nContext";
import {
  MakerWorldLogo,
  PrintablesLogo,
  ThingiverseLogo,
} from "./logos/ModelReferenceLogos";

type ModelSourceCard = {
  id: string;
  url: string;
  icon: ReactNode;
  isExternal?: boolean;
};

type ModelDiscoveryCardsProps = {
  compact?: boolean;
  lowEmphasis?: boolean;
  inlineMinimal?: boolean;
};

export default function ModelDiscoveryCards({
  compact = false,
  lowEmphasis = false,
  inlineMinimal = false,
}: ModelDiscoveryCardsProps) {
  const { t } = useI18n();

  const cards: ModelSourceCard[] = [
    {
      id: "makerworld",
      url: "https://makerworld.com/",
      icon: <MakerWorldLogo className="h-5 w-auto text-[#0b5a54]" />,
      isExternal: true,
    },
    {
      id: "printables",
      url: "https://www.printables.com/model",
      icon: <PrintablesLogo className="h-4 w-auto text-[#0b5a54]" />,
      isExternal: true,
    },
    {
      id: "thingiverse",
      url: "https://www.thingiverse.com/",
      icon: <ThingiverseLogo className="h-4 w-auto text-[#0b5a54]" />,
      isExternal: true,
    },
    {
      id: "custom",
      url: "/quote",
      icon: <Sparkles size={20} className="text-[#0b5a54]" />,
      isExternal: false,
    },
  ];

  return inlineMinimal ? (
    <section className="rounded-xl border border-[#deebe5] bg-white/65 px-3 py-2 reveal-soft">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5f736d]">
          {t("home.modelFinder.title")}
        </span>
        {cards
          .filter((card) => card.id !== "custom")
          .map((card) => (
            <a
              key={card.id}
              href={card.url}
              target={card.isExternal ? "_blank" : undefined}
              rel={card.isExternal ? "noreferrer noopener" : undefined}
              className="inline-flex items-center gap-1 rounded-md border border-[#d7e6df] bg-white px-2 py-1 text-[11px] font-semibold text-[#2b5a47] hover:bg-[#f4faf7]"
            >
              <span className="max-w-[85px] truncate">
                {t(`home.modelFinder.${card.id}.title`)}
              </span>
              <ExternalLink size={11} className="text-[#6a7f77]" />
            </a>
          ))}
      </div>
    </section>
  ) : (
    <section
      className={`site-section reveal-soft ${compact ? "p-3 sm:p-4" : "p-6 sm:p-8"}`}
    >
      {!lowEmphasis ? (
        <div className={compact ? "mb-3" : "mb-5 sm:mb-6"}>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c9ddd6] bg-[#f8fcfa] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#2c4f46]">
            {t("home.modelFinder.badge")}
          </p>
          <h3
            className={`site-heading mt-3 font-black ${compact ? "text-xl" : "text-3xl"}`}
          >
            {t("home.modelFinder.title")}
          </h3>
          {!compact ? (
            <p className="site-subheading mt-2 max-w-3xl text-sm sm:text-base">
              {t("home.modelFinder.subtitle")}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#5f736d]">
          {t("home.modelFinder.title")}
        </p>
      )}

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? "lg:grid-cols-4 gap-2.5" : "xl:grid-cols-4 gap-4"}`}
      >
        {cards.map((card, index) => (
          <a
            key={card.id}
            href={card.url}
            target={card.isExternal ? "_blank" : undefined}
            rel={card.isExternal ? "noreferrer noopener" : undefined}
            className={`group rounded-2xl border border-[#d9e8e1] bg-white/90 ${compact ? "p-3" : "p-5"} shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 reveal-up ${index === 0 ? "stagger-1" : index === 1 ? "stagger-2" : index === 2 ? "stagger-3" : "stagger-4"}`}
          >
            <div
              className={`flex items-center justify-between ${compact ? "mb-3" : "mb-4"}`}
            >
              <div
                className={`inline-flex items-center justify-center rounded-xl bg-[#e9f6f0] px-2 ${compact ? "h-9" : "h-10"}`}
              >
                {card.icon}
              </div>
              {card.isExternal ? (
                <ExternalLink size={16} className="text-[#5d726b]" />
              ) : null}
            </div>

            <h4
              className={`font-extrabold text-[#1a2b25] ${compact ? "text-sm" : "text-lg"}`}
            >
              {t(`home.modelFinder.${card.id}.title`)}
            </h4>
            <p
              className={`leading-relaxed text-[#60736d] ${compact ? "mt-1 text-[11px]" : "mt-2 text-sm"}`}
            >
              {t(`home.modelFinder.${card.id}.desc`)}
            </p>
            <span
              className={`inline-flex items-center font-bold uppercase tracking-[0.08em] text-[#0f766e] ${compact ? "mt-2 text-[10px]" : "mt-4 text-xs"}`}
            >
              {t(`home.modelFinder.${card.id}.cta`)}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
