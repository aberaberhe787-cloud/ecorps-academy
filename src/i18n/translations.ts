export type Language = "am" | "en";

export interface I18nTranslations {
  // Navigation & Shell
  nav: {
    brandName: string;
    brandSubtitle: string;
    officialBadge: string;
    home: string;
    curriculum: string;
    sandbox: string;
    patterns: string;
    resources: string;
    engine: string;
    geminiEngine: string;
    mockEngine: string;
    xp: string;
    done: string;
    openSandboxCta: string;
    languageToggleTitle: string;
    switchLang: string;
    amharicLang: string;
    englishLang: string;
    activeLanguageNotice: string;
  };
  // Home View
  home: {
    badge: string;
    heroTitlePrefix: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    startLearningTrack: string;
    openInteractiveSandbox: string;
    statsLessons: string;
    statsMissions: string;
    statsPatterns: string;
    statsHandsOn: string;
    quickTryTitle: string;
    quickTrySubtitle: string;
    quickTryPlaceholder: string;
    analyzeAndTestBtn: string;
    qualityScore: string;
    strengthsDetected: string;
    suggestedImprovements: string;
    keyPillarsTitle: string;
    keyPillarsSubtitle: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar4Title: string;
    pillar4Desc: string;
    ctaBannerTitle: string;
    ctaBannerSubtitle: string;
    ctaBannerBtn: string;
  };
  // Curriculum / LMS View
  curriculum: {
    academyHeader: string;
    lmsVersion: string;
    trackTitle: string;
    trackDescription: string;
    currentStreak: string;
    daysActive: string;
    academicXp: string;
    theoryMastery: string;
    modulesMastered: string;
    syllabusTitle: string;
    syllabusSubtitle: string;
    resumeBtn: string;
    pillarMicroTitle: string;
    pillarMicroDesc: string;
    pillarRecallTitle: string;
    pillarRecallDesc: string;
    pillarBloomTitle: string;
    pillarBloomDesc: string;
    pillarSandboxTitle: string;
    pillarSandboxDesc: string;
    allBloomFilter: string;
    masteredBadge: string;
    verifyMasteryBtn: string;
    completeCheckpointsFirst: string;
    learningObjective: string;
    microConceptsTitle: string;
    understoodCount: string;
    activeRecallTitle: string;
    solvedCount: string;
    caseStudyTitle: string;
    collapseCaseStudy: string;
    expandCaseStudy: string;
    naiveTitle: string;
    engineeredTitle: string;
    promptLabel: string;
    modelOutputLabel: string;
    defectsLabel: string;
    theoreticalRationaleLabel: string;
    prevLesson: string;
    nextLesson: string;
    backToSyllabus: string;
    completeCurriculum: string;
    distractionFreeOn: string;
    distractionFreeOff: string;
    exitFocusMode: string;
    bloomLevel: string;
    mins: string;
    openInSandbox: string;
    mastered: string;
    verifyMastery: string;
    primaryObjective: string;
    microConceptFoundations: string;
    units: string;
    understood: string;
    theoreticalSummary: string;
    activeRecallSection: string;
    checkpoints: string;
    solved: string;
    comparativeCaseStudy: string;
    collapse: string;
    expandBreakdown: string;
    naiveInput: string;
    defects: string;
    engineeredPrompt: string;
    theoreticalRationale: string;
    previous: string;
    masterLesson: string;
    completeAcademicCurriculum: string;
    current: string;
    completed: string;
    start: string;
    stepperHeader?: string;
    stepperConcepts?: string;
    stepperQuizzes?: string;
    stepperSandbox?: string;
    stepperLiveLab?: string;
    stepperCaseStudy?: string;
    stepperComparative?: string;
    stepperMastery?: string;
    stepperReady?: string;
    stepperPending?: string;
  };
  // Playground / Sandbox View
  playground: {
    title: string;
    subtitle: string;
    tabSandbox: string;
    tabMissions: string;
    tabComparison: string;
    tabHistory: string;
    tabSaved: string;
    systemInstructionLabel: string;
    systemInstructionPlaceholder: string;
    promptEditorLabel: string;
    promptEditorPlaceholder: string;
    executeBtn: string;
    executing: string;
    clearBtn: string;
    loadPresetBtn: string;
    modelParams: string;
    temperatureLabel: string;
    topPLabel: string;
    liveQualityMeter: string;
    terminalOutputTitle: string;
    waitingForExecution: string;
    copyOutput: string;
    copied: string;
    tokenCount: string;
    latency: string;
    comparisonTitle: string;
    comparisonPromptA: string;
    comparisonPromptB: string;
    runComparisonBtn: string;
    historyEmpty: string;
    savedPromptsEmpty: string;
    saveCurrentPrompt: string;
  };
  // Pattern Library View
  patterns: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    filterBeginner: string;
    filterIntermediate: string;
    filterAdvanced: string;
    categoryFoundational: string;
    categoryReasoning: string;
    categoryStructured: string;
    categoryDefense: string;
    categoryAgents: string;
    copyTemplate: string;
    openInSandbox: string;
    useCase: string;
    whenToUse: string;
    theoreticalUnderpinning: string;
    customParameters: string;
  };
  // Resources View
  resources: {
    title: string;
    subtitle: string;
    frameworksTitle: string;
    frameworksSubtitle: string;
    cheatSheetTitle: string;
    cheatSheetSubtitle: string;
    citationsTitle: string;
    citationsSubtitle: string;
    ruleOfThumbTitle: string;
  };
  // Footer
  footer: {
    brandDesc: string;
    tracksHeader: string;
    trackFoundations: string;
    trackReasoning: string;
    trackSystems: string;
    trackSecurity: string;
    toolsHeader: string;
    toolSandbox: string;
    toolMissions: string;
    toolPatterns: string;
    toolResources: string;
    copyright: string;
    designedFor: string;
  };
}

