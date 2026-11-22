// EdPro Global Internationalization Dictionary

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ar' | 'de';

export interface Translations {
  learningTrack: string;
  educatorPortal: string;
  complianceLedger: string;
  askEdBot: string;
  signIn: string;
  signOut: string;
  activeSessions: string;
  curriculumFocus: string;
  studioArts: string;
  appliedMath: string;
  openLecture: string;
  milestoneTest: string;
  accessibility: string;
  bionicReading: string;
  dyslexicFont: string;
  sensoryMode: string;
  cognitivePacing: string;
  microChunk: string;
  hyperfocus: string;
  voiceInput: string;
  readAloud: string;
  iepNarratives: string;
  courseStudio: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    learningTrack: 'Learning Track',
    educatorPortal: 'Educator Portal',
    complianceLedger: 'Compliance Ledger',
    askEdBot: 'Ask EdBot',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    activeSessions: 'Active Sessions',
    curriculumFocus: 'Curriculum Focus Allocation',
    studioArts: 'Studio Arts',
    appliedMath: 'Applied Math & Logic',
    openLecture: 'Open Lecture',
    milestoneTest: 'Milestone 7 Test',
    accessibility: 'Sensory & Accessibility',
    bionicReading: 'Bionic Eye-Fixation Reading',
    dyslexicFont: 'OpenDyslexic Typeface',
    sensoryMode: 'Sensory Calibration',
    cognitivePacing: 'Cognitive Pacing',
    microChunk: 'Micro-Chunk Pacer (ADHD / Executive)',
    hyperfocus: 'Deep Monotropic Immersion',
    voiceInput: 'Voice Socratic Input',
    readAloud: 'Read Aloud (TTS)',
    iepNarratives: 'IEP & Strengths Telemetry',
    courseStudio: 'Course Authoring Studio'
  },
  es: {
    learningTrack: 'Ruta de Aprendizaje',
    educatorPortal: 'Portal del Educador',
    complianceLedger: 'Registro de Cumplimiento',
    askEdBot: 'Preguntar a EdBot',
    signIn: 'Iniciar Sesión',
    signOut: 'Cerrar Sesión',
    activeSessions: 'Sesiones Activas',
    curriculumFocus: 'Asignación de Enfoque Curricular',
    studioArts: 'Artes de Taller',
    appliedMath: 'Matemáticas y Lógica Aplicadas',
    openLecture: 'Abrir Lección',
    milestoneTest: 'Evaluación Hito 7',
    accessibility: 'Sensorial y Accesibilidad',
    bionicReading: 'Lectura Biónica de Fijación Ocular',
    dyslexicFont: 'Tipografía OpenDyslexic',
    sensoryMode: 'Calibración Sensorial',
    cognitivePacing: 'Ritmo Cognitivo',
    microChunk: 'Ritmo en Microbloques (TDAH)',
    hyperfocus: 'Inmersión Monotrópica Profunda',
    voiceInput: 'Entrada de Voz Socrática',
    readAloud: 'Lectura en Voz Alta',
    iepNarratives: 'Telemetría de IEP y Fortalezas',
    courseStudio: 'Estudio de Creación de Cursos'
  },
  fr: {
    learningTrack: "Parcours d'Apprentissage",
    educatorPortal: "Portail de l'Éducateur",
    complianceLedger: 'Registre de Conformité',
    askEdBot: 'Consulter EdBot',
    signIn: 'Se Connecter',
    signOut: 'Se Déconnecter',
    activeSessions: 'Sessions Actives',
    curriculumFocus: "Répartition de l'Accent Curriculaire",
    studioArts: "Arts d'Atelier",
    appliedMath: 'Mathématiques & Logique Appliquées',
    openLecture: 'Ouvrir la Leçon',
    milestoneTest: 'Évaluation Étape 7',
    accessibility: 'Sensoriel & Accessibilité',
    bionicReading: 'Lecture Bionique à Fixation Oculaire',
    dyslexicFont: 'Typographie OpenDyslexic',
    sensoryMode: 'Calibrage Sensoriel',
    cognitivePacing: 'Rythme Cognitif',
    microChunk: 'Cadenceur Micro-Blocs (TDAH)',
    hyperfocus: 'Immersion Monotropique Profonde',
    voiceInput: 'Entrée Vocale Socratique',
    readAloud: 'Lecture Vocale',
    iepNarratives: 'Télémétrie IEP & Points Forts',
    courseStudio: 'Studio de Création de Cours'
  },
  ar: {
    learningTrack: 'مسار التعلم',
    educatorPortal: 'بوابة المعلم',
    complianceLedger: 'سجل الامتثال',
    askEdBot: 'اسأل إدبوت',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    activeSessions: 'الجلسات النشطة',
    curriculumFocus: 'توزيع التركيز الدراسي',
    studioArts: 'فنون الاستوديو',
    appliedMath: 'الرياضيات والمنطق التطبيقي',
    openLecture: 'فتح المحاضرة',
    milestoneTest: 'اختبار المرحلة 7',
    accessibility: 'الحسية وإمكانية الوصول',
    bionicReading: 'القراءة البايونية للتثبيت البصري',
    dyslexicFont: 'خط عسر القراءة المفتوح',
    sensoryMode: 'المعايرة الحسية',
    cognitivePacing: 'التسارع الإدراكي',
    microChunk: 'وتيرة الأجزاء الدقيقة (ADHD)',
    hyperfocus: 'الانغماس أحادي التركيز العميق',
    voiceInput: 'إدخال صوتي سقراطي',
    readAloud: 'قراءة بصوت عالٍ',
    iepNarratives: 'قياسات برنامج التعليم الفردي ونقاط القوة',
    courseStudio: 'استوديو تأليف الدورات'
  },
  de: {
    learningTrack: 'Lernpfad',
    educatorPortal: 'Lehrkräfte-Portal',
    complianceLedger: 'Compliance-Protokoll',
    askEdBot: 'EdBot fragen',
    signIn: 'Anmelden',
    signOut: 'Abmelden',
    activeSessions: 'Aktive Sitzungen',
    curriculumFocus: 'Lehrplan-Schwerpunktverteilung',
    studioArts: 'Atelier-Kunst',
    appliedMath: 'Angewandte Mathematik & Logik',
    openLecture: 'Lektion öffnen',
    milestoneTest: 'Meilenstein 7 Test',
    accessibility: 'Sensorik & Barrierefreiheit',
    bionicReading: 'Bionisches Fixationslesen',
    dyslexicFont: 'OpenDyslexic Schriftart',
    sensoryMode: 'Sensorische Kalibrierung',
    cognitivePacing: 'Kognitives Pacing',
    microChunk: 'Mikro-Abschnitt Pacing (ADHS)',
    hyperfocus: 'Tiefe Monotropische Immersion',
    voiceInput: 'Sokratische Spracheingabe',
    readAloud: 'Vorlesen (TTS)',
    iepNarratives: 'Förderplan & Stärken-Telemetrie',
    courseStudio: 'Kurs-Autorenstudio'
  }
};
