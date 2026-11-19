import { DOCUMENT } from '@angular/common';
import { inject, LOCALE_ID, Service } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DEFAULT_LOCALE, LOCALES, SITE_URL } from './site';

export interface SeoData {
  title: string;
  description: string;
  /** Chemin sans préfixe de langue, ex. `/films` ou `/films/<id>`. */
  path: string;
  image?: string;
  /** Données structurées schema.org (JSON-LD). */
  jsonLd?: Record<string, unknown>;
}

/** Balises SEO d'une page : title, description, canonical, hreflang, Open Graph, Twitter, JSON-LD. */
@Service()
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly locale = inject(LOCALE_ID).slice(0, 2);

  set(data: SeoData): void {
    const url = this.url(this.locale, data.path);
    this.title.setTitle(data.title);

    const tags: Record<string, string> = {
      description: data.description,
      robots: 'index, follow, max-image-preview:large',
      'og:type': 'website',
      'og:site_name': 'Studio Ghibli',
      'og:title': data.title,
      'og:description': data.description,
      'og:url': url,
      'og:locale': this.locale === 'fr' ? 'fr_FR' : 'en_US',
      'twitter:card': data.image ? 'summary_large_image' : 'summary',
      'twitter:title': data.title,
      'twitter:description': data.description,
    };
    if (data.image) {
      tags['og:image'] = data.image;
      tags['twitter:image'] = data.image;
    }
    for (const [name, content] of Object.entries(tags)) {
      const attr = name.startsWith('og:') ? 'property' : 'name';
      this.meta.updateTag({ [attr]: name, content }, `${attr}="${name}"`);
    }
    if (!data.image) {
      this.meta.removeTag('property="og:image"');
      this.meta.removeTag('name="twitter:image"');
    }

    this.link('canonical', url);
    this.alternates(data.path);
    this.structuredData(data.jsonLd);
  }

  private url(locale: string, path: string): string {
    return `${SITE_URL}/${locale}${path}`;
  }

  /** <link rel="alternate" hreflang> vers chaque langue + x-default. */
  private alternates(path: string): void {
    this.doc.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove());
    for (const l of LOCALES) this.link('alternate', this.url(l, path), l);
    this.link('alternate', this.url(DEFAULT_LOCALE, path), 'x-default');
  }

  private link(rel: string, href: string, hreflang?: string): void {
    let el = hreflang
      ? null
      : this.doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]:not([hreflang])`);
    if (!el) {
      el = this.doc.createElement('link');
      el.rel = rel;
      this.doc.head.appendChild(el);
    }
    if (hreflang) el.setAttribute('hreflang', hreflang);
    el.href = href;
  }

  private structuredData(json?: Record<string, unknown>): void {
    this.doc.head.querySelector('script[data-seo-jsonld]')?.remove();
    if (!json) return;
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', '');
    // '<' échappé : empêche de fermer la balise <script> avec du contenu venant de l'API
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', ...json }).replace(
      /</g,
      '\\u003c',
    );
    this.doc.head.appendChild(script);
  }
}