export const translations: Record<Language, I18nTranslations> = {
  // =========================================================================
  // AMHARIC (አማርኛ) TRANSLATIONS
  // Strict Rules Applied:
  // 1. Technical Terms Preserved: "Gemini 3.7 Flash", "PROMPT-101", "125 XP", "Sandbox", "Pattern Library", code blocks.
  // 2. Grammatical Precision: Natural Ethiopian Amharic flow with subject-object-verb structure.
  // 3. Hybrid Technical Clarity: ፖርምፕት (Prompt), ቶከን (Token), ዴሊሚተር (Delimiter), የአቴንሽን ሚዛን (Attention Weights), ሰንሰለታዊ አስተሳሰብ (Chain-of-Thought).
  // 4. Structural Integrity: Exact key parity.
  // =========================================================================
  am: {
    nav: {
      brandName: "Ecorp",
      brandSubtitle: "የፖርምፕት ምህንድስና እና የኤአይ ሲስተሞች አካዳሚ",
      officialBadge: "ይፋዊ",
      home: "ዋና ገጽ",
      curriculum: "የስርዓተ-ትምህርት ማዕከል",
      sandbox: "Sandbox",
      patterns: "Pattern Library",
      resources: "ማጣቀሻዎች",
      engine: "ሞተር:",
      geminiEngine: "Gemini 3.7 Flash",
      mockEngine: "Smart Mock AI",
      xp: "XP",
      done: "ተጠናቋል",
      openSandboxCta: "Sandbox ክፈት",
      languageToggleTitle: "ቋንቋ ቀይር / Switch Language",
      switchLang: "ቋንቋ ቀይር",
      amharicLang: "አማርኛ (Amharic)",
      englishLang: "English (እንግሊዝኛ)",
      activeLanguageNotice: "በአሁኑ ሰዓት ሙሉ ድህረ-ገጹ ወደ አማርኛ ተተርጉሟል"
    },
    home: {
      badge: "በይነተገናኝ የፖርምፕት ምህንድስና አካዳሚ እና የሙከራ ላቦራቶሪ",
      heroTitlePrefix: "የኤአይ ፖርምፕት (Prompt) ምህንድስናን በጥልቀት ይማሩ",
      heroTitleHighlight: "ትላልቅ የቋንቋ ሞዴሎች (LLMs)",
      heroSubtitle:
        "ግልጽ ባልሆኑና በዘፈቀደ በሚሰጡ የኤአይ ፖርምፕቶች (Prompts) መገመትን ያስቁሙ። በይነተገናኝ ትምህርቶች፣ የቀጥታ የጥራት ምዘና፣ ደረጃ በደረጃ የሚመሩ የተልዕኮ ፈተናዎች እና በምርት ላይ በተረጋገጡ የፖርምፕት ፓተርኖች (Patterns) አማካኝነት ትክክለኛ የሞዴል ቁጥጥርን ያካብቱ።",
      startLearningTrack: "ስርዓተ-ትምህርቱን ጀምር",
      openInteractiveSandbox: "በይነተገናኝ Sandbox ክፈት",
      statsLessons: "በይነተገናኝ ትምህርቶች",
      statsMissions: "የተመዘኑ የተልዕኮ ፈተናዎች",
      statsPatterns: "የምርት ላይ የተረጋገጡ ፓተርኖች",
      statsHandsOn: "ተግባራዊ ልምምድ",
      quickTryTitle: "አፋጣኝ የፖርምፕት (Prompt) ጥራት መለኪያ",
      quickTrySubtitle: "የእርስዎን ፖርምፕት ያስገቡ፤ ስርአቱ ቶከን ቆጣቢነቱን፣ ሚናውን፣ ዴሊሚተሩን እና የውጤት መዋቅሩን ወዲያውኑ ይመዝነዋል፡",
      quickTryPlaceholder: "ፖርምፕትዎን እዚህ ይጻፉ...",
      analyzeAndTestBtn: "መዝን እና በ Sandbox ውስጥ ሞክር",
      qualityScore: "የጥራት ደረጃ",
      strengthsDetected: "የተገኙ ጠንካራ ጎኖች",
      suggestedImprovements: "የሚመከሩ ማሻሻያዎች",
      keyPillarsTitle: "የአካዳሚው 4 መሰረታዊ የትምህርት ምሰሶዎች",
      keyPillarsSubtitle: "በዘመናዊ የትምህርት ንድፍ (Instructional Design) የተዘጋጀ የላቀ የስልጠና ስርዓት",
      pillar1Title: "ጥቃቅን ትምህርቶች (Microlearning)",
      pillar1Desc: "በ 5-10 ደቂቃዎች ውስጥ የሚጠናቀቁ እና በአንድ ጽንሰ-ሀሳብ ላይ ያተኮሩ የንድፈ-ሀሳብ ማብራሪያዎች።",
      pillar2Title: "ንቁ ማስታወስ (Active Recall)",
      pillar2Desc: "እውቀትዎን የሚፈትሹ እና ወደ ቀጣዩ ክፍል የሚያሸጋግሩ በይነተገናኝ ጥያቄዎችና ማረጋገጫዎች።",
      pillar3Title: "የብሉም ታክሶኖሚ (Bloom's Taxonomy)",
      pillar3Desc: "ከማስታወስ እና መረዳት እስከ መተግበር፣ መገምገም እና አዲስ ስርዓት መፍጠር ድረስ የሚዘልቅ የእውቀት እድገት።",
      pillar4Title: "የተካተተ Sandbox ፈተና",
      pillar4Desc: "ትምህርቱን እያነበቡ ወዲያውኑ ፖርምፕት አርመው የሚሞክሩበት የተቀናጀ የኮዲንግ ላቦራቶሪ።",
      ctaBannerTitle: "የኤአይ ፖርምፕት ምህንድስና ብቃትን አሁን ያረጋግጡ",
      ctaBannerSubtitle: "ከመሰረታዊ የቶከን (Token) ባህሪ እስከ ውስብስብ ሰንሰለታዊ አስተሳሰብ (Chain-of-Thought) እና የዴሊሚተር (Delimiter) ጥበቃ ድረስ በይነተገናኝ ይለማመዱ።",
      ctaBannerBtn: "አሁኑኑ ይጀምሩ (ነፃ)"
    },
    curriculum: {
      academyHeader: "Ecorp Acadamy",
      lmsVersion: "LMS v2.6 አካዳሚክ ትራክ",
      trackTitle: "የቲዎሬቲካል ፖርምፕት (Prompt) ምህንድስና እና የኤአይ ሲስተሞች",
      trackDescription:
        "የቶከን (Token) እድል ስሌት፣ የዐውደ-ጽሑፍ ትምህርት (In-Context Learning)፣ የዴሊሚተር (Delimiter) ጥበቃ፣ ሰንሰለታዊ አስተሳሰብ (Chain-of-Thought) እና የተዋቀሩ የውጤት ንድፎችን (JSON Schemas) የሚያስተምር ጥልቅ የምርምር ስርዓተ-ትምህርት።",
      currentStreak: "የቀናት ተከታታይነት",
      daysActive: "ቀናት ንቁ",
      academicXp: "አካዳሚክ XP",
      theoryMastery: "የስርዓተ-ትምህርት የቲዎሪ ሽፋን:",
      modulesMastered: "ሞጁሎች ተጠናቀዋል",
      syllabusTitle: "የስርዓተ-ትምህርት ዝርዝር እና የትምህርት መንገዶች",
      syllabusSubtitle: "ወደ ጥልቅ የትምህርት ክፍል ለመግባት የሚፈልጉትን ሞጁል ይምረጡ።",
      resumeBtn: "ቀጥል:",
      pillarMicroTitle: "ጥቃቅን ትምህርቶች (Microlearning)",
      pillarMicroDesc: "በ 5-10 ደቂቃዎች ውስጥ የሚጠናቀቁ ነጠላ የንድፈ-ሀሳብ ግቦች።",
      pillarRecallTitle: "ንቁ ማስታወስ (Active Recall)",
      pillarRecallDesc: "ቀጣዩን ደረጃ ከመክፈትዎ በፊት ጥልቅ ግንዛቤን የሚያረጋግጡ ፈተናዎች።",
      pillarBloomTitle: "የብሉም ታክሶኖሚ (Bloom's Taxonomy)",
      pillarBloomDesc: "ከመረዳት (Understanding) ወደ መተግበር (Applying) እና መገምገም (Evaluating) ሽግግር።",
      pillarSandboxTitle: "የተካተተ Sandbox (Embedded Sandbox)",
      pillarSandboxDesc: "እዚያው በቦታው ፖርምፕትን የማረም እና የቀጥታ ማረጋገጫ የማግኘት ሙከራ።",
      allBloomFilter: "ሁሉም ደረጃዎች",
      masteredBadge: "ተጠናቋል",
      verifyMasteryBtn: "እውቀትዎን ያረጋግጡ",
      completeCheckpointsFirst: "መጀመሪያ ሁሉንም የፈተና ነጥቦች ያጠናቁ",
      learningObjective: "ዋና የትምህርት ግብ:",
      microConceptsTitle: "የጥቃቅን ጽንሰ-ሀሳቦች መሰረት",
      understoodCount: "ተረድተዋል",
      activeRecallTitle: "በይነተገናኝ የንቁ ማስታወስ እና የ Sandbox ፈተናዎች",
      solvedCount: "ተፈትተዋል",
      caseStudyTitle: "ንጽጽራዊ የጥናት ምሳሌ፡ ያልተስተካከለ vs. የተዋቀረ ፖርምፕት (Prompt)",
      collapseCaseStudy: "አሳንስ",
      expandCaseStudy: "ሙሉ ንጽጽር አሳይ",
      naiveTitle: "❌ ያልተስተካከለ እና አሻሚ ፖርምፕት (Naive Input)",
      engineeredTitle: "✅ በከፍተኛ ምህንድስና የተዋቀረ ፖርምፕት (Engineered Prompt)",
      promptLabel: "የቀረበ ፖርምፕት (Prompt):",
      modelOutputLabel: "የሞዴል ምላሽ (Model Output):",
      defectsLabel: "ድክመቶች (Defects):",
      theoreticalRationaleLabel: "የንድፈ-ሀሳብ ማብራሪያ (Theoretical Rationale):",
      prevLesson: "ቀዳሚ ትምህርት:",
      nextLesson: "ቀጣይ ትምህርት:",
      backToSyllabus: "ወደ ሲላበስ ተመለስ",
      completeCurriculum: "አጠቃላይ ስርዓተ-ትምህርቱን አጠናቅቅ",
      distractionFreeOn: "ትኩረት ሰብሳቢ ሁኔታ (Focus Mode)",
      distractionFreeOff: "መደበኛ ሁኔታ",
      exitFocusMode: "ትኩረት ሰብሳቢ ሁኔታን ዝጋ",
      bloomLevel: "የብሉም ደረጃ (Bloom's Level):",
      mins: "ደቂቃ",
      openInSandbox: "በ Sandbox ሞክር",
      mastered: "ተጠናቋል ✓",
      verifyMastery: "እውቀትዎን ያረጋግጡ",
      primaryObjective: "ዋና የትምህርት ግብ:",
      microConceptFoundations: "የጥቃቅን ጽንሰ-ሀሳቦች መሰረት",
      units: "ክፍሎች",
      understood: "ተረድተዋል",
      theoreticalSummary: "የንድፈ-ሀሳብ ማጠቃለያ",
      activeRecallSection: "በይነተገናኝ የንቁ ማስታወስ እና የ Sandbox ፈተናዎች",
      checkpoints: "ፈተናዎች",
      solved: "ተፈትተዋል",
      comparativeCaseStudy: "ንጽጽራዊ የጥናት ምሳሌ፡ ያልተስተካከለ vs. የተዋቀረ ፖርምፕት (Prompt)",
      collapse: "አሳንስ",
      expandBreakdown: "ሙሉ ንጽጽር አሳይ",
      naiveInput: "❌ ያልተስተካከለ እና አሻሚ ፖርምፕት (Naive Input)",
      defects: "ድክመቶች (Defects):",
      engineeredPrompt: "✅ በከፍተኛ ምህንድስና የተዋቀረ ፖርምፕት (Engineered Prompt)",
      theoreticalRationale: "የንድፈ-ሀሳብ ማብራሪያ (Theoretical Rationale):",
      previous: "ቀዳሚ",
      masterLesson: "ትምህርቱን አጠናቅቅ",
      completeAcademicCurriculum: "አጠቃላይ አካዳሚክ ስርዓተ-ትምህርቱን አጠናቅቅ",
      current: "የአሁኑ",
      completed: "ተጠናቋል",
      start: "ጀምር",
      stepperHeader: "የትምህርት ሂደት መከታተያ (Progress Stepper)",
      stepperConcepts: "1. ጥቃቅን ጽንሰ-ሀሳቦች",
      stepperQuizzes: "2. ንቁ ማስታወስ",
      stepperSandbox: "3. Sandbox ፈተና",
      stepperLiveLab: "የቀጥታ ላቦራቶሪ",
      stepperCaseStudy: "4. ንጽጽራዊ ጥናት",
      stepperComparative: "ያልተስተካከለ vs የተዋቀረ",
      stepperMastery: "5. ማረጋገጫ",
      stepperReady: "ብቃትዎን ያረጋግጡ",
      stepperPending: "ተቆልፏል"
    },
    playground: {
      title: "በይነተገናኝ የኤአይ ፖርምፕት Sandbox",
      subtitle: "ፖርምፕቶችን በቅጽበት ይሞክሩ፣ በ Gemini 3.7 Flash ያስፈጽሙ፣ ጥራታቸውን ይገምግሙ እና የውጤት ንጽጽር ያድርጉ።",
      tabSandbox: "Sandbox",
      tabMissions: "የተልዕኮ ፈተናዎች (Missions)",
      tabComparison: "A/B የውጤት ንጽጽር",
      tabHistory: "የሙከራ ታሪክ",
      tabSaved: "የተቀመጡ ፖርምፕቶች",
      systemInstructionLabel: "የስርዓት መመሪያ (System Instruction):",
      systemInstructionPlaceholder: "የሞዴሉን ሚና፣ ደንቦች እና ቋሚ ገደቦች እዚህ ይግለጹ...",
      promptEditorLabel: "የፖርምፕት አርታኢ (Prompt Editor):",
      promptEditorPlaceholder: "ፖርምፕትዎን እዚህ ይጻፉ... ተለዋዋጮችን በ {{variable_name}} መጠቀም ይችላሉ።",
      executeBtn: "አስፈጽም (Run Prompt)",
      executing: "እያስፈጸመ ነው...",
      clearBtn: "አጽዳ",
      loadPresetBtn: "ምሳሌዎችን ጫን",
      modelParams: "የሞዴል መለኪያዎች",
      temperatureLabel: "የሞዴል ሙቀት (Temperature)",
      topPLabel: "የናሙና ስፋት (Top-P)",
      liveQualityMeter: "የቀጥታ የጥራት መለኪያ",
      terminalOutputTitle: "የተርሚናል ውጤት (Terminal Output)",
      waitingForExecution: "ፖርምፕትዎን አስፈጽመው ውጤቱን እዚህ ይመልከቱ...",
      copyOutput: "ውጤቱን ቅዳ",
      copied: "ተቀድቷል!",
      tokenCount: "ቶከን (Tokens):",
      latency: "የፈጀው ጊዜ:",
      comparisonTitle: "ሁለት ፖርምፕቶችን ጎን ለጎን ያወዳድሩ",
      comparisonPromptA: "ፖርምፕት A (መነሻ)",
      comparisonPromptB: "ፖርምፕት B (የተሻሻለ)",
      runComparisonBtn: "ንጽጽር አስፈጽም",
      historyEmpty: "እስካሁን የተመዘገበ የሙከራ ታሪክ የለም።",
      savedPromptsEmpty: "እስካሁን ያስቀመጡት ብጁ ፖርምፕት የለም።",
      saveCurrentPrompt: "የአሁኑን ፖርምፕት አስቀምጥ"
    },
    patterns: {
      title: "በምርት ላይ የተረጋገጡ የፖርምፕት ፓተርኖች (Pattern Library)",
      subtitle: "ለደህንነቱ አስተማማኝ፣ ለተዋቀረ እና ለትክክለኛ የኤአይ ሲስተሞች የሚሆኑ ዝግጁ የፖርምፕት ንድፎች ስብስብ።",
      searchPlaceholder: "ፓተርኖችን ፈልግ (ለምሳሌ Few-Shot, JSON, ReAct, Delimiters)...",
      filterAll: "ሁሉም ፓተርኖች",
      filterBeginner: "የመጀመሪያ ደረጃ (Beginner)",
      filterIntermediate: "መካከለኛ ደረጃ (Intermediate)",
      filterAdvanced: "ከፍተኛ ደረጃ (Advanced)",
      categoryFoundational: "መሰረታዊ (Foundational)",
      categoryReasoning: "አመክንዮ እና አስተሳሰብ (Reasoning)",
      categoryStructured: "የተዋቀረ ውጤት (Structured)",
      categoryDefense: "የደህንነት ጥበቃ (Defense)",
      categoryAgents: "ራሳቸውን የቻሉ ኤጀንቶች (Agents)",
      copyTemplate: "ቴምፕሌቱን ቅዳ",
      openInSandbox: "በ Sandbox ሞክር",
      useCase: "ተግባራዊ ጠቀሜታ:",
      whenToUse: "መቼ መጠቀም እንዳለብዎት:",
      theoreticalUnderpinning: "የንድፈ-ሀሳብ መሰረት:",
      customParameters: "ብጁ መለኪያዎችን አስገባ:"
    },
    resources: {
      title: "የፖርምፕት ምህንድስና ማጣቀሻዎች እና መመሪያዎች",
      subtitle: "የጥናት ምርምር ጽሁፎች፣ የኢንዱስትሪ መመሪያዎች እና የቶከን (Token) ቆጣቢነት ቀመሮች ስብስብ።",
      frameworksTitle: "የታወቁ የፖርምፕት አወቃቀር ማዕቀፎች",
      frameworksSubtitle: "በኢንዱስትሪው ውስጥ በሰፊው ተቀባይነት ያገኙ የፖርምፕት አደረጃጀት ሞዴሎች",
      cheatSheetTitle: "አፋጣኝ የደንቦች ማጠቃለያ (Cheat Sheet)",
      cheatSheetSubtitle: "በየዕለቱ የኤአይ ፖርምፕቶችን ሲያዘጋጁ መከተል ያለብዎት ወሳኝ ደንቦች",
      citationsTitle: "አካዳሚክ እና የምርምር ማጣቀሻዎች",
      citationsSubtitle: "ትምህርቱ የተመሰረተባቸው ቁልፍ የትራንስፎርመር (Transformer) እና የኤአይ ጥናቶች",
      ruleOfThumbTitle: "የወርቅ ደንቦች (Golden Rules)"
    },
    footer: {
      brandDesc: "በ Ecorp Acadamy የተዘጋጀ ለኤአይ አልሚዎች፣ ለፖርምፕት መሃንዲሶች እና ለሲስተም አርክቴክቶች የሚሆን በይነተገናኝ የስልጠና እና የሙከራ ማዕከል።",
      tracksHeader: "የትምህርት ትራኮች",
      trackFoundations: "የፖርምፕት ምህንድስና መሰረቶች",
      trackReasoning: "የላቀ ሰንሰለታዊ አስተሳሰብ (CoT)",
      trackSystems: "የምርት ላይ ሲስተሞች እና ኤጀንቶች",
      trackSecurity: "ደህንነት እና የኢንጀክሽን መከላከያ",
      toolsHeader: "በይነተገናኝ መሳሪያዎች",
      toolSandbox: "በይነተገናኝ ፖርምፕት Sandbox",
      toolMissions: "የተመዘኑ የተልዕኮ ፈተናዎች",
      toolPatterns: "የተረጋገጡ የፓተርን ቤተ-መጽሐፍት",
      toolResources: "የጥናት ማጣቀሻዎች እና መመሪያዎች",
      copyright: "መብቱ በህግ የተጠበቀ ነው። Ecorp Acadamy.",
      designedFor: "ለከፍተኛ ትክክለኛነት እና ለትምህርት ጥራት የተዘጋጀ"
    }
  },

  // =========================================================================
  // ENGLISH TRANSLATIONS (Reference & Switchable)
  // =========================================================================
  en: {
    nav: {
      brandName: "Ecorp",
      brandSubtitle: "Prompt Engineering & AI Systems",
      officialBadge: "OFFICIAL",
      home: "Home",
      curriculum: "Learning Hub",
      sandbox: "Sandbox",
      patterns: "Pattern Library",
      resources: "Resources",
      engine: "Engine:",
      geminiEngine: "Gemini 3.7 Flash",
      mockEngine: "Smart Mock AI",
      xp: "XP",
      done: "done",
      openSandboxCta: "Open Sandbox",
      languageToggleTitle: "Switch Language / ቋንቋ ቀይር",
      switchLang: "Language",
      amharicLang: "አማርኛ (Amharic)",
      englishLang: "English (እንግሊዝኛ)",
      activeLanguageNotice: "Application is displayed in English"
    },
    home: {
      badge: "Interactive Prompt Engineering Academy & Laboratory",
      heroTitlePrefix: "Master the Architecture of",
      heroTitleHighlight: "Large Language Models",
      heroSubtitle:
        "Stop guessing with ambiguous AI prompts. Learn precision prompt engineering through interactive lessons, automated rubric evaluation, real-time quality grading, and battle-tested production patterns.",
      startLearningTrack: "Start Learning Track",
      openInteractiveSandbox: "Open Interactive Sandbox",
      statsLessons: "Interactive Lessons",
      statsMissions: "Graded Missions",
      statsPatterns: "Production Patterns",
      statsHandsOn: "Hands-On Practice",
      quickTryTitle: "Real-Time Prompt Quality Analyzer",
      quickTrySubtitle: "Enter your prompt to evaluate token density, persona anchoring, delimiters, and structured outputs instantly:",
      quickTryPlaceholder: "Write your prompt here...",
      analyzeAndTestBtn: "Analyze & Open in Sandbox",
      qualityScore: "Quality Score",
      strengthsDetected: "Strengths Detected",
      suggestedImprovements: "Suggested Improvements",
      keyPillarsTitle: "4 Pedagogical Pillars of Instructional Design",
      keyPillarsSubtitle: "Engineered with modern educational science for deep mastery",
      pillar1Title: "Microlearning",
      pillar1Desc: "5-10 min focused concept units with single theoretical objectives.",
      pillar2Title: "Active Recall",
      pillar2Desc: "Gatekeeper checkpoints validating deep understanding before progression.",
      pillar3Title: "Bloom's Taxonomy",
      pillar3Desc: "Remembering → Understanding → Applying → Evaluating progression.",
      pillar4Title: "Embedded Sandbox",
      pillar4Desc: "In-situ prompt refactoring labs with real-time heuristic validation.",
      ctaBannerTitle: "Elevate Your Prompt Engineering Capabilities",
      ctaBannerSubtitle: "From token probability conditioning to Chain-of-Thought reasoning allocations and Delimiter defense.",
      ctaBannerBtn: "Get Started Free"
    },
    curriculum: {
      academyHeader: "Ecorp Acadamy",
      lmsVersion: "LMS v2.6 Academic Track",
      trackTitle: "Theoretical Prompt Engineering & AI Systems",
      trackDescription:
        "Rigorous, research-grounded curriculum covering token probability mechanics, in-context learning dynamics, delimited injection perimeters, Chain-of-Thought reasoning allocations, and grammar-constrained schema decodings.",
      currentStreak: "Current Streak",
      daysActive: "Days Active",
      academicXp: "Academic XP",
      theoryMastery: "Curriculum Theory Mastery:",
      modulesMastered: "Modules Mastered",
      syllabusTitle: "Structured Academic Syllabus & Pathways",
      syllabusSubtitle: "Select a module node to enter the immersive instructional study mode.",
      resumeBtn: "Resume:",
      pillarMicroTitle: "Microlearning",
      pillarMicroDesc: "5-10 min focused concept units with single theoretical objectives.",
      pillarRecallTitle: "Active Recall",
      pillarRecallDesc: "Gatekeeper checkpoints validating deep understanding before progression.",
      pillarBloomTitle: "Bloom's Taxonomy",
      pillarBloomDesc: "Remembering → Understanding → Applying → Evaluating progression.",
      pillarSandboxTitle: "Embedded Sandbox",
      pillarSandboxDesc: "In-situ prompt refactoring labs with real-time heuristic validation.",
      allBloomFilter: "All Levels",
      masteredBadge: "Mastered",
      verifyMasteryBtn: "Verify Mastery",
      completeCheckpointsFirst: "Complete All Checkpoints First",
      learningObjective: "Primary Learning Objective:",
      microConceptsTitle: "Micro-Concept Foundations",
      understoodCount: "Understood",
      activeRecallTitle: "Interactive Active Recall & Sandbox Labs",
      solvedCount: "Solved",
      caseStudyTitle: "Comparative Case Study: Naive vs. Engineered Prompt Anatomy",
      collapseCaseStudy: "Collapse",
      expandCaseStudy: "Expand Breakdown",
      naiveTitle: "❌ The Naive / Ambiguous Input",
      engineeredTitle: "✅ The Masterfully Engineered Prompt",
      promptLabel: "Prompt:",
      modelOutputLabel: "Model Output:",
      defectsLabel: "Defects:",
      theoreticalRationaleLabel: "Theoretical Rationale:",
      prevLesson: "Previous:",
      nextLesson: "Next Lesson:",
      backToSyllabus: "Back to Syllabus",
      completeCurriculum: "Complete Academic Curriculum",
      distractionFreeOn: "Focus Mode (On)",
      distractionFreeOff: "Focus Mode (Off)",
      exitFocusMode: "Exit Focus Mode",
      bloomLevel: "Bloom's Level:",
      mins: "mins",
      openInSandbox: "Open in Sandbox",
      mastered: "Mastered ✓",
      verifyMastery: "Verify Mastery",
      primaryObjective: "Primary Learning Objective:",
      microConceptFoundations: "Micro-Concept Foundations",
      units: "units",
      understood: "understood",
      theoreticalSummary: "Theoretical Summary",
      activeRecallSection: "Interactive Active Recall & Sandbox Labs",
      checkpoints: "checkpoints",
      solved: "solved",
      comparativeCaseStudy: "Comparative Case Study: Naive vs. Engineered Prompt Anatomy",
      collapse: "Collapse",
      expandBreakdown: "Expand Breakdown",
      naiveInput: "❌ The Naive / Ambiguous Input",
      defects: "Defects:",
      engineeredPrompt: "✅ The Masterfully Engineered Prompt",
      theoreticalRationale: "Theoretical Rationale:",
      previous: "Previous",
      masterLesson: "Master Lesson",
      completeAcademicCurriculum: "Complete Academic Curriculum",
      current: "Current",
      completed: "Completed",
      start: "Start",
      stepperHeader: "Lesson Learning Progression Stepper",
      stepperConcepts: "1. Micro-Concepts",
      stepperQuizzes: "2. Active Recall",
      stepperSandbox: "3. Sandbox Challenge",
      stepperLiveLab: "Live Prompt Lab",
      stepperCaseStudy: "4. Case Anatomy",
      stepperComparative: "Naive vs Refined",
      stepperMastery: "5. Verify Mastery",
      stepperReady: "Ready to Claim",
      stepperPending: "Locked"
    },
    playground: {
      title: "Interactive AI Prompt Sandbox",
      subtitle: "Experiment with live prompts, execute on Gemini 3.7 Flash, grade quality in real time, and compare outputs.",
      tabSandbox: "Sandbox",
      tabMissions: "Missions",
      tabComparison: "A/B Comparison",
      tabHistory: "History",
      tabSaved: "Saved Prompts",
      systemInstructionLabel: "System Instruction:",
      systemInstructionPlaceholder: "Define persona, boundary rules, or persistent negative constraints here...",
      promptEditorLabel: "Prompt Editor:",
      promptEditorPlaceholder: "Type your prompt here... Use {{variable_name}} for dynamic placeholders.",
      executeBtn: "Execute Prompt",
      executing: "Executing...",
      clearBtn: "Clear",
      loadPresetBtn: "Load Presets",
      modelParams: "Model Parameters",
      temperatureLabel: "Temperature",
      topPLabel: "Top-P",
      liveQualityMeter: "Live Quality Meter",
      terminalOutputTitle: "Terminal Output",
      waitingForExecution: "Run your prompt above to inspect model completions...",
      copyOutput: "Copy Output",
      copied: "Copied!",
      tokenCount: "Tokens:",
      latency: "Latency:",
      comparisonTitle: "Compare Two Prompts Side-by-Side",
      comparisonPromptA: "Prompt A (Baseline)",
      comparisonPromptB: "Prompt B (Variant)",
      runComparisonBtn: "Run Comparison",
      historyEmpty: "No prompt execution history recorded yet.",
      savedPromptsEmpty: "No saved custom prompts yet.",
      saveCurrentPrompt: "Save Current Prompt"
    },
    patterns: {
      title: "Production Prompt Pattern Library",
      subtitle: "Battle-tested prompt architecture blueprints for reliable, structured, and secure AI systems.",
      searchPlaceholder: "Search patterns (e.g. Few-Shot, JSON, ReAct, Delimiters)...",
      filterAll: "All Patterns",
      filterBeginner: "Beginner",
      filterIntermediate: "Intermediate",
      filterAdvanced: "Advanced",
      categoryFoundational: "Foundational",
      categoryReasoning: "Reasoning",
      categoryStructured: "Structured Output",
      categoryDefense: "Defense",
      categoryAgents: "Autonomous Agents",
      copyTemplate: "Copy Template",
      openInSandbox: "Try in Sandbox",
      useCase: "Use Case:",
      whenToUse: "When to Use:",
      theoreticalUnderpinning: "Theoretical Underpinning:",
      customParameters: "Customize Parameters:"
    },
    resources: {
      title: "Prompt Engineering Resources & Reference",
      subtitle: "Academic citations, enterprise frameworks, cheat sheets, and token economy guidelines.",
      frameworksTitle: "Established Prompt Engineering Frameworks",
      frameworksSubtitle: "Industry-standard heuristics for structuring enterprise instructions",
      cheatSheetTitle: "Quick-Reference Cheat Sheet",
      cheatSheetSubtitle: "Essential day-to-day rules for prompt formulation",
      citationsTitle: "Academic Research Citations",
      citationsSubtitle: "Foundational Transformer and LLM papers backing this curriculum",
      ruleOfThumbTitle: "Golden Rules of Prompting"
    },
    footer: {
      brandDesc: "An interactive learning hub, real-time quality analyzer, and testing sandbox for prompt engineers, AI developers, and system architects by Ecorp Acadamy.",
      tracksHeader: "Curriculum Tracks",
      trackFoundations: "Foundations of Prompting",
      trackReasoning: "Advanced Reasoning & CoT",
      trackSystems: "Production Systems & Agents",
      trackSecurity: "Security & Injection Defenses",
      toolsHeader: "Interactive Tools",
      toolSandbox: "Interactive Prompt Sandbox",
      toolMissions: "Automated Missions Evaluation",
      toolPatterns: "Production Pattern Library",
      toolResources: "Research Reference Guide",
      copyright: "All rights reserved. Ecorp Acadamy.",
      designedFor: "Crafted for research-backed precision and instructional clarity"
    }
  }
};
