/**
 * Composant pour injecter dynamiquement les pixels de tracking
 * Charge les pixels depuis l'API et les injecte dans le head ou body
 * 
 * @component TrackingPixels
 * @author OMA Team
 */

"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

interface TrackingPixel {
  id: string
  name: string
  type: string
  pixelId: string
  isActive: boolean
  position: "head" | "body"
  config: any
  description: string | null
  website: string | null
}

export function TrackingPixels() {
  const [pixels, setPixels] = useState<TrackingPixel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPixels = async () => {
      try {
        const res = await fetch("/api/pixels", {
          cache: "no-store",
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setPixels(data.data || [])
          }
        }
      } catch (err) {
        console.error("[TrackingPixels] Erreur chargement pixels:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPixels()
  }, [])

  if (isLoading || pixels.length === 0) {
    return null
  }

  return (
    <>
      {pixels.map((pixel) => {
        // Pixels dans le head
        if (pixel.position === "head") {
          return <HeadPixel key={pixel.id} pixel={pixel} />
        }
        // Pixels dans le body
        return <BodyPixel key={pixel.id} pixel={pixel} />
      })}
    </>
  )
}

// Composant pour les pixels dans le head
function HeadPixel({ pixel }: { pixel: TrackingPixel }) {
  switch (pixel.type) {
    case "FACEBOOK_PIXEL":
      return <FacebookPixel pixelId={pixel.pixelId} />
    case "GOOGLE_ANALYTICS":
      return <GoogleAnalytics pixelId={pixel.pixelId} />
    case "GOOGLE_TAG_MANAGER":
      return <GoogleTagManager pixelId={pixel.pixelId} />
    case "TIKTOK_PIXEL":
      return <TikTokPixel pixelId={pixel.pixelId} />
    case "LINKEDIN_INSIGHT":
      return <LinkedInInsight pixelId={pixel.pixelId} />
    case "TWITTER_PIXEL":
      return <TwitterPixel pixelId={pixel.pixelId} />
    case "PINTEREST_PIXEL":
      return <PinterestPixel pixelId={pixel.pixelId} />
    case "SNAPCHAT_PIXEL":
      return <SnapchatPixel pixelId={pixel.pixelId} />
    case "CUSTOM":
      return <CustomPixel pixel={pixel} />
    default:
      return null
  }
}

// Composant pour les pixels dans le body
function BodyPixel({ pixel }: { pixel: TrackingPixel }) {
  switch (pixel.type) {
    case "FACEBOOK_PIXEL":
      return <FacebookPixelBody pixelId={pixel.pixelId} />
    case "GOOGLE_TAG_MANAGER":
      return <GoogleTagManagerBody pixelId={pixel.pixelId} />
    case "CUSTOM":
      return <CustomPixelBody pixel={pixel} />
    default:
      return null
  }
}

// Facebook Pixel
function FacebookPixel({ pixelId }: { pixelId: string }) {
  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

function FacebookPixelBody({ pixelId }: { pixelId: string }) {
  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )
}

// Google Analytics (GA4)
function GoogleAnalytics({ pixelId }: { pixelId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${pixelId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${pixelId}');
          `,
        }}
      />
    </>
  )
}

// Google Tag Manager
function GoogleTagManager({ pixelId }: { pixelId: string }) {
  return (
    <Script
      id="google-tag-manager"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${pixelId}');
        `,
      }}
    />
  )
}

function GoogleTagManagerBody({ pixelId }: { pixelId: string }) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${pixelId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  )
}

// TikTok Pixel
function TikTokPixel({ pixelId }: { pixelId: string }) {
  return (
    <Script
      id="tiktok-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${pixelId}');
            ttq.page();
          }(window, document, 'ttq');
        `,
      }}
    />
  )
}

// LinkedIn Insight Tag
function LinkedInInsight({ pixelId }: { pixelId: string }) {
  return (
    <Script
      id="linkedin-insight"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          _linkedin_partner_id = "${pixelId}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        `,
      }}
    />
  )
}

// Twitter Pixel
function TwitterPixel({ pixelId }: { pixelId: string }) {
  return (
    <Script
      id="twitter-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          twq('config','${pixelId}');
        `,
      }}
    />
  )
}

// Pinterest Pixel
function PinterestPixel({ pixelId }: { pixelId: string }) {
  return (
    <Script
      id="pinterest-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
          t=window.pintrk;t.queue=[],t.version="3.0";var
          n=document.createElement("script");n.async=!0,n.src=e;var
          r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(n,r)}}("https://s.pinimg.com/ct/core.js");
          pintrk('load', '${pixelId}', {em: ''});
          pintrk('page');
        `,
      }}
    />
  )
}

// Snapchat Pixel
function SnapchatPixel({ pixelId }: { pixelId: string }) {
  return (
    <Script
      id="snapchat-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var script = document.createElement('script');
            script.src = 'https://sc-static.net/scevent.min.js';
            script.async = true;
            script.onload = function() {
              snaptr('init', '${pixelId}', {
                'user_email': ''
              });
              snaptr('track', 'PAGE_VIEW');
            };
            document.head.appendChild(script);
          })();
        `,
      }}
    />
  )
}

// Script personnalisé
function CustomPixel({ pixel }: { pixel: TrackingPixel }) {
  const customScript = pixel.config?.script || ""
  if (!customScript) return null

  return (
    <Script
      id={`custom-pixel-${pixel.id}`}
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: customScript,
      }}
    />
  )
}

function CustomPixelBody({ pixel }: { pixel: TrackingPixel }) {
  const customScript = pixel.config?.script || ""
  if (!customScript) return null

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: customScript,
      }}
    />
  )
}

