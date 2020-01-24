---
title: Akka sharding entity state handover
date: "2019-04-21T22:40:32.169Z"
template: "post"
draft: false
slug: "akka-resharding"
category: "Software"
tags:
  - "Akka"
  - "Distributed systems"
  - "Sharding"
description: "Akka sharding state handover during cluster restarts/resharding to reduce time needed for the entities to serve responses"
---

## Introduction

In some situations `akka-persistance` is not a valid solution for persisting the state of a sharded entity.  
In such cases we might want to count on other systems to handle the state of the entity and in particular subcases loading the data might take longer than we want and a simple solution might improve that for us.  
A working example can be found [here](https://github.com/ecyshor/akka-handover)

## Scenario

Imagine every entity handles analytics for a big number of events(eg: number of lightbulbs being turned on in an entire country grouped per county in the last 30 days), with each entity handling queries. Loading this statistics might take a long period of time, especially if a large number of entities are requesting the needed data all at once during restarts.  
If the time needed to load the state is quite long then rebalancing shards/restarting nodes becomes quite cumberstone as the entities are not ready to respond to queries until the initial data is received.  

## Solution

Once the data is loaded for the first time, and considering that it refreshes in the background there is no reason why we should not easily be able to pass it from the old entity to the new entity when the cluster is rebalancing or restarting.  
The first step is to configure the sharding to send a `handOffStopMessage` by setting it when starting the shard. In our case we'll be reusing `GracefulShutdown` which sent to the region to stop it.  

```scala
    ClusterSharding(system).start(
      typeName = ShardingTypeName,
      ...
      GracefulShutdown
    )
```

This will ensure that when the sharding region is being shutdown the corresponding message will be received by each entity.
Next we should make sure that we handle the shutdown message and send the corresponding message to the local shard region which will buffer it and forward it to the new region which will be started on another node.

Example code which should handle the shutdown:

```scala
ClusterSharding(context.system)
        .shardRegion(ShardedActor.ShardingTypeName) ! data
      stop()
```

### Problems

Because the entity is sending a message to the new entity in ca of passivization of the entity then a new one will be created, and this process will go in a loop. In this case you have to make sure when receiving the shutdown message that the message hasn't been received due to passivization, case in which you should not do a handover. Easies solution to do this would be to keep the time from the last message and compare to the passivization timeout.

This solution will stil require another persistent storage for the data but it's assumed that the state of the entity is sourced from other systems.

## Other possible solutions

- akka-persistance - more complex solution, would duplicate the already existing persistance system which cannot be replaced