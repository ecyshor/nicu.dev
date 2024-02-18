---
template: post
title: Easy development environment with nix and direnv
slug: dirnev-nix-shell
draft: false
date: 2023-02-12T20:17:10.881Z
description: Easy starter for nix integration using only nix-shell for projects
tags:
  - nix
---
## Why

Easy to maintain project dependencies and configuration with nix, without having a full nix install. 

## Steps

### Install nix

Described here: <https://nixos.org/guides/nix-pills/install-on-your-running-system.html>

Simple solution:

> curl -L https://nixos.org/nix/install | sh

### Install direnv

Described here: <https://direnv.net/docs/installation.html>

### Configure nix shell

Add a directory named `nix`.

#### Configure the package source

Add the following source file with the name `source.nix` in the nix directory.

```nix
{
  nixpkgs = builtins.fetchGit {
    url = "https://github.com/NixOS/nixpkgs.git";
    rev = "6ccc4a59c3f1b56d039d93da52696633e641bc71";
  };
}
```
The `rev` value represents the commit you want to reference from the nix-pkg repo. 
You can find here the latest version: <https://github.com/NixOS/nixpkgs/tree/nixpkgs-unstable>

#### Configure the nix shell

Add the configuration for the nix shell, in a file named `shell.nix` in the nix directory.

```nix
let
  sources = import ./sources.nix;
  pkgs = import sources.nixpkgs {};
in
pkgs.mkShell {
  buildInputs = [
    pkgs.hello
  ];
}
```

#### Configure direnv to load the nix shell

In the folder of the project, where the `nix` directory is found add the direnv file, named `.envrc` with the following content:

```
#!/usr/bin/env bash

# Reload if the sources file changes
watch_file nix/sources.nix

# This will watch the shell.nix automatically and reload on changes
use nix nix/shell.nix
```

### Done

Once everything isconfigured, and direnv is enabled using `direnv allow` you can test your setup by running `hello`.
