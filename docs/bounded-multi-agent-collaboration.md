# From AI-Generated Pull Requests to Bounded Multi-Agent Collaboration: A Practical MCP Case Study

An AI agent creates a pull request. GitHub Copilot reviews it. Another agent checks the result. Continuous integration runs. Review comments accumulate. Who decides what happens next?

The obvious answer is “a person.” That is also the answer that quietly turns an automated authoring system into a queue of human synchronization points. If a person must inspect every comment, tell an agent what to do, watch it make the change, and then start the cycle again, the agents are not really collaborating. They are taking turns under continuous supervision.

Concept Clusters, an open-source concept-mapping puzzle project, encountered this question while extending its remote Model Context Protocol (MCP) server. The server could already turn an AI-authored puzzle draft into a GitHub pull request. The interesting problem began after submission: could multiple agents and reviewers converge on a sound result without either overwriting one another or summoning a human at every inflection point?

The resulting design offers a broader lesson:

> Multi-agent collaboration becomes dependable when agents do not merely > exchange messages, but work through durable artifacts, explicit state > transitions, bounded authority, and a clearly defined human handoff.

This article describes that design, the mistakes that shaped it, and how the same pattern can be adapted beyond this particular project.

## The narrow question that exposed the larger problem

The work began with a deceptively small question: when Copilot leaves a code correction on a pull request, can the authoring agent apply it directly as a new commit?

GitHub distinguishes ordinary prose comments from *suggested changes*. A properly formatted suggested change can be committed directly to the pull request branch, and GitHub records the suggester as a co-author. GitHub also supports batching multiple suggestions into one commit. That is materially different from asking an agent to read a proposed replacement, reconstruct it, and commit an approximation under its own name. [GitHub documents the native suggestion workflow and its attribution behavior](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/incorporating-feedback-in-your-pull-request).

The first implementation exposed review comments and allowed an agent to resolve review threads. That was useful, but incomplete in several important ways:

- A resolved thread did not reveal whether the feedback had been fixed,   deliberately rejected, or simply dismissed. - A correct, exact suggested change could still be wastefully re-derived by an   agent, losing precision and attribution. - A human could accept a suggestion, reply, edit a comment, or resolve a thread   in GitHub while an agent was working from an older snapshot. - Repeated review and correction could continue indefinitely if reviewers   disagreed, checks oscillated, or an agent kept making changes without reducing   the actual work. - Even a logically safe collaboration workflow could fail in production if the   MCP Worker and its durable database schema were deployed out of order.

Those are not isolated edge cases. Together they define the real coordination problem.

## MCP provides capabilities, not collaboration policy

