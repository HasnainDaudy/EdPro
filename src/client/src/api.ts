import { User, Course, LessonDetail, MilestoneAssessment, ChatMessage, LLMConfig } from './types.js';

const API_BASE = '/api';

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function loginUser(username: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Login failed.');
  }
  return data.user;
}

export async function registerUser(payload: {
  username: string;
  password: string;
  displayName: string;
  role: string;
  age: number;
  passionTrack: string;
}): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Registration failed.');
  }
  return data.user;
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
}

export async function updateProfile(updates: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to update profile.');
  return data.user;
}

export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE}/courses`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load courses.');
  const data = await res.json();
  return data.courses;
}

export async function fetchCourseDetail(id: string): Promise<{ course: Course & { lessons: any[] } }> {
  const res = await fetch(`${API_BASE}/courses/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load course details.');
  return await res.json();
}

export async function fetchLesson(courseId: string, lessonNumber: number): Promise<LessonDetail> {
  const res = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonNumber}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load lesson.');
  const data = await res.json();
  return data.lesson;
}

export async function completeLesson(courseId: string, lessonNumber: number): Promise<void> {
  const res = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonNumber}/complete`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to mark lesson complete.');
}

export async function fetchMilestoneAssessment(courseId: string): Promise<{
  assessment: MilestoneAssessment;
  previousSubmission?: any;
}> {
  const res = await fetch(`${API_BASE}/assessments/${courseId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load milestone assessment.');
  return await res.json();
}

export async function submitMilestoneAssessment(
  courseId: string,
  payload: {
    answers: Record<string, number>;
    artifactTitle: string;
    artifactDescription: string;
    ethicalImpactStatement?: string;
    artifactUrl: string;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE}/assessments/${courseId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to submit assessment.');
  return data;
}

export async function testLLMConnection(llmConfig: LLMConfig): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/tutor/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ llmConfig }),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || `HTTP ${res.status}: ${res.statusText}` };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Network connection failed' };
  }
}

export async function streamTutorChat(
  payload: {
    message: string;
    courseId?: string;
    lessonNumber?: number;
    lessonTitle?: string;
    courseTitle?: string;
    activeModality?: string;
    conversationHistory?: any[];
    llmConfig?: LLMConfig;
  },
  callbacks: {
    onStart?: (persona: any) => void;
    onToken?: (token: string) => void;
    onSuggestion?: (suggestions: string[], isBlockedAnswer: boolean) => void;
    onSafetyPivot?: (reason: string) => void;
    onDone?: () => void;
    onError?: (err: any) => void;
  }
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/tutor/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Streaming connection failed');
    }

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const block of lines) {
        if (!block.trim()) continue;
        const eventMatch = block.match(/event:\s*([^\n]+)/);
        const dataMatch = block.match(/data:\s*([^\n]+)/);

        if (eventMatch && dataMatch) {
          const eventType = eventMatch[1].trim();
          const eventData = JSON.parse(dataMatch[1]);

          if (eventType === 'start') callbacks.onStart?.(eventData);
          else if (eventType === 'token') callbacks.onToken?.(eventData.token);
          else if (eventType === 'suggestion') callbacks.onSuggestion?.(eventData.suggestions, eventData.isDirectAnswerBlocked);
          else if (eventType === 'safety_pivot') callbacks.onSafetyPivot?.(eventData.reason);
          else if (eventType === 'done') callbacks.onDone?.();
        }
      }
    }
  } catch (err) {
    callbacks.onError?.(err);
  }
}

export async function fetchSuggestedTutorPrompts(courseId?: string, lessonNumber?: number): Promise<string[]> {
  const query = courseId && lessonNumber ? `?courseId=${courseId}&lessonNumber=${lessonNumber}` : '';
  const res = await fetch(`${API_BASE}/tutor/suggested-prompts${query}`, { credentials: 'include' });
  if (!res.ok) return ['Explain this concept to me', 'Give me a fun analogy'];
  const data = await res.json();
  return data.suggestions || [];
}

export async function fetchTeacherStudents(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/teacher/students`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load teacher students roster.');
  const data = await res.json();
  return data.students;
}

export async function fetchTeacherSubmissions(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/teacher/submissions`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load submissions.');
  const data = await res.json();
  return data.submissions;
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<void> {
  const res = await fetch(`${API_BASE}/teacher/submissions/${submissionId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacherGrade: grade, teacherFeedback: feedback }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to submit grade.');
}

export async function fetchAdminPrivacyRecords(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/admin/privacy-records`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load privacy records.');
  const data = await res.json();
  return data.records;
}

export async function fetchAdminAuditLogs(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/admin/audit-logs`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load audit logs.');
  const data = await res.json();
  return data.auditLogs;
}
