---
template: post
title: Google Cloud Functions reverse proxy
slug: cloud-functions-reverse-proxy
draft: false
date: 2021-03-18T15:40:19.917Z
description: Supplement google cloud load balancer, with better url rewrite by
  using cloud functions
---
Google Cloud Load balancer supports url rewrite only as a prefix to the url, so you can transform a request to `host/url` to `host/prefix/url`.

For my usecase I'm using a storage bucket as a backend, but if a request comes in to `host/url`I would need it to proxy it to `host/host/url` so that it adds the host as a dynamic prefix to the url. 

This is not supported out of the box so as fix I've changed the backend to a cloud function which proxies the request to the target bucket.

embed-url-code https://gist.githubusercontent.com/ecyshor/0138ea1f8b0b16b1b7357a936d060b66/raw/c754819c533295f83e84c41d832420f4c0dcfe09/proxy.ts typescript

The function also proxies all the requests to the root `/` to `index.html`, that is optional and can actually be configured directly in the load balancer.