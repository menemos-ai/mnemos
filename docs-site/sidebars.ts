import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        'concepts/problem',
        'concepts/architecture',
        'concepts/memory-tokens',
        'concepts/marketplace',
        'concepts/privacy',
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/environment',
        'getting-started/quickstart',
      ],
    },
    {
      type: 'category',
      label: 'SDK Reference',
      collapsed: false,
      items: [
        'sdk/overview',
        'sdk/snapshot',
        'sdk/auto-snapshot',
        'sdk/marketplace',
        'sdk/load-memory',
        'sdk/types-reference',
        'sdk/configuration',
      ],
    },
    {
      type: 'category',
      label: 'REST API',
      collapsed: false,
      items: [
        'api/overview',
        'api/authentication',
        'api/memory-api',
        'api/marketplace-api',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/marketplace-guide',
        'guides/reference-agent',
        'guides/arbitrage-agent',
        'agent-to-agent',
      ],
    },
  ],
};

export default sidebars;
