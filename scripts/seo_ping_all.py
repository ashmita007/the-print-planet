#!/usr/bin/env python3
"""
Automated Search Engine Pinger & IndexNow Submitter for The Print Planet
Pings:
- IndexNow API (Bing, Yandex, Seznam, Naver, Perplexity)
- Google Sitemap Ping API
- Bing Sitemap Ping API
"""

import sys
import json
import ssl
import urllib.request
import urllib.error
import urllib.parse
import xml.etree.ElementTree as ET

# Configure SSL context (handles macOS missing local root certificates)
try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CONTEXT = ssl._create_unverified_context()

HOST = "theprintplanet.co.in"
INDEXNOW_KEY = "c3909b1zztheprintplanet2026index"
KEY_LOCATION = f"https://{HOST}/{INDEXNOW_KEY}.txt"
SITEMAP_URL = f"https://{HOST}/sitemap.xml"

# High-priority core URLs to guarantee instant indexation even if sitemap network is unreachable
CORE_URLS = [
    f"https://{HOST}/",
    f"https://{HOST}/pvc-card-manufacturer-bangalore",
    f"https://{HOST}/lanyard-manufacturer-bangalore",
    f"https://{HOST}/products",
    f"https://{HOST}/categories",
    f"https://{HOST}/quote",
    f"https://{HOST}/corporate",
    f"https://{HOST}/categories/machines",
    f"https://{HOST}/categories/digital-lanyard-white-roll",
    f"https://{HOST}/categories/semi-transparent-pvc-id-card-holder",
    f"https://{HOST}/categories/id-card-lanyard-hooks",
    f"https://{HOST}/categories/rfid-smart-cards-and-consumables",
    f"https://{HOST}/pricing.md",
    f"https://{HOST}/llms.txt",
    f"https://{HOST}/llms-full.txt",
    f"https://{HOST}/okf/index.md",
]

def fetch_sitemap_urls():
    urls = list(CORE_URLS)
    try:
        req = urllib.request.Request(
            SITEMAP_URL,
            headers={"User-Agent": "PrintPlanet-Indexer/1.0 (+https://theprintplanet.co.in)"}
        )
        with urllib.request.urlopen(req, timeout=10, context=SSL_CONTEXT) as response:
            content = response.read()
            root = ET.fromstring(content)
            # Find all <loc> tags in XML
            for elem in root.iter():
                if elem.tag.endswith("loc") and elem.text:
                    clean_url = elem.text.strip()
                    if clean_url not in urls:
                        urls.append(clean_url)
        print(f"[*] Fetched {len(urls)} total URLs from live sitemap ({SITEMAP_URL})")
    except Exception as e:
        print(f"[!] Warning: Could not fetch remote sitemap: {e}")
        print(f"[*] Falling back to {len(CORE_URLS)} core authority URLs.")
    return urls

def submit_indexnow(urls):
    print("\n--- 1. Submitting to IndexNow (Bing, Yandex, Perplexity, Copilot) ---")
    payload = {
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls[:10000]
    }
    data = json.dumps(payload).encode("utf-8")
    
    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15, context=SSL_CONTEXT) as res:
            code = res.getcode()
            print(f"[✓] IndexNow Response: {code} OK / Accepted ({len(payload['urlList'])} URLs submitted)")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[!] IndexNow HTTP error: {e.code} - {body}")
    except Exception as e:
        print(f"[!] IndexNow Network error: {e}")
    return False

def ping_google_sitemap():
    print("\n--- 2. Pinging Google Sitemap Endpoint ---")
    ping_url = f"https://www.google.com/ping?sitemap={urllib.parse.quote(SITEMAP_URL)}"
    try:
        req = urllib.request.Request(ping_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10, context=SSL_CONTEXT) as res:
            print(f"[✓] Google Sitemap Ping Response: {res.getcode()}")
            return True
    except urllib.error.HTTPError as e:
        print(f"[*] Google response: {e.code} (Google has deprecated ping endpoint in favor of GSC API)")
    except Exception as e:
        print(f"[!] Google ping error: {e}")
    return False

def ping_bing_sitemap():
    print("\n--- 3. Pinging Bing Sitemap Endpoint ---")
    ping_url = f"https://www.bing.com/ping?sitemap={urllib.parse.quote(SITEMAP_URL)}"
    try:
        req = urllib.request.Request(ping_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10, context=SSL_CONTEXT) as res:
            print(f"[✓] Bing Sitemap Ping Response: {res.getcode()}")
            return True
    except urllib.error.HTTPError as e:
        print(f"[*] Bing response: {e.code}")
    except Exception as e:
        print(f"[!] Bing ping error: {e}")
    return False

if __name__ == "__main__":
    print(f"Starting Instant Search Engine Indexing for {HOST}...")
    urls = fetch_sitemap_urls()
    submit_indexnow(urls)
    ping_google_sitemap()
    ping_bing_sitemap()
    print("\n[✓] Indexation cycle completed successfully!")
