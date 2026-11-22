-- EdPro Relational Database Schema
-- Compatible with SQLite (sql.js) and standard SQL dialects

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  display_name TEXT NOT NULL,
  age INTEGER,
  age_track TEXT CHECK(age_track IN ('early_childhood_6_9', 'middle_school_10_13', 'high_school_14_17')),
  passion_track TEXT DEFAULT 'visual_arts',
  focus_art_ratio INTEGER DEFAULT 60,
  focus_math_ratio INTEGER DEFAULT 40,
  avatar_seed TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_privacy_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  coppa_covered INTEGER NOT NULL DEFAULT 1,
  consent_status TEXT NOT NULL CHECK(consent_status IN ('PENDING', 'SCHOOL_AUTHORIZED', 'PARENT_VERIFIED', 'REVOKED')),
  authorized_by_user_id TEXT,
  authorized_at TEXT,
  retention_expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  age_track TEXT NOT NULL,
  passion_cluster TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  badge_color TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  spark_hook TEXT NOT NULL,
  objective TEXT NOT NULL,
  key_concepts_json TEXT NOT NULL,
  allowed_vocab_json TEXT NOT NULL,
  analogies_json TEXT NOT NULL,
  reader_content TEXT NOT NULL,
  video_url TEXT,
  video_title TEXT,
  simulation_type TEXT,
  simulation_config_json TEXT,
  audio_summary_text TEXT,
  worksheet_title TEXT,
  worksheet_markdown TEXT,
  pulse_question_json TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS milestone_assessments (
  id TEXT PRIMARY KEY,
  course_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70,
  questions_json TEXT NOT NULL,
  performance_task_json TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_progress (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  current_lesson INTEGER DEFAULT 1,
  completed_lessons_json TEXT DEFAULT '[]',
  streak_days INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL,
  UNIQUE(student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_submissions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  assessment_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  auto_score INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('GRADED', 'PENDING_TEACHER_REVIEW')),
  artifact_url TEXT,
  artifact_title TEXT,
  artifact_description TEXT,
  answers_json TEXT NOT NULL,
  teacher_grade INTEGER,
  teacher_feedback TEXT,
  reviewed_by_id TEXT,
  reviewed_at TEXT,
  submitted_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES milestone_assessments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_resource TEXT NOT NULL,
  target_id TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  timestamp TEXT NOT NULL
);
