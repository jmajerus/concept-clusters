// Concept Clusters — puzzle registry
// Generated from the original puzzles.js by split_puzzles.py.
// Import and array order preserve the original puzzle order.

import energyFlow from "./science/energy-flow.js";
import mathFoundations from "./math/math-foundations.js";
import statesOfMatter from "./science/states-of-matter.js";
import democracyHistory from "./history-society/democracy-history.js";
import sentenceStructure from "./language-arts/sentence-structure.js";
import bodySystems from "./science/body-systems.js";
import algebraBasics from "./math/algebra-basics.js";
import dataProbability from "./math/data-probability.js";
import ancientCivilizations from "./history-society/ancient-civilizations.js";
import economicSystems from "./history-society/economic-systems.js";
import literaryDevices from "./language-arts/literary-devices.js";
import poeticForms from "./language-arts/poetic-forms.js";
import authoritarianRegimes from "./history-society/authoritarian-regimes.js";
import psychologySchools from "./philosophy-social-science/psychology-schools.js";
import sociologyParadigms from "./philosophy-social-science/sociology-paradigms.js";
import epistemologySchools from "./philosophy-social-science/epistemology-schools.js";
import fundamentalForces from "./science/fundamental-forces.js";
import philosophyBranches from "./philosophy-social-science/philosophy-branches.js";
import revolutionsModernWorld from "./history-society/revolutions-modern-world.js";
import mediaLiteracy from "./media-information-literacy/media-literacy.js";
import socialMediaHygeine from "./media-information-literacy/social-media-hygiene.js";
import quotationsAndAttribution from "./media-information-literacy/quotations-and-attribution.js";
import imagesOutOfContext from "./media-information-literacy/images-out-of-context.js";
import aiGeneratedSyntheticMedia from "./media-information-literacy/ai-generated-synthetic-media.js";
import breathingGasExchange from "./physiology-medicine/breathing-gas-exchange.js";
import howTheHeartPumps from "./physiology-medicine/how-the-heart-pumps.js";
import integumentarySystem from "./physiology-medicine/integumentary-system.js";
import maintainingHomeostasis from "./physiology-medicine/maintaining-homeostasis.js";
import interpretingAText from "./humanities/interpreting-a-text.js";
import readingAPainting from "./humanities/reading-a-painting.js";
import mythRitualAndSymbol from "./humanities/myth-ritual-and-symbol.js";
import lacansThreeRegisters from "./philosophy-social-science/lacans-three-registers.js";
import climateAndLivelihoods from "./geography/climate-and-livelihoods.js";
import riverBasinsAndHumanLife from "./geography/river-basins-and-human-life.js";
import evidenceAndInferenceAcrossDisciplines from "./media-information-literacy/evidence-and-inference-across-disciplines.js";
import revolutionsAsAProcess from "./history-society/revolutions-as-a-process.js";
import signalsAndRegulationInTheBody from "./physiology-medicine/signals-and-regulation-in-the-body.js";
import performanceCreatesMeaning from "./humanities/performance-creates-meaning.js";
import theWebCanon from "./computer-science/the-web-canon.js";
import theWebsBargain from "./computer-science/the-webs-bargain.js";
import theProgrammersBargain from "./computer-science/the-programmers-bargain.js";
import languageDesignChoices from "./computer-science/language-design-choices.js";
import choiceUnderInfluence from "./computer-science/choice-under-influence.js";
import theHiddenTransaction from "./computer-science/the-hidden-transaction.js";
import manufacturedPressure from "./computer-science/manufactured-pressure.js";
import controlAndExit from "./computer-science/control-and-exit.js";
import afterTheClickSource from "./computer-science/after-the-click.js";
import whenManipulationBecomesNormalSource from "./business-organizations/when-manipulation-becomes-normal.js";
import restoringHonestChoice from "./business-organizations/restoring-honest-choice.js";
import whenSystemsStopSeeingPeople from "./history-society/when-systems-stop-seeing-people.js";
import distortionAndMagnification from "./philosophy-social-science/distortion-and-magnification.js";
import restorativePatterns from "./humanities/restorative-patterns.js";
import fromPersonToObject from "./humanities/from-person-to-object.js";
import whenCorrectionFails from "./history-society/when-correction-fails.js";
import moralDisengagementAndMoralInversion from "./philosophy-social-science/moral-disengagement-and-moral-inversion.js";
import closingTheLoop from "./engineering/closing-the-loop.js";
import whatPublicHealthDoes from "./public-health/what-public-health-does.js";
import fromEvidenceToAction from "./public-health/from-evidence-to-action.js";
import whatSurvivedTheRecord from "./media-information-literacy/what-survived-the-record.js";
import countedAndModeled from "./media-information-literacy/counted-and-modeled.js";
import beforeItCrosses from "./science/before-it-crosses.js";

