---
template: post
title: Embed github gist and file in gatsby markdown file
slug: gatsby-embed-url
draft: false
date: 2020-12-06T22:36:46.157Z
description: How to embed code from a URL into the Gatsby generated static site
category: Software
---
By default Github gists can be embedded into webpages by using a `<script>` tag.

Unfortunately this doesn't work that nice with Gatsby Remark generated pages because the underlying React Helment component execute the scripts only on first load and then the content of the page dynamically changes. This means that the scripts present on the first page load will be executed but any scripts on pages we further navigate to will only be loaded when refreshing the page.

One option I haven't explored is [migrating to mdx](https://www.gatsbyjs.com/docs/mdx/migrate-remark-to-mdx/) as that seems to be a nice solution for more dynamic content but I realized that I don't plan on embedding content that changes often and it would be a nicer experience to have the content fully static and not loaded by a script.

To achieve this I've create a small gatsby remark plugin, [gatsby-remark-embed-url](https://github.com/ecyshor/gatsby-remark-embed-url/) which fetches the content during build time and embeds it using a code block.

My main usage is for github files and gists, so it accepts any github url and transforms it into a raw url to fetch the data, and expects a raw url for gists and transforms it into a nice gist url to access the data but in theory it should work with any url.

The plugin is used to embed the read-me page for the plugin:

embed-url-code https://github.com/ecyshor/gatsby-remark-embed-url/blob/main/README.md markdown

As you can see we embed the actual markdown as it's not post processed by the plugin but embedded in a code block.
