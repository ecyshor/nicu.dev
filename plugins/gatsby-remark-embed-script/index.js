const visit = require("unist-util-visit")
const toString = require("mdast-util-to-string")
const fetch = require('node-fetch');

module.exports = async ({ markdownAST }, pluginOptions) => {
  var nodes = []
  visit(markdownAST, "paragraph", node => {
    if(node.children.length != 3) return
    const textNode = node.children[0]
    const linkNode = node.children[1]
    if(textNode.type !== 'text' || textNode.value.trim() !== 'embed-url-code') return
    if(linkNode.type !== 'link') return
    const lang = node.children[2].value.trim()
    console.log("Fetching url for code block: " + linkNode.url)
    node.type = "code"
    node.children = undefined
    node.value = linkNode.url.trim()
    node.lang = lang
    nodes.push(node)
  })
  await Promise.all(nodes.map(async node => {
    node.value = await fetch(node.value)
    .then((response) => response.text())
  }))
  return markdownAST
}