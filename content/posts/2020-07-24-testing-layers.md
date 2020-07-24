---
template: post
title: Testing layers
slug: testing-unit-it-e2e-docker-compose
draft: false
date: 2020-07-24T10:18:26.297Z
description: >-
  The value of unit tests, integration tests, end to end tests and hot to
  simplify them using docker-compose for proper execution.
category: software
tags:
  - testing
socialImage: /media/containers-1209079_960_720.jpg
---
## Testing layers

I recommend splitting the tests into multi layers, with each focusing on a different scope. There might be some duplication between them but nothing extreme.

### Unit tests

Unit tests are the simplest of them all. They test *units.*

I recommend focusing on unit tests only when the logic inside the *unit* is fairly complex. If you need a piece of paper to map out the code that you want to implement then unit tests should be mandatory.

In scope unit tests should be simple, mocking should be used at a minimum (the more mocking you do the less valuable the tests are) and the tests should be pure, you pass some input and you validate the output.

### Integration tests

Integration tests should be use for both integration to third party systems (databases, queues and so on), by using the actual systems, and between different components of your application.

Ideally mocks would not be used for integration tests.

Integration tests also can help you to properly modularize your code by creating smaller `modules` which can be tested this way. You would test the functionality of that module (feature) by validating the output produced.

### End to end tests

End to end tests should as black box tests. If you package your application in a docker container then e2e tests would call the exposed APIs of the application and validate the output produced by it (validate the state of the database, messages produced to kafka and so on).

## Docker compose usage for it and e2e tests

Integration and e2e tests shoudl run against actual services and mocks should not be used. Most of them should be available to run as docker container, or in extreme cases can be mocked by other docker containers. Some form of mocks can be used to replace for example HTTP APIs of third party services (like sendgrid) as everything you use in these tests should run locally and should be controlled by you.

Docker compose is the ideal component for this and gives you the confidence of running tests against actual dependencies.

Example of docker compose file for using clickhouse

```yaml
version: '3'
services:
  clickhouse:
    image: yandex/clickhouse-server
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    ports:
      - "8123:8123"
```

Before running the integration tests you can start the services by running  `docker-compose up` and then at the end clean up using `docker-compose down -v`

This also ensure that each test run starts with a clean service.

If you package your service in a docker container then you can start the service itself in the same docker-compose file for the e2e tests.