MCP gives AI applications a standard way to discover and invoke executable tools and to retrieve contextual resources. Its architecture deliberately does not dictate how a host should use a model or manage the context it receives. That separation is useful: the protocol supplies the interface, while the application supplies the rules. [The MCP architecture overview describes this client-server model and its tools, resources, and prompts](https://modelcontextprotocol.io/docs/learn/architecture).

In Concept Clusters, those rules live in a remote MCP authoring service backed by Cloudflare D1 and GitHub. The tools are not broad instructions such as “fix the PR.” They are narrow operations with verifiable preconditions:

- inspect live review feedback and checks; - apply one exact GitHub suggestion; - reply within one review thread; - resolve explicitly dispositioned threads; - synchronize review-time branch changes back into the authoring draft; - record one completed semantic review round; - prepare a snapshot-bound human handoff; and - reset an open circuit only with explicit human authorization.

This turns MCP into more than a convenient API wrapper. The tool contracts form a small collaboration protocol.

## The pull request is the shared workspace

It is tempting to picture a multi-agent system as several models talking to one another. Direct conversation can help, but it is a weak foundation for coordination. Messages are transient, context windows differ, and another actor cannot reliably determine which assertion is still current.

Here, the pull request plays the role of a durable blackboard:

```mermaid flowchart LR     D[D1 authoring draft] -->|submit| M[Remote MCP server]     M -->|branch + commit| P[GitHub pull request]     C[CI checks] --> P     A[Authoring agent] <--> M     R[Copilot and independent reviewers] <--> P     H[Human reviewer] <--> P     M <-->|live threads, checks, commits| P     P -->|verified handoff| H     H -->|final merge authority| G[Published repository state] ```

The pull request holds the proposed artifact, its commit history, review threads, check results, and human actions. Agents may come and go. They do not need shared conversational memory because they can reconstruct the current state from the same durable evidence.

GitHub, not D1 and not an agent's memory, is authoritative for the proposed publication branch. D1 retains the editable authoring draft and workflow metadata. A synchronization operation explicitly reconciles review-time branch changes back into the draft before the generator may append a new revision. That division prevents an older generated update from silently overwriting a manual or agent-authored review commit.

This is the first general principle: **choose an authoritative collaboration artifact that every participant can inspect independently**. It might be a pull request, a versioned document, a ticket with an immutable event log, or a database record with revision history. It should not be a model's private conversation.

## Optimistic concurrency for human-agent coexistence

Manual GitHub interaction is not treated as an exceptional interference. It is treated as another valid writer.

Every review thread returned by `get_review_feedback` has a version derived from its comments and replies. A mutation tool requires both the thread ID and the version the caller inspected. If a person resolves the thread, a reviewer edits a comment, or someone adds a reply before the agent acts, the version no longer matches and the operation fails closed.

The same idea appears at other boundaries:

- Applying a suggestion verifies the current comment, thread, diff anchor,   pull request, and branch state. - Updating the branch uses a non-forced ref operation, so a concurrent push   wins instead of being overwritten. - Resolving feedback validates the entire requested set before changing any   thread, avoiding a partially applied batch. - Preparing the final handoff reads the live state twice. A commit, review, or   check change during preparation makes the handoff stale.

This is ordinary optimistic concurrency control applied to collaborative AI. The crucial point is that “the human is authoritative” does not have to mean “the agent must wait for the human.” It can mean “human actions are accepted as valid state transitions, and stale automated actions are rejected.”

## Every review comment needs a disposition

Resolution is not a sufficient audit record. A closed thread can mean at least three different things:

1. the concern was fixed through an independently authored change; 2. the reviewer's exact suggestion was directly applied; or 3. the concern was considered and rejected with a reason.

The workflow therefore separates replying, changing code, and resolving the thread. If a comment is wrong, the agent replies *inside that thread* before resolution. If it is correct prose feedback, the agent changes the source and lets validation demonstrate the result. If it is exactly one current, right-side GitHub suggested change, the agent may apply the exact replacement and preserve reviewer attribution. None of those operations automatically resolves the conversation.

Only after the disposition is explicit may `resolve_review_feedback` close the corresponding thread snapshot. This makes the review history legible to the final human reviewer and to later agents. “Judged incorrect” can no longer look like “ignored.”

There is an important limit here: a machine-readable suggestion is not the same thing as a correct suggestion. The MCP service verifies that a suggestion is technically applicable; the acting agent must still judge whether it should be applied.

## Convergence is measured semantically

Counting requests or elapsed time is a poor way to detect a runaway review loop. An agent may poll while waiting for CI without doing any work. Conversely, two quick commits can send a pull request into an unproductive oscillation.

Concept Clusters records a review round only after an agent has acted and then obtained fresh feedback. Repeating the same checkpoint without an intervening write is idempotent, and passive status polling consumes no round.

Each checkpoint contains two complementary measurements:

- A **semantic fingerprint** covers the branch tree, normalized open concerns,   requested-change reviews, and checks that are not yet successful. - A **burden score** estimates how much unresolved work remains.

The automation circuit opens while work remains if any one of these limits is reached:

- four completed automated review rounds; - twelve automated write actions, including commits, replies, resolutions, and   draft synchronizations; or - two consecutive rounds without semantic progress, including a recently   repeated fingerprint that suggests oscillation.

When the circuit opens, mutation tools stop. The feedback tool instead returns the remaining threads, checks, counters, triggering reason, and a recommended human action. Human activity does not silently replenish the budget. Starting another bounded attempt requires explicit confirmation and an authorization note through `reset_review_circuit`.

The particular numbers are project policy, not universal constants. The portable idea is to budget **meaningful state transitions**, track whether the remaining burden is decreasing, and stop on repeated semantic state. A loop counter is useful; a loop counter that understands progress is much safer.

## The human moves from traffic controller to accountable authority

The initial instinct was to place a human at the beginning of every pull request review. That felt safe, but it defeated much of the benefit of multiple agents. The revised workflow distinguishes routine convergence from decisions that require accountable judgment.

Agents may autonomously:

- collect CI and review feedback; - apply a correct exact suggestion; - implement routine prose feedback; - explain and reject demonstrably incorrect feedback; - synchronize representable branch changes into the draft; - re-run checks and request another review; and - repeat within the circuit budget.

A human is brought in when:

- feedback requires a product, editorial, ethical, or risk judgment; - reviewers materially conflict; - a change cannot be represented safely in the canonical source; - the circuit breaker opens; or - the pull request has converged and is ready for the final review and merge   decision.

The final handoff is itself a checked artifact. It identifies the exact pull request head, check results, review snapshot, participating agents, disposition of every resolved thread, and any remaining decision with a recommendation. The server refuses a normal “ready for human review” handoff if checks are pending or failing, the authoring draft does not represent the branch, or any thread is unaccounted for.

The human therefore receives either a stable, reviewable candidate or a short list of genuine decisions—not a transcript of everything the agents did.

## A state machine, not a chain of prompts

The collaboration loop can be summarized as a state machine:

```mermaid stateDiagram-v2     [*] --> Submitted     Submitted --> Reviewing     Reviewing --> SyncRequired: branch differs from draft     SyncRequired --> Reviewing: reproducible sync succeeds     Reviewing --> Reviewing: feedback handled and fresh round completed     Reviewing --> Waiting: checks or reviewers still running     Waiting --> Reviewing: live state changes     Reviewing --> HumanDecision: judgment or conflict requires escalation     Reviewing --> CircuitOpen: budget or stagnation limit reached     Reviewing --> HandoffReady: checks pass and every thread is accounted for     CircuitOpen --> Reviewing: explicit human reset     CircuitOpen --> HumanDecision     HandoffReady --> HumanReview     HumanDecision --> HumanReview     HumanReview --> Merged     HumanReview --> Revising     Revising --> Submitted ```

Prompts guide an agent toward this flow, but tools enforce it. That distinction matters. A sentence saying “do not overwrite human work” is useful guidance. A versioned write that rejects stale state is a safety property.

## The production failure that completed the design

The collaboration features added workflow fields to the D1 `publication_requests` table. The migration existed in the repository, but a Worker revision reached production before the remote migration was applied. The next MCP operation failed with:

```text D1_ERROR: table publication_requests has no column named publication_options_json ```

This was not a failure of review logic. It was a failure to deploy the logic and its durable state model as one release unit.

Cloudflare's D1 migration system versions database changes as sequential SQL files and records applied migrations in a migrations table. [The D1 migration documentation describes that model and the commands for listing and applying pending migrations](https://developers.cloudflare.com/d1/reference/migrations/). The project changed its release path so production migrations run before the Worker deploy, migration-only changes trigger the release workflow, and related release jobs share a non-cancelling concurrency group. GitHub Actions supports using a concurrency group to serialize workflows or jobs that share the same key. [GitHub documents those concurrency controls here](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).

The larger lesson is easy to miss: durable coordination state is part of the agent system's API. Schema compatibility, deployment ordering, idempotency, and recovery are agent-safety concerns because an agent can only respect a protocol that production can actually persist.

## What generalizes beyond puzzle authoring

Nothing about versioned feedback, explicit dispositions, semantic progress, or snapshot-bound handoff is specific to puzzles. The pattern applies whenever an AI-generated artifact can be reviewed through durable, structured state.

| Domain | Shared artifact | Routine automated convergence | Human decision boundary | | --- | --- | --- | --- | | Documentation | Versioned document or PR | Style fixes, broken links, factual-source checks | Voice, policy, disputed interpretation | | Infrastructure | IaC pull request and plan | Formatting, validation, low-risk policy fixes | Destructive changes, cost and risk acceptance | | Data curation | Versioned dataset change | Schema checks, deduplication, provenance repair | Ambiguous labels, sensitive-data judgment | | Compliance | Control evidence package | Missing evidence detection, cross-reference repair | Control acceptance and exception approval | | Software maintenance | Code PR | Tests, static-analysis fixes, exact review suggestions | Architectural tradeoffs and behavior changes |

The common requirements are more important than the domain:

1. There is a canonical artifact or event log. 2. Review concerns have stable identities and versions. 3. Mutations are narrow, attributable, and conditional on current state. 4. Every concern receives an explicit disposition. 5. External edits can be reconciled without erasing history. 6. Progress is observable in terms of remaining work. 7. Autonomy has a finite budget and a fail-closed terminal state. 8. Human handoff is bound to a verified snapshot.

## A practical implementation blueprint

For teams building a similar workflow, the following sequence is a useful starting point.

**Choose authority before adding agents.** Decide which system wins when the draft database, generated files, review UI, and agent memory disagree. Document the reconciliation path explicitly.

**Expose reads before writes.** Give agents one comprehensive view of live threads, checks, branch state, and automation state. A mutation should not need to guess what another system currently contains.

**Make write tools narrow.** “Apply this one suggestion at this version” is safer and easier to audit than “resolve the PR.” Keep changing code, replying, resolving, synchronizing, and handing off as separate operations.

**Carry versions across the read-write boundary.** Require an agent to present the version it observed. Re-read live state immediately before mutation and reject changed targets.

**Preserve provenance.** Reuse exact suggested text when appropriate and retain reviewer attribution. Record rejection reasoning in the original thread. Use normal commits rather than force-updating history.

**Define dispositions and terminal states.** Every concern should end as fixed, directly applied, visibly rejected, or escalated. “Resolved” alone is too weak.

**Measure convergence.** Count semantic rounds and writes, compare state fingerprints, and track burden. Do not penalize waiting; do stop oscillation.

**Design the handoff as carefully as the loop.** The human should know exactly which artifact and evidence were verified. Any later state change should make that handoff stale.

**Release the state model with the tools.** Apply durable-store migrations before deploying code that depends on them, serialize releases where needed, and test the production-shaped migration path.

## What this design does not promise

Bounded collaboration does not make reviewers correct. It does not turn a passing test suite into proof of product quality. It does not eliminate human responsibility, and it does not make every decision machine-readable.

It does offer something more useful than nominal autonomy: a way for several independent actors to make progress without trusting one another's memory, without silently erasing one another's work, and without consuming unlimited time or compute when they fail to converge.

The best role for the human in such a system is neither absent nor omnipresent. It is explicit: define the policies, retain final authority, and intervene when the system reaches a decision it was not authorized—or able—to make.

That is the shift from an AI that can open a pull request to a collaboration system that can responsibly bring one to the threshold of a decision.

## Implementation references

The working implementation and its operational contract are available in the Concept Clusters repository:

- [`docs/MCP-REMOTE.md`](https://github.com/jmajerus/concept-clusters) describes the deployed authoring and review workflow. - [`modules/hostedMcpAuthoringServer.js`](https://github.com/jmajerus/concept-clusters) defines the remote MCP tools and agent guidance. - [`modules/githubPublicationService.js`](https://github.com/jmajerus/concept-clusters) implements GitHub reconciliation, guarded mutations, convergence tracking, the circuit breaker, and final handoff. - [`modules/d1PublicationRepository.js`](https://github.com/jmajerus/concept-clusters) persists publication and review-loop state. - [`d1/migrations`](https://github.com/jmajerus/concept-clusters) contains the versioned D1 schema. 