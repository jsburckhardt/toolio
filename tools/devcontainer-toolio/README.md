# Toolio Dev Container

A pre-configured development container for the Toolio repository, providing a consistent development environment with all required tools and extensions.

## Overview

This tool packages the [devcontainer configuration](../../.devcontainer/devcontainer.json) used by the Toolio repository. It ensures every contributor has the same development environment regardless of their local setup.

## Features

- **Pre-installed CLI tools** — `jq`, `git`, `gh` (GitHub CLI), and other essentials
- **VS Code extensions** — Recommended extensions for Markdown, JSON, and shell scripting
- **Consistent environment** — Same tools and versions for all contributors
- **GitHub Codespaces ready** — Works in both local dev containers and Codespaces

## Configuration

The primary configuration file is located at:

- [`.devcontainer/devcontainer.json`](../../.devcontainer/devcontainer.json)

## Usage

1. Open the repository in VS Code
2. When prompted, click "Reopen in Container"
3. Or use the Command Palette: `Dev Containers: Reopen in Container`

The container will build automatically with all required tools pre-installed.

## Platform Compatibility

- **VS Code** — Full support via Dev Containers extension
- **GitHub Codespaces** — Full support (auto-detected)
- **Generic** — Configuration can be adapted for other container runtimes
