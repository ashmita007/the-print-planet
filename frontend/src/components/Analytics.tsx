import Script from "next/script";

/**
 * Google Analytics 4 + Microsoft Clarity. Each loads only when its ID is set.
 * NEXT_PUBLIC_* values are inlined at build time, so set them before `next build`
 * (or paste the IDs into the fallbacks below).
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "";

const SAFE_ID = /^[A-Za-z0-9-]+$/;

export default function Analytics() {
  const ga = SAFE_ID.test(GA_ID) ? GA_ID : "";
  const clarity = SAFE_ID.test(CLARITY_ID) ? CLARITY_ID : "";
  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
      {clarity && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}
        </Script>
      )}
    </>
  );
}
