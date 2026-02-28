import type { MetaFunction } from 'react-router';
import {
  HeroSection,
  NavigationSidebar,
  QuickSummarySection,
  IntroductionSection,
  UserAccountsSection,
  AcceptableUseSection,
  ProhibitedContentSection,
  UserContentSection,
  IntellectualPropertySection,
  TerminationSection,
  DisclaimersSection,
  ContactSection,
  AcknowledgmentSection
} from '../components/terms-of-service-component';

export const meta: MetaFunction = () => {
  return [
    { title: 'Terms of Service - Study Vault' },
    {
      name: 'description',
      content: 'Read Study Vault\'s Terms of Service. Understand your rights and responsibilities when using our platform to upload, share, and access educational resources.',
    },
    {
      name: 'keywords',
      content: 'study vault terms of service, terms and conditions, user agreement, acceptable use policy, student platform terms',
    },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://studyvault.com/terms-of-service' },
    { property: 'og:title', content: 'Terms of Service - Study Vault' },
    {
      property: 'og:description',
      content: 'Read Study Vault\'s Terms of Service. Understand your rights and responsibilities when using our platform.',
    },
    { property: 'og:site_name', content: 'Study Vault' },
    { property: 'og:locale', content: 'en_US' },

    // Twitter
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Terms of Service - Study Vault' },
    {
      name: 'twitter:description',
      content: 'Read Study Vault\'s Terms of Service. Understand your rights and responsibilities when using our platform.',
    },
    { name: 'twitter:site', content: '@studyvault' },

    // Additional SEO
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: 'Study Vault' },
    { name: 'theme-color', content: '#d97757' },
  ];
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-900">
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <NavigationSidebar />

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            <QuickSummarySection />
            <IntroductionSection />
            <UserAccountsSection />
            <AcceptableUseSection />
            <ProhibitedContentSection />
            <UserContentSection />
            <IntellectualPropertySection />
            <TerminationSection />
            <DisclaimersSection />
            <ContactSection />
            <AcknowledgmentSection />
          </div>
        </div>
      </div>
    </div>
  );
}
