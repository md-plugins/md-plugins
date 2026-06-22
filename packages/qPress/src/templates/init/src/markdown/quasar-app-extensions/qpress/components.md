---
title: Q-Press Components
desc: Components for the Q-Press App Extension for Quasar.
---

Q-Press ships components for the generated docs shell and for Markdown-authored content. Most projects do not need to import the shell components directly, but content authors will use a small set of Markdown components regularly.

| Component                | Typical use                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `MarkdownAnnouncement`   | Render a site-wide dismissible announcement from Site Config.        |
| `MarkdownCampaigns`      | Render restrained opt-in campaign dialogs from Site Config.          |
| `MarkdownPage`           | Wrap custom page layouts that still need Q-Press page behavior.      |
| `MarkdownExample`        | Render a live Vue example from `src/examples`.                       |
| `MarkdownApi`            | Render Quasar-style component API JSON.                              |
| `MarkdownCardTitle`      | Add card-style section headers inside Markdown pages.                |
| `MarkdownCardLink`       | Add compact link cards for related docs or external resources.       |
| `MarkdownCodepen`        | Open examples in CodePen with the site's configured dependencies.    |
| `MarkdownPrerender`      | Control content that should behave differently during SSG prerender. |
| `MarkdownPrivacyConsent` | Render a static-host-friendly privacy notice or consent prompt.      |

The remaining components are primarily used by the generated layout, header, drawer, table-of-contents, and code rendering system. They are documented here for advanced customization and debugging.

## Components

<script import>
import DarkModeToggleApi from '@/.q-press/api/components/DarkModeToggle.json'
import MarkdownAnnouncementApi from '@/.q-press/api/components/MarkdownAnnouncement.json'
import MarkdownApiApi from '@/.q-press/api/components/MarkdownApi.json'
import MarkdownCampaignsApi from '@/.q-press/api/components/MarkdownCampaigns.json'
import MarkdownCardLinkApi from '@/.q-press/api/components/MarkdownCardLink.json'
import MarkdownCardTitleApi from '@/.q-press/api/components/MarkdownCardTitle.json'
import MarkdownCodeApi from '@/.q-press/api/components/MarkdownCode.json'
import MarkdownCodepenApi from '@/.q-press/api/components/MarkdownCodepen.json'
import MarkdownCopyButtonApi from '@/.q-press/api/components/MarkdownCopyButton.json'
import MarkdownDrawerSidebarApi from '@/.q-press/api/components/MarkdownDrawerSidebar.json'
import MarkdownDrawerTocApi from '@/.q-press/api/components/MarkdownDrawerToc.json'

import MarkdownExampleApi from '@/.q-press/api/components/MarkdownExample.json'
import MarkdownHeaderApi from '@/.q-press/api/components/MarkdownHeader.json'
import MarkdownHeaderIconLinksApi from '@/.q-press/api/components/MarkdownHeaderIconLinks.json'
import MarkdownHeaderMenuApi from '@/.q-press/api/components/MarkdownHeaderMenu.json'
import MarkdownHeaderTextLinksApi from '@/.q-press/api/components/MarkdownHeaderTextLinks.json'

import MarkdownLayoutApi from '@/.q-press/api/components/MarkdownLayout.json'
import MarkdownLinkApi from '@/.q-press/api/components/MarkdownLink.json'
import MarkdownPageApi from '@/.q-press/api/components/MarkdownPage.json'
import MarkdownPageFooterApi from '@/.q-press/api/components/MarkdownPageFooter.json'
import MarkdownPageTocApi from '@/.q-press/api/components/MarkdownPageToc.json'

import MarkdownTreeApi from '@/.q-press/api/components/MarkdownTree.json'
import MarkdownPrerenderApi from '@/.q-press/api/components/MarkdownPrerender.json'
import MarkdownPrivacyConsentApi from '@/.q-press/api/components/MarkdownPrivacyConsent.json'

</script>

<MarkdownApi :api="DarkModeToggleApi" name="DarkModeToggle"/>
<MarkdownApi :api="MarkdownAnnouncementApi" name="MarkdownAnnouncement"/>
<MarkdownApi :api="MarkdownApiApi" name="MarkdownApi"/>
<MarkdownApi :api="MarkdownCampaignsApi" name="MarkdownCampaigns"/>
<MarkdownApi :api="MarkdownCardLinkApi" name="MarkdownCardLink"/>
<MarkdownApi :api="MarkdownCardTitleApi" name="MarkdownCardTitle"/>
<MarkdownApi :api="MarkdownCodeApi" name="MarkdownCode"/>
<MarkdownApi :api="MarkdownCodepenApi" name="MarkdownCodepen"/>
<MarkdownApi :api="MarkdownCopyButtonApi" name="MarkdownCopyButton"/>
<!-- No <MarkdownApi :api="MarkdownDrawerSidebarApi" name="MarkdownDrawerSidebar"/> -->
<!-- No <MarkdownApi :api="MarkdownDrawerTocApi" name="MarkdownDrawerToc"/> -->

<MarkdownApi :api="MarkdownExampleApi" name="MarkdownExample"/>
<MarkdownApi :api="MarkdownHeaderApi" name="MarkdownHeader"/>
<MarkdownApi :api="MarkdownHeaderIconLinksApi" name="MarkdownHeaderIconLinks"/>
<MarkdownApi :api="MarkdownHeaderMenuApi" name="MarkdownHeaderMenu"/>
<MarkdownApi :api="MarkdownHeaderTextLinksApi" name="MarkdownHeaderTextLinks"/>

<MarkdownApi :api="MarkdownLayoutApi" name="MarkdownLayout"/>
<MarkdownApi :api="MarkdownLinkApi" name="MarkdownLink"/>
<MarkdownApi :api="MarkdownPageApi" name="MarkdownPage"/>
<MarkdownApi :api="MarkdownPageFooterApi" name="MarkdownPageFooter"/>
<!-- No <MarkdownApi :api="MarkdownPageTocApi" name="MarkdownPageToc"/> -->

<MarkdownApi :api="MarkdownPrerenderApi" name="MarkdownPrerender"/>
<MarkdownApi :api="MarkdownPrivacyConsentApi" name="MarkdownPrivacyConsent"/>
<MarkdownApi :api="MarkdownTreeApi" name="MarkdownTree"/>
