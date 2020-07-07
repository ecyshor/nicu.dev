---
template: post
title: Scala exception handling
slug: scala-exception-handling
draft: false
date: 2020-07-07T20:15:29.624Z
description: Easy error handling in scala
category: software
tags:
  - software
socialImage: /media/autodraw 7_7_2020.png
---
### Downside
Gonna start with the bad side of things in scala. No union types for now so until we have scala 3 having a proper error handling system is still more verbose than wanted but it's still worthed
Error handling in java has always been a pain. The unexpected was always ignored. Unfortunately this leaked into scala as well. Exception suck, they're hard to undestand and hard to follow, they propagate silently and especially in a future context too many things can go wrong. 
The examples I use will be using cats with `EitherT` but can be done in vanilla scala as well if you hate life.

### Handle failures in scala

Let's start with the normal scala code:

```scala
def doSomething(): Future[_] = ???
```
The defintion of the method does not specify any failure that can happen, we always count on the happy case and don't have to think about anything else. While it's simpler to start with this is not reality, we just ignore the unknown.

ADTs with EitherT from cats coming to the rescue. The code gets more complex to write as you have to define all the possible failure, but the context that you get from a failure is invaluable. This forces us to define the code paths at compile time and not be surprised by any runtime exception. 

```scala
def doSomething(): EitherT[F, SomeFailure, _] = ???

sealed trait SomeFailure
case class ValidationFailure(message: String) extends SomeFailure
case class TimeoutFailure(timeout: FiniteDuration) extends SomeFailure
case object AlreadyDidSomething extends SomeFailure
case class UnknownFailure(cause: Throwable) extends SomeFailure

```  

This forces us to treat all the failures when call the `doSomething` method, and using EitherT makes it extremly easy keep the code simple as well.

### What you get
Code where you have to think about failures, they're always there, but unlike go errors where you can actually focus on the logic you want to implement and just compose failures together handling the failure as close to the end of the functionality as possible. The time invested in writing the proper failures will greatly be worthed in the long run. 


### Downside
The main downside is that scala has no union types for now, and as `doSomething` would be of no use by itself and would normally be composed with `doSomethingElse(): EitherT[F, AnotherFailure, _]` but the problem would be that `SomeFailure` and `AnotherFailure` don't match so there is no type which can be returned from both of them (with union types we would return `EitherT[F, SomeFailure | AnotherFailure, _]`). Currently one way to fix this would be to have a common trait `trait CommonFailure` which is extended by both `SomeFailure` and `AnotherFailure` but then we lose the advantages of ADTs as any method which uses both would have to return `CommonFailure` and we would have to handle all the possible failure paths even if we know that some cases might not make sense. Another way of fixing it would be to keep on wrapping failures, so if `doSomething` calls `doSomethingElse` then we would have a case `case class SomethingElseFailure(cause: AnotherFailure)` but this adds up if it's a complex project. 

Another downside is that every low level ADT (code that interacts with the F type directly, eg: external code that uses futures and where we make our transition from Future[T] to EitherT[Future, TFailure, T]) has to have an `case class UnknownFailure(cause: Throwable) extends OurFailure` as those futures can still have an unexpected exception thrown and we must handle it. Once we have union types this would be a lot easier to handle but would still be there.
