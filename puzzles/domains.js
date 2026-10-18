// A small, fixed vocabulary of broad subject groupings above category.
// Category records in categories.js refer to these ids; this file is
// code-owned and is not part of the D1-to-Git category freeze path.
// Domains group the category-browse screen's cards under readable headings,
// alphabetically by title -- declaration order here is not display order,
// and carries no meaning of its own. See docs/TAXONOMY-ROADMAP.md for the
// reasoning and staged rollout.
export const DOMAINS = {
  // Sciences, Mathematics, Computer Science, Engineering, and Data Science
  // were originally five separate domains -- far finer-grained than
  // Social Sciences, Humanities, or Art & Design, each of which already
  // spans several comparably distinct fields under one domain. Consolidated
  // into two broader domains for parity; split back out once real content
  // (not just the vocabulary) justifies the finer grain again. See
  // docs/TAXONOMY-ROADMAP.md.
  "sciences-mathematics": {
    title: "Sciences & Mathematics",
    info: { text: "The formal and physical sciences: physics, chemistry, astronomy, and the mathematics and methods common to them." }
  },
  "life-sciences": {
    title: "Life Sciences",
    info: { text: "Biology and its subfields: how living systems store information, build and regulate themselves, reproduce, vary, and change over time." }
  },
  "computing-engineering": {
    title: "Computing & Engineering",
    info: { text: "Computation, algorithms, and software; designed systems, materials, control, and robotics; and the data science and analytics running through both." }
  },
  "earth-environment": {
    title: "Earth & Environment",
    info: { text: "Geology, climate, oceanography, ecology, geography, environmental policy." }
  },
  "health-medicine": {
    title: "Health & Medicine",
    info: { text: "Anatomy, physiology, clinical reasoning, nutrition, and population health." }
  },
  "humanities": {
    title: "Humanities",
    info: { text: "Literature, history, philosophy, religion, and cultural interpretation." }
  },
  "language-literacy": {
    title: "Language & Literacy",
    info: { text: "How language is built and used well: grammar, rhetoric, composition, second-language learning." }
  },
  "communication-media": {
    title: "Communication & Media",
    info: { text: "Journalism, media studies, information literacy, evidence and sourcing." }
  },
  "art-design": {
    title: "Art & Design",
    info: { text: "Visual arts, music, film, graphic and product design, media production." }
  },
  "business-management": {
    title: "Business & Management",
    info: { text: "Marketing, finance, accounting, leadership, organizational design." }
  },
  "literature-classics": {
    title: "Literature & Classics",
    info: { text: "Narrative theory, classical epics and mythology, drama and poetics, literary criticism, and canonical texts across historical traditions." }
  },
  "social-sciences": {
    title: "Social Sciences",
    info: { text: "Psychology and learning sciences, sociology, anthropology, behavioral economics, politics, and educational theory." }
  },
  "interdisciplinary-studies": {
    title: "Interdisciplinary Studies",
    info: {
      text: "Fields organized around a problem rather than a single discipline — peace and conflict, technology and society, and critical theory."
    }
  }
};

export const GENERATED_DOMAIN_IDS = Object.freeze({
  other: "other"
});

export const RESERVED_DOMAIN_IDS = new Set(
  Object.values(GENERATED_DOMAIN_IDS)
);
