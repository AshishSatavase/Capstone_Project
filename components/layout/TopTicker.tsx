"use client";

import { useEffect, useState } from "react";
import { getRates, getNews } from "@/lib/data";
import type { MarketRates, NewsItem } from "@/lib/types";

export function TopTicker() {
  const [rates, setRates] = useState<MarketRates | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Load rates and news on mount
    setRates(getRates());
    setNews(getNews().slice(0, 10)); // Top 10 news items
  }, []);

  // Auto-scroll news ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % (news.length * 100));
    }, 50);
    return () => clearInterval(interval);
  }, [news.length]);

  if (!rates) return null;

  return (
    <div className="border-b border-border bg-white">
      {/* Main ticker row - rates + scrolling news */}
      <div className="flex h-8 items-center bg-white px-4 text-2xs">
        {/* Rates section */}
        <div className="flex items-center gap-6 border-r border-border pr-6">
          <div className="flex items-center gap-1">
            <span className="text-muted">Repo:</span>
            <span className="font-semibold text-ink">
              {rates.repoRate.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted">Rev Repo:</span>
            <span className="font-semibold text-ink">
              {rates.reverseRepoRate.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted">G-Sec 10Y:</span>
            <span className="font-semibold text-ink">
              {rates.gsec10y.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted">USD/INR:</span>
            <span className="font-semibold text-ink">
              {rates.usdInr.toFixed(2)}
            </span>
          </div>
        </div>

        {/* News ticker - scrolling headlines */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex gap-8 whitespace-nowrap pl-6"
            style={{
              transform: `translateX(-${scrollPosition}px)`,
              transition: "transform 0.05s linear",
            }}
          >
            {news.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-ubs-red flex-shrink-0" />
                <span className="text-muted">
                  <span className="font-semibold text-ink">{item.source}:</span>{" "}
                  {item.headline}
                </span>
              </div>
            ))}
            {/* Duplicate for infinite scroll */}
            {news.map((item, idx) => (
              <div key={`${item.id}-dup-${idx}`} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-ubs-red flex-shrink-0" />
                <span className="text-muted">
                  <span className="font-semibold text-ink">{item.source}:</span>{" "}
                  {item.headline}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* As-of timestamp */}
      <div className="border-t border-border bg-faint/5 px-4 py-1 text-2xs text-muted">
        Market data as of {rates.asOf}
      </div>
    </div>
  );
}
