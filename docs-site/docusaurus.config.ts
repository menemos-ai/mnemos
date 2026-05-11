import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Mnemos',
  tagline: 'On-Chain AI Agent Memory Protocol',

  url: 'https://mnemos-docs.vercel.app',
  baseUrl: '/',

  organizationName: 'menemos-ai',
  projectName: 'docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/menemos-ai/docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Mnemos',
      items: [
        {
          to: '/getting-started/quickstart',
          label: 'Quick Start',
          position: 'left',
        },
        {
          to: '/sdk/overview',
          label: 'SDK',
          position: 'left',
        },
        {
          to: '/api/overview',
          label: 'API',
          position: 'left',
        },
        {
          to: '/agent-to-agent',
          label: 'Agent to Agent',
          position: 'left',
        },
        {
          href: 'https://github.com/menemos-ai',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/' },
            { label: 'Quick Start', to: '/getting-started/quickstart' },
            { label: 'SDK Reference', to: '/sdk/overview' },
            { label: 'REST API', to: '/api/overview' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'GitHub', href: 'https://github.com/menemos-ai' },
            { label: '0G Network', href: 'https://0g.ai' },
            { label: 'Chain Explorer', href: 'https://chainscan.0g.ai' },
            { label: 'Faucet', href: 'https://faucet.0g.ai' },
          ],
        },
      ],
      copyright: `Built on 0G Network · ${new Date().getFullYear()} Mnemos`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
