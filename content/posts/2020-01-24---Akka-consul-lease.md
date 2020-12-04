---
template: post
title: Akka lease backed by consul
slug: akka-consul-lease
draft: false
date: '2020-01-24T19:40:32.169Z'
description: Akka lease implementation using consul as a backend for locks
category: Software
tags:
  - Scala
---
# Introduction

For solving coordination issues (leader election, master process, one writer multiple readers) AKKA offers the [coordination package](https://doc.akka.io/docs/akka/current/coordination.html) which introduces the concept of a lease. 

One implementation which fits perfectly and is available for a lot of companies is [Consul](https://www.consul.io/). This can be achieved by using the [akka-consul-lease](https://github.com/ecyshor/akka-consul-lease) library. Please check the library's readme for usage instructions.

## Akka Specifics

A lease has a name and an owner.  Each client which wants the lease should use the same and and a different owner name. A lease can only be held by a single owner at a time. It is not guaranteed that the lease always has an owner but it is guaranteed that it will not have two owners at the same time. 

As you probably already know this is not a simple problem so AKKA does not offer a default implementation for this (they do offer a kubernetes implementation in the subscription package)  but it offers a way to implement leases using any backed you want.

## Consul specifics

Consul offers the option to acquire locks. Using the locks we can implement the lease. A really nice description of how this can be implemented can be found [here](https://learn.hashicorp.com/consul/developer-configuration/elections), and I suggest reading as this is .

The implementation maintains a consul session which has been configured with a TTL and a lock-delay for safety. It guarantees that the lease will be marked as free before the lock can be acquired by another session. I suggest reading the[ consul session internals](https://www.consul.io/docs/internals/sessions.html) to get a better understanding.



# Usages

* extra safe guard for akka [cluster singleton and shards](https://doc.akka.io/docs/akka/current/typed/cluster-singleton.html#lease)
* ensure some processes are executed on a single instance when deploying multiple instances, without the need to have an akka cluster. If using akka cluster a cluster singleton could be use to ensure this as well but that has the downside that all the processes which have to run on a single instance will always run on the same instance because all the singletons will always reside on the oldest node in the cluster (by using a lease for each process then the processes will run on the instance which has the lease, which is non deterministic) 

