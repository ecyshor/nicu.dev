---
template: post
title: Kubernetes loves SIGKILL
slug: kubernetes-loves-sigkill
draft: false
date: 2020-12-02T09:15:27.231Z
description: OOMKilled triggers SIGKILL without a way of doing SIGTERM
category: Software
tags:
  - rant
---
### Welcome to my rant

As seen in this [issue](https://github.com/kubernetes/kubernetes/issues/40157) as well, Kubernetes offers no way of starting a graceful shutdown by sending a SIGTERM before dropping the nuke on the container when memory limits are reached. 

We treat containers as cattle but still it would be nice to get the opportunity to answer any in flights calls, maybe commit some offsets and ensure the shutdown state is clean. 

This is especially enraging when you have a small memory leak, which might not be on your priority list to fix just yet, as it leads to OOM once a month or so, creeping up 1MB at a time and there is no way of sending a SIGTERM maybe when memory usage is at 99%, or giving it a few seconds before SIGKILL and not nuking it without a chance to shutdown.



*PS: I know kubernetes is not directly responsible for the SIGKILL but it should be the one making our life easier*
