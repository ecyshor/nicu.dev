---
template: post
title: Google Cloud Functions reverse proxy
slug: cloud-functions-reverse-proxy
draft: true
date: 2021-03-18T15:40:19.917Z
description: Supplement google cloud load balancer, with better url rewrite by
  using cloud functions
---
Google Cloud Load balancer supports url rewrite only as a prefix to the url, so you can transform a request to `host/url` to `host/prefix/url`.

For my usecase I'm using a storage bucket as a backend, but if a request comes in to `host/url`I would need it to proxy it to `host/host/url` so that it adds the host as a dynamic prefix to the url. 

This is not supported out of the box so as fix I've changed the backend to a cloud function which proxies the request to the target bucket.