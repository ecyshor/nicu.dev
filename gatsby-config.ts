import path from "path";

import config from "./content/config.json";
import * as types from "./internal/gatsby/types";

export default {
  pathPrefix: config.pathPrefix,
  siteMetadata: {
    url: config.url,
    title: config.title,
    subtitle: config.subtitle,
    copyright: config.copyright,
    disqusShortname: config.disqusShortname,
    menu: config.menu,
    author: config.author,
    postsLimit: config.postsPerPage
  },
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "content",
        path: path.resolve("content"),
      },
    },
    {
      resolve: "gatsby-plugin-feed",
      options: {
        query: `
          {
            site {
              siteMetadata {
                url
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({
              query: { site, allMarkdownRemark },
            }: {
              query: {
                site: {
                  siteMetadata: {
                    url: string;
                  };
                };
                allMarkdownRemark: {
                  edges: Array<types.Edge>;
                };
              };
            }) =>
              allMarkdownRemark.edges.map(({ node }) => ({
                ...node.frontmatter,
                date: node?.frontmatter?.date,
                description: node?.frontmatter?.description,
                url:
                  site.siteMetadata.url +
                  (node.frontmatter?.slug || node.fields?.slug),
                guid:
                  site.siteMetadata.url +
                  (node.frontmatter?.slug || node.fields?.slug),
                custom_elements: [{ "content:encoded": node.html }],
              })),
            query: `
              {
                allMarkdownRemark(
                  limit: 1000,
                  sort: { order: DESC, fields: [frontmatter___date] },
                  filter: { frontmatter: { template: { eq: "post" }, draft: { ne: true } } }
                ) {
                  edges {
                    node {
                      html
                      fields {
                        slug
                      }
                      frontmatter {
                        date
                        title
                        slug
                        description
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: config.title,
          },
        ],
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          // "gatsby-remark-embed-url",
          // {
          //   resolve: "gatsby-remark-katex",
          //   options: {
          //     strict: "ignore",
          //   },
          // },
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 960,
              withWebp: true,
            },
          },
          {
            resolve: "gatsby-remark-responsive-iframe",
            options: { wrapperStyle: "margin-bottom: 1.0725rem" },
          },
          "gatsby-remark-autolink-headers",
          "gatsby-remark-prismjs",
          "gatsby-remark-copy-linked-files",
          "gatsby-remark-smartypants",
          "gatsby-remark-external-links",
        ],
      },
    },
    "gatsby-plugin-netlify",
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        query: `
          {
            site {
              siteMetadata {
                siteUrl: url
              }
            }
            allSitePage(
              filter: {
                path: { regex: "/^(?!/404/|/404.html|/dev-404-page/)/" }
              }
            ) {
              nodes {
                path
              }
            }
          }
        `,
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: config.title,
        short_name: config.title,
        theme_color: "hsl(31, 92%, 62%)",
        background_color: "hsl(0, 0%, 100%)",
        display: "standalone",
        icon: "content/photo.jpg",
        start_url: "/",
      },
    },
    "gatsby-plugin-remove-serviceworker",
    "gatsby-plugin-image",
    "gatsby-plugin-catch-links",
    "gatsby-plugin-optimize-svgs",
    "gatsby-plugin-sass",
  ],
};
