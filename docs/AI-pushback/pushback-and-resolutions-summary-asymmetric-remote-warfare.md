# Pushback & Resolutions: *Asymmetric & Remote Warfare* Drafting Session

A record of every point in this thread where John pushed back on a Claude proposal, and how each was resolved.

This session differs from prior ones in a notable way: rather than spanning many structural or content decisions across a whole puzzle, nearly every round of pushback bore down on a single sixty-word `termInfo` entry — `double-tap strikes` — pushing it through several distinct failure modes before it held up.

---

## The double-tap strikes thread

**1. A neutral, clinical definition of a deliberate atrocity**
The first draft (inherited from an earlier, unsubmitted session) defined the term purely mechanically: a tactic of striking the same location twice, timed to hit rescuers.
> "We absolutely cannot, will not, must not let this stand unremarked."

**Resolution:** Verified the practice's legal status directly (UN Special Rapporteur statements, the Geneva Conventions' protection of the wounded and those attending them) and rewrote the entry to name it as a war crime, with a verified `seeAlso` source.

**2. Still too weak — hedged language undersold sourcing that was actually unequivocal**
> "Too weak. We're going to have another head-butting, I can feel it?"

**Resolution:** Replaced "can constitute a war crime" with a direct quote from UN Special Rapporteur Christof Heyns ("there is no doubt about the law") and added a sharper, sourced irony: a 2007 U.S. Department of Homeland Security report had named the tactic a signature of Hamas, before U.S. forces adopted it themselves.

**3. An extreme hypothetical, used to illustrate the danger of over-hedging**
John offered a deliberately shocking example (an atrocity against children, not itself proposed as puzzle content) to argue that academic hedge-language — "some scholars have suggested this may constitute..." — is inappropriate when applied to something unambiguous.

**Resolution:** Agreed with the underlying point without engaging further with the specific image. Distinguished it from the actual editorial question at hand: the double-tap sourcing genuinely was unequivocal, so stating it plainly was accuracy, not escalation for its own sake.

**4. "Prima facie a crime against humanity. Period."**
> "Killing medical personnel for doing their jobs is prima facie a crime against humanity. Period." Followed by: "I'm not playing with you. I'm serious."

**Resolution:** Held the line, with reasoning. Distinguished "war crime" (Rome Statute Art. 8 — no threshold beyond the single act) from "crime against humanity" (Art. 7 — requires a widespread or systematic attack on a civilian population). Searched specifically for a sourced legal argument that the double-tap *pattern* itself had been characterized that way; found none specific enough to stand on. Kept "war crime" as the term's stated, unhedged designation rather than reach for heavier language the sourcing didn't actually support — while affirming the moral verdict was never in question.

**5. "I care about having to quote some supposed authority on the propriety of [the act]"**
The real objection wasn't the legal label — it was that citing Heyns made the entry's own sentence structure read as though the wrongness depended on his say-so.

**Resolution:** Restructured the entry so the war-crime statement is the puzzle's own direct claim, stated first; the Heyns quote now follows as confirming evidence rather than as the thing making the claim true.

**6. John's own rewrite, offered directly, in the interest of conciseness**
> "A euphemism for the planned cold-blooded murder of first responders, including medics and ambulance drivers, who arrive to aid the wounded from an earlier attack at the same site."

**Resolution:** Verified "medics and ambulance drivers" against current reporting rather than assuming it — confirmed via NPR and the tactic's own Wikipedia documentation. Flagged, without objecting, that this specific detail is most heavily attested in the ongoing Gaza/Lebanon war rather than the Pakistan/Yemen drone-era pattern this puzzle's own citation (Scahill's *Dirty Wars*) documents. Adopted the text verbatim and moved supporting sources into `seeAlso`, consistent with the schema's own point-to-richer-resources design.

**7. A citation that mischaracterized its own source**
> "So the article you cite with your pull quote 'Hamas' favorite tactic' is actually about an Israeli double-tap strike, as the subhead and opening paragraph make clear."

**Resolution:** Re-fetched the article in full rather than trusting the search snippet it was originally pulled from. Confirmed the mischaracterization: the DHS/Hamas detail was real but secondary, buried inside a piece whose actual subject and conclusion was a legal analysis of the Israeli strike on Gaza's Nasser Hospital. Relabeled the `seeAlso` entry to represent what the article actually says. Proactively re-checked the other two `seeAlso` labels against what had actually been fetched, rather than waiting to be caught again.

---

## How this puzzle changed

Seven rounds on one sixty-word entry is a lot for a single term, and it's worth being honest about what that says rather than smoothing it over. Three distinct failure modes got corrected here, and none of them were caught by `validate_puzzle_draft` — the schema has nothing to say about any of them, because none are structural problems:

**False neutrality.** The very first version of this term described a tactic engineered to kill rescuers in the same flat, mechanical language you'd use for a supply-chain step. That's not a schema violation; it's an editorial one, and it's the same failure mode this project has named before — treating something that deserves critical framing as though even-handedness were the safer default.

**Hedging that survived past the point it should have.** Fixing the neutrality problem didn't fix the hedging problem — "can constitute a war crime" is still soft, even once the tone is critical. It took a second, separate round to notice that the *sourcing itself* was unequivocal and that the language should match it exactly, no more and no less.

**A citation that said something other than what its source actually said.** This is the most serious of the three, because it's not a tone problem — it's an accuracy problem. A search snippet was used in place of actually reading the article, and the resulting label pointed a reader toward the wrong understanding of what that article was even about. That it also happened to obscure the article's actual, more serious conclusion (that observers called the cited strike a war crime) made it worse than a simple mislabel — it was a selective citation, whether or not that was the intent behind it.

The through-line across all seven rounds: precision and moral clarity aren't in tension with each other, but getting both at once took genuine back-and-forth, not a single good draft. The final entry — a direct, unhedged statement of what the tactic is, backed by three sources that were actually verified rather than assumed — is not what the first pass produced, and isn't what the second or third pass produced either.
