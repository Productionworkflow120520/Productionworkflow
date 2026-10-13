"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export interface BrandingData {
  appName: string;
  tagline: string;
  logoUrl: string;
  mobileLogoUrl: string;
  faviconUrl: string;
  loginBannerText: string;
  supportEmail: string;
  supportPhone: string;
  primaryColor: string;
  accentColor: string;
  secondaryAccent: string;
  version: number;
  updatedAt: string;
  cacheBuster: string;
}

export const FALLBACK_BRANDING: BrandingData = {
  appName: "Recharge Pro",
  tagline: "All Recharge • Bill Payments • Digital Services",
  logoUrl: "/images/rechargepro-logo.png",
  mobileLogoUrl: "/images/rechargepro-logo.png",
  faviconUrl: "/images/rechargepro-logo.png",
  loginBannerText: "India's Premier Digital Recharge & Utility Payment Platform",
  supportEmail: "support@rechargepro.in",
  supportPhone: "+91 98000 12345",
  primaryColor: "#0f172a",
  accentColor: "#2563eb",
  secondaryAccent: "#10b981",
  version: 1,
  updatedAt: new Date().toISOString(),
  cacheBuster: Date.now().toString(),
};

interface BrandingContextType {
  branding: BrandingData;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: FALLBACK_BRANDING,
  isLoading: false,
  refreshBranding: async () => {},
});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingData>(FALLBACK_BRANDING);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBranding = useCallback(async () => {
    try {
      const res = await fetch(`/api/branding?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const config = json.data as BrandingData;
          setBranding(config);

          // Dynamically update document title & favicon in real time
          if (typeof document !== "undefined") {
            const currentTitle = document.title;
            if (!currentTitle || currentTitle.includes("PayMatrix") || currentTitle.includes("Recharge Pro") || currentTitle.includes("Recharge")) {
              document.title = `${config.appName} — ${config.tagline}`;
            }

            // Update favicon link if present
            let faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!faviconLink) {
              faviconLink = document.createElement("link");
              faviconLink.rel = "icon";
              document.head.appendChild(faviconLink);
            }
            faviconLink.href = `${config.faviconUrl}?v=${config.cacheBuster}`;
          }
        }
      }
    } catch (err) {
      console.warn("Branding fetch failed, using fallback:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();

    // BroadcastChannel for instant cross-tab and cross-component updates
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel("rechargepro_branding_channel");
      channel.onmessage = (event) => {
        if (event.data?.type === "BRANDING_UPDATED") {
          fetchBranding();
        }
      };
    }

    return () => {
      if (channel) channel.close();
    };
  }, [fetchBranding]);

  const refreshBranding = useCallback(async () => {
    await fetchBranding();
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("rechargepro_branding_channel");
      channel.postMessage({ type: "BRANDING_UPDATED", timestamp: Date.now() });
      channel.close();
    }
  }, [fetchBranding]);

  const contextValue = useMemo(
    () => ({ branding, isLoading, refreshBranding }),
    [branding, isLoading, refreshBranding]
  );

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  return context;
}
