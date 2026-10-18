# Agent instructions

Instructions for any coding agent working in this repository (Claude Code,
Cursor, Codex, Kilo Code, Muse Code, GitHub Copilot, and others).

## Commit trailers

End every commit you make, or substantially write, with one trailer per agent
that worked on it, in this form:

```text
Co-Authored-By: <Tool> (<model>) <noreply address>
```

- **Tool** is the product you are running in, such as `Claude Code`, `Cursor`,
  `Codex`, `Kilo Code`, or `Muse Code`.
- **Model** is the model as the tool reports it, such as `Claude Opus 5.5`,
  `Grok 4.6`, or `GLM 5.3 Flash`. If you don't know the model, leave out the
  parentheses: `Co-Authored-By: Cursor <noreply address>`.
- **Noreply address** is your tool's no-reply address if it has one (for
  example `noreply@anthropic.com`), otherwise leave the angle brackets out.

For example:

```text
Co-Authored-By: Claude Code (Claude Opus 5.5) <noreply@anthropic.com>
```

This naming matches the puzzle bylines, which credit agents as
`Tool (model)`, so git history and bylines name the same agent the same way.

Use this form even if your tool's own defaults ask for a different trailer.
Add a trailer only for work you actually did: none for a commit a person wrote
without you, and never one for another agent.
