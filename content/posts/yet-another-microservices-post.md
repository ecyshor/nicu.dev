---
template: post
title: Yet another microservices post
slug: microservices-benefits-and-legoland
draft: true
date: 2020-11-25T15:59:45.634Z
description: The road to a plug and play legoland for microservices
---
I'm gonna do a short dive into some different benefits of microservices, a few downsides and what I consider the golden target for microservices - **legoland**

## Microservices

### High cohesion for code

When creating a new service, especially during the early days of moving to microservices, you should give extra thoughts when decided where a feature lies.  Microservices should contain bundles of related features, explaining what a microservice does should be doable in a few sentences or a short README page.

### Knowledge transfer and ownership transparency

Ideally teamwork should also be more distributed, with different people working on different services, different teams tackling different features and forces a more consistent know how between team members. Also by having relatively small microservices you can easily pinpoint business areas (or microservices) which could be affected by the [bus factor](https://en.wikipedia.org/wiki/Bus_factor).  

Each microservice should have a few owners, or a owner team. This doesn't mean that those are the only people who have knowledge of the functionality, but it clearly delegates responsability for the microservice and also simplifies the process of finding a person which has knowledge about a certain feature. You know the feature so you know the service it relies in, therefore you know the service owners and you can direct you question from the start to the right person.

#### The monolithic person

Just having microservices is not enough. The danger of moving from a monolith to microservices while preserving the human single point of failure is often ignored by teams. Having a single person which has knowledge about how all the microservices fit together and how should they evolve is one of the greatest dangers of a distributed system. Every team member should be confident in choosing the right approach for extending the platform and it should be made in a standardized way.

### Course correction

One of the main reason for which people hate monoliths is the mess that it turns into after years of development. There are multiple reasons for that to happen, a few being:

* developers are only humans, we make mistakes, and monoliths are huge collections of small mistakes which nobody has the energy to start fixing
* architecture evolves, sometimes even naming changes during the lifetime of a project, and the bigger the project is the harder it is to ensure everything is consistent so you'll have multiple architecture versions in the same project
* people think differently, you'll most likely implement the same thing in a different way compared to your collegue, this can be mitigated by standardizing namings and architecture but it's different to enforce, especially on big projects, and different styles slip through the cracks and with time it all becomes a big mess

Microservices do not fix any of those mistakes, they only enforces hard borders around our mistakes and around natural architecture evolution. Of course you can have microservices with different architecture "versions" but it's doable to just migrate an entire microservice at once and you can reason with the code in a single microservice, while you can't reason with huge monoliths.

### Consistency is key

Architecture should be standardized. When diving into a microservice you never seen before you should be able to recognize the same structural organization and same architecture as in all the other services. Namings should be consistent even across services and onboarding a new developer to a microservice should be a straighforward process as everything feels like home. As I said previosly architecture naturally evolves but a single microservice should not be left in a incosistent state between old and new, it either needs to be upgraded or it's already upgraded, this way you can easily reason about the services.

### Legoland

I refer to legoland as the end target for microservices.  You evolve towards legoland, you don't start with legoland. The basis of it is having a `lego` library which is the foundation of each microservice and which provides the boilerplate code, standardizes the way we interact with the outside world.

> Infrastructure here refers to the code infrastructure, abstractions for third party systems, defining how you read files, how you read configurations and so on...

The lego library will evolve quite fast during the early days when migration to microservices, as you cover more and more pieces (do not be in a hurry to move abstraction to the lego library from the first usage, wait for at least 2-3 usages of the same abstraction in different microservices before moving it into the lego library).

As the lego library matures adding new microservices should come down to just writing the business logic for the service, having the standardized way of doing everything in the lego library, it's all about combining the pieces together to fulfill the ACs you have. Even the service itself, most of the files should be meaningful and not part of the boilerplate. A microservice should be just a collection of related functions and features which are easy to understand.

The lego library should also control the lifecycle of the service, it should provide CI/CD out of the box, it should define the way a release is done, the way the tests are run, how the service is built and so on. This also makes it a lot easier to change those things, as all you would need is an update to the lego library and it should handle everything under the hood.

The lego library should also be heavily modularized. If you need functionality to do a http call you should only depend on the http lego module, if you need functionality to interact with kafka you should only depend on the kafka lego module. 

#### Be mindful when adding code to the lego library

The lego library should really be focused on adding value by providing the tools, the pieces you need to be able to focus on the business requirement, it should not contain business logic to share between services, it should not contain common models to share (if you have a user model in multiple services, each service should own it's own model).
