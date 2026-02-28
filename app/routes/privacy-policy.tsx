import type { MetaFunction } from 'react-router';
import {
  HeroSection,
  NavigationSidebar,
  IntroductionSection,
  InformationCollectionSection,
  HowWeUseSection,
  DataSharingSection,
  SecuritySection,
  PrivacyRightsSection,
  CookiesSection,
  ContactSection,
  FooterNote
} from '../components/privacy-policy-component';

export const meta: MetaFunction = () => {
  return [
    { title: 'Privacy Policy - Study Vault' },
    {
      name: 'description',
      content: 'Learn how Study Vault collects, uses, and protects your personal data. Read our privacy policy to understand your rights and our data handling practices.',
    },
    {
      name: 'keywords',
      content: 'study vault privacy policy, data protection, personal information, cookies policy, student data privacy, GDPR',
    },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://studyvault.com/privacy-policy' },
    { property: 'og:title', content: 'Privacy Policy - Study Vault' },
    {
      property: 'og:description',
      content: 'Learn how Study Vault collects, uses, and protects your personal data.',
    },
    { property: 'og:site_name', content: 'Study Vault' },
    { property: 'og:locale', content: 'en_US' },

    // Twitter
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Privacy Policy - Study Vault' },
    {
      name: 'twitter:description',
      content: 'Learn how Study Vault collects, uses, and protects your personal data.',
    },
    { name: 'twitter:site', content: '@studyvault' },

    // Additional SEO
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: 'Study Vault' },
    { name: 'theme-color', content: '#d97757' },
  ];
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-900">
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <NavigationSidebar />

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            <IntroductionSection />
            <InformationCollectionSection />
            <HowWeUseSection />
            <DataSharingSection />
            <SecuritySection />
            <PrivacyRightsSection />
            <CookiesSection />
            <ContactSection />
            <FooterNote />
          </div>
        </div>
      </div>
    </div>
  );
}