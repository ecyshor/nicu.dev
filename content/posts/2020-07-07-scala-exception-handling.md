---
template: post
title: Scala exception handling
slug: scala-exception-handling
draft: false
date: 2020-07-07T20:15:29.624Z
description: Easy error handling in scala
category: software
tags:
  - scala
socialImage: /media/autodraw 7_7_2020.png
---
Exception suck, it's impossible to know all the different exceptions that can occur in a certain context and thus having proper handling for them it's a too difficult of a task.     

Using simple ADTs with Either and [cats](https://typelevel.org/cats/) for cleaner code makes our life a lot easier, but more importantly you are always aware of what can go wrong.

### Handle failures in scala

Let's start with the normal scala code:

```scala
def doSomething(): Future[_] = ???
```

We know nothing about what can go wrong, other than it's possible that a `Throwable` can be thrown from somewhere, we always count on the happy case and don't have to think about anything else. While it's simpler to start with this is not reality, we just ignore the unknown.

The code gets more complex to write as you have to define all the possible failure, but the context that you get from a failure is invaluable. This forces us to define the code paths at compile time and not be surprised by any runtime exception. 

```scala
def doSomething(): EitherT[F, SomeFailure, _] = ???

sealed trait SomeFailure
case class ValidationFailure(message: String) extends SomeFailure
case class TimeoutFailure(timeout: FiniteDuration) extends SomeFailure
case object AlreadyDidSomething extends SomeFailure
case class UnknownFailure(cause: Throwable) extends SomeFailure
```

### What you get

We are now aware that`SomeFailure`can occur in this context, but we can still focus on the happy path by transforming the succesfull context and send failures further up if there's no way for us to handle them at the current execution point, but unlike go errors where you can actually focus on the logic you want to implement and just compose failures together handling the failure as close to the end of the functionality as possible. The time invested in writing the proper failures will greatly be worth in the long run. 

### Composition

Different code paths

```scala
sealed trait SomeFailure
sealed trait AnotherFailure

def doSomething(): EitherT[F, SomeFailure, _] = ???
def doSomethingElse(): EitherT[F, AnotherFailure, _] = ???
```

Now imagine we want to compose them

```scala
﻿
//if we had union types
def composingSomething(): EitherT[F,SomeFailure | AnotherFailure, _] = {
  doSomething().flatMap(_ => doSomethingElse())
}
```

It does get quite verbose with multiple composition levels but the benefits would far outweigh the downside of it.

```scala
//work around with common failure but we lose sealed benefits
trait CommonFailure
sealed trait SomeFailure extends CommonFailure
sealed trait AnotherFailure extends CommonFailure

def composingSomething(): EitherT[F,CommonFailure, _] = {
  doSomething().flatMap(_ => doSomethingElse())
}
```

In small projects this work around would work, but the big downside is that eventually a lot of sealed failures will extend the common failures, so we will have to handle some failures which actually cannot occur in that execution path. We could break them down and have more specialized common failure but those would most likely end up in high numbers, for each feature.

```scala

//work around with wrappers
sealed trait ComposingFailure
case class ComposedSomeFailure(someFailure: SomeFailure) extends ComposingFailure 
case class ComposedAnotherFailure(anotherFailure: AnotherFailure) extends ComposingFailure 
case class ExtraFailure(ex: Throwable) extends ComposingFailure

def composingSomething(): EitherT[F, ComposingFailure, _] = {
  doSomething().leftMap(ComposeSomeFailure).flatMap(_ => doSomethingElse().leftMap(ComposedAnotherFailure))
}
```

This is actually the most flexible way of composing them as we can define extra failures at each step and we always handle only the cases which can occurr in our execution path.

## Notes

Normally you will still inteact with code which does not use this exception handling, and most likely returns simple Futures, this means that the futures can still fail with exceptions so we have to ensure that the failed future does not escape from the edge where we interact with it and instead we transform the failure into one of our failures.