import howAPictureDirectsTheEye from "./art/how-a-picture-directs-the-eye.js";
import theWorkOfColor from "./art/the-work-of-color.js";
import whyArtChangesWhatItSees from "./art/why-art-changes-what-it-sees.js";
import whereMeaningComesFrom from "./art/where-meaning-comes-from.js";
import whatATestResultMeans from "./public-health/what-a-test-result-means.js";
import filmClassics from "./trivia/film-classics.js";
import musicTheoryBasics from "./music/music-theory-basics.js";
import filmTheoryBasics from "./film/film-theory-basics.js";
import dataScienceBasics from "./data-science/data-science-basics.js";
import gameTheoryBasics from "./math/game-theory-basics.js";
import finiteAndInfiniteGames from "./philosophy-social-science/finite-and-infinite-games.js";
import evolutionOfCooperation from "./philosophy-social-science/evolution-of-cooperation.js";
import howCouplesGetStuck from "./philosophy-social-science/how-couples-get-stuck.js";
import governingTheCommons from "./philosophy-social-science/governing-the-commons.js";
import waysOutOfAConflict from "./philosophy-social-science/ways-out-of-a-conflict.js";
import classicalNarrativeArchitecture from "./literary-theory-poetics/classical-narrative-architecture.js";
// Cross-disciplinary membership is expressed on the canonical registry
// object without cloning puzzle IDs or completion state. `category` remains
// the primary display/picker category; `categories` contains the full set.
const afterTheClick = {
  ...afterTheClickSource,
  category: "Philosophy & Social Science",
  categories: ["Philosophy & Social Science", "Computer Science"]
};

const whenManipulationBecomesNormal = {
  ...whenManipulationBecomesNormalSource,
  categories: ["Business & Organizations", "Computer Science"],
  subcategories: { "Computer Science": "computing-and-society" }
};

export const PUZZLES = [
  energyFlow,
  mathFoundations,
  statesOfMatter,
  democracyHistory,
  sentenceStructure,
  bodySystems,
  algebraBasics,
  dataProbability,
  ancientCivilizations,
  economicSystems,
  literaryDevices,
  poeticForms,
  authoritarianRegimes,
  psychologySchools,
  sociologyParadigms,
  epistemologySchools,
  fundamentalForces,
  philosophyBranches,
  revolutionsModernWorld,
  mediaLiteracy,
  socialMediaHygeine,
  quotationsAndAttribution,
  imagesOutOfContext,
  aiGeneratedSyntheticMedia,
  breathingGasExchange,
  howTheHeartPumps,
  integumentarySystem,
  maintainingHomeostasis,
  interpretingAText,
  readingAPainting,
  mythRitualAndSymbol,
  lacansThreeRegisters,
  climateAndLivelihoods,
  riverBasinsAndHumanLife,
  evidenceAndInferenceAcrossDisciplines,
  revolutionsAsAProcess,
  signalsAndRegulationInTheBody,
  performanceCreatesMeaning,
  theWebCanon,
  theWebsBargain,
  theProgrammersBargain,
  languageDesignChoices,
  choiceUnderInfluence,
  theHiddenTransaction,
  manufacturedPressure,
  controlAndExit,
  afterTheClick,
  whenManipulationBecomesNormal,
  restoringHonestChoice,
  whenSystemsStopSeeingPeople,
  distortionAndMagnification,
  restorativePatterns,
  fromPersonToObject,
  whenCorrectionFails,
  moralDisengagementAndMoralInversion,
  closingTheLoop,
  whatPublicHealthDoes,
  fromEvidenceToAction,
  whatSurvivedTheRecord,
  countedAndModeled,
  beforeItCrosses,
  howAPictureDirectsTheEye,
  theWorkOfColor,
  whyArtChangesWhatItSees,
  whereMeaningComesFrom,
  whatATestResultMeans,
  filmClassics,
  musicTheoryBasics,
  filmTheoryBasics,
  dataScienceBasics,
  gameTheoryBasics,
  finiteAndInfiniteGames,
  evolutionOfCooperation,
  howCouplesGetStuck,
  governingTheCommons,
  waysOutOfAConflict,
  classicalNarrativeArchitecture
];

export default PUZZLES;
