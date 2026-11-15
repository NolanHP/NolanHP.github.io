---
title: Sample backend API
summary: Placeholder entry showing the format for a backend project. Replace this with one or two sentences on what the service does and who or what uses it.
stack: [Python, FastAPI, PostgreSQL, Docker]
github: https://github.com/NolanHP
date: 2026-11
featured: true
sample: true
---

This is a sample entry, not a real project. Delete this file once you've added your own.

Everything below the front matter is the optional write-up. It's plain Markdown and becomes the project's own page. A structure that works for most projects:

## What it does

Describe the project in a short paragraph: the problem, and what the finished thing does about it.

## How it's built

Explain the main pieces and how they fit together. Lists work:

- The API layer and its main endpoints
- How data is stored
- How it's tested and deployed

Code blocks work too:

```python
@app.get("/health")
def health():
    return {"status": "ok"}
```

## What I'd change

Say what you'd do differently, or what's left to build. Only write what's true of the project.
