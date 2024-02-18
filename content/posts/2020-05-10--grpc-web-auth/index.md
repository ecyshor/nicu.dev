---
template: post
title: Configure grpc-web typescript authentication
slug: typescript-grpc-web-auth-interceptor
draft: false
date: 2020-05-10T15:52:44.607Z
description: >-
  Add the Authorization header for every grpc-web call in typescript using
  interceptors
category: how-to
tags:
  - grpc
  - tutorial
---

# GRPC-WEB interceptor authentication in typescript

## What

Access an authenticated grpc service using grpc-web

## How

Use interceptors to add the `Authorization` header for each request. (Or any other header for that matter)

### Grpc-web version

For this to work you need [grpc-web](https://github.com/grpc/grpc-web) version `>= 1.1.0`. Latest version is `1.2.1`

### Interceptor implementation

```typescript
class AuthInterceptor {
  token: string

  constructor(token: string) {
    this.token = token
  }

  intercept(request: any, invoker: any) {
    const metadata = request.getMetadata()
    metadata.Authorization = 'Bearer ' + this.token
    return invoker(request)
  }
}
```

### Add the interceptor

```typescript
    const authInterceptor = new AuthInterceptor(token)
    options = {
      unaryInterceptors: [authInterceptor],
      streamInterceptors: [authInterceptor]
    }
    const service = new GrpcServicePromiseClient(
    host,
    null,
    options
  )
```

Now every call to the grpc service will have the `Authorization` header with the provided token.
