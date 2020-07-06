---
template: post
title: Akka stream explained
slug: akka-streams-explained
draft: true
date: 2020-07-06T20:16:56.134Z
description: How do akka streams work and how do different pieces work together
category: software
tags:
  - akka
socialImage: /media/autodraw 7_6_2020.png
---
## Akka streams

Each piece of a stream can be thought as a simple box (or stage). By connecting them together we get powerful processing graphs but which sometimes are not that easy to understand, especially with regards to using different attributes, logging or exception handling at different parts of the graph.  In this post I just try to go through multiple different combinations to try to understand the way the stream behaves based on its composition.

### Linear

Simplest example of a stream is just a linear flow, where a single element is flowing throw the graph at a time, from stage to stage. 

#### Code
```scala
  Source
    .fromIterator(() => Iterator(1, 2, 3))
    .map(el => {
      println(s"Received element $el")
      el
    })
    .runWith(Sink.foreach(el => {
      println(s"Sink received element $el")
    }))
```

#### Output

```
Received element 1 
Sink received element 1
Received element 2
Sink received element 2
Received element 3
Sink received element 3
```

#### Explanation
The graph is processed serially so the first element from the source goes all the way to the sink, then the second element and so on, there is no point where two elements flow through the graph at the same time.

### Async stage

For better understanding of the element timing we're adding a throttle to the streams to distinguish when multiple elements run in parallel 

#### No async code

```scala
  Source
    .fromIterator(() => Iterator(1, 2, 3))
    .throttle(1, 100.milli)
    .via(
      Flow[Int]
        .map(el => {
          outputMessage(s"Received element $el")
          el
        })
        .throttle(1, 100.milli)
    )
    .runWith(Sink.foreach(el => {
      outputMessage(s"Sink received element $el")
    }))
```

#### No async output
```
2020-07-06T22:54:51.183668 - Received element 1
2020-07-06T22:54:51.186563 - Sink received element 1
2020-07-06T22:54:51.310696 - Received element 2
2020-07-06T22:54:51.310792 - Sink received element 2
2020-07-06T22:54:51.409297 - Received element 3
2020-07-06T22:54:51.409395 - Sink received element 3
```

#### No async explanation
The stream is still sync so the element flow serially. 

#### Async code
```scala
  Source
    .fromIterator(() => Iterator(1, 2, 3))
    .via(
      Flow[Int]
        .map(el => {
          outputMessage(s"Received element $el")
          el
        })
        .async
    )
    .throttle(1, 100.milli)
    .runWith(Sink.foreach(el => {
      outputMessage(s"Sink received element $el")
    }))
```
#### Async output
```
2020-07-06T23:06:33.741868 - Received element 1
2020-07-06T23:06:33.748810 - Received element 2
2020-07-06T23:06:33.748855 - Sink received element 1
2020-07-06T23:06:33.749011 - Received element 3
2020-07-06T23:06:33.856926 - Sink received element 2
2020-07-06T23:06:33.955273 - Sink received element 3
```
#### Async explanation
As we can see from the timestamp all 3 elements are sent at the same, and then being consumed one by one by the follow up sink as the graph goes back to a sync model.
