import type { MetaFunction } from 'react-router';
import { HowItWorks } from '../components/home-page-components/HowItWorks';
import { CallToAction } from '~/components/home-page-components/CallToAction';
import { Features } from '~/components/home-page-components/Features';

export const meta: MetaFunction = () => {
  return [
    { title: 'Features - Study Vault | Smart Tools for Students' },
    {
      name: 'description',
      content: 'Discover Study Vault\'s powerful features — upload, organize, search, and share educational resources. Smart pagination, instant search, and a collaborative student community.',
    },
    {
      name: 'keywords',
      content: 'study vault features, student tools, upload resources, organize notes, search study materials, academic collaboration, smart pagination, resource sharing',
    },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://studyvault.com/features' },
    { property: 'og:title', content: 'Features - Study Vault | Smart Tools for Students' },
    {
      property: 'og:description',
      content: 'Discover Study Vault\'s powerful features — upload, organize, search, and share educational resources with students worldwide.',
    },
    { property: 'og:site_name', content: 'Study Vault' },
    { property: 'og:locale', content: 'en_US' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Features - Study Vault | Smart Tools for Students' },
    {
      name: 'twitter:description',
      content: 'Discover Study Vault\'s powerful features — upload, organize, search, and share educational resources with students worldwide.',
    },
    { name: 'twitter:site', content: '@studyvault' },

    // Additional SEO
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: 'Study Vault' },
    { name: 'theme-color', content: '#d97757' },

    // Schema.org
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Study Vault Features',
        description: 'Discover Study Vault\'s powerful features for uploading, organizing, and sharing educational resources.',
        url: 'https://studyvault.com/features',
        isPartOf: { '@type': 'WebSite', name: 'Study Vault', url: 'https://studyvault.com' },
      },
    },
  ];
};

export default function FeaturesPage()     {
    return (
        <div className="min-h-screen bg-[#f5f5f0]">
            <Features />

            {/* Stats Section */}
            <section className="py-20 bg-linear-to-br from-[#d97757] to-[#c66847] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-4">
                            Join Thousands of Students
                        </h2>
                        <p className="text-xl font-body opacity-90">
                            Making a difference in academic communities worldwide
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { number: `150+`, label: "Active Students" },
                            { number: "250+", label: "Resources Shared" },
                            { number: "1K+", label: "Downloads" },
                            { number: "99%", label: "Satisfaction Rate" }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-5xl font-heading font-bold mb-2">{stat.number}</div>
                                <div className="text-lg font-body opacity-90">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <HowItWorks />
            <CallToAction />
        </div>
    );
}