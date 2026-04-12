# Assessly — Automated Programming Assignment Evaluation System

## Project Overview

Build a full-stack web application called "Assessly" — an automated programming assignment evaluation platform for universities. The system allows instructors to create programming assignments with test cases, students to submit code solutions, and the platform to automatically evaluate submissions inside secure Docker sandboxes, detect plagiarism, estimate AI-generated code probability, and provide detailed feedback with transparent grading.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Flask (Python) REST API
- **Database:** PostgreSQL
- **Code Execution:** Docker containers (sandbox)
- **Auth:** JWT-based authentication
- **ORM:** SQLAlchemy

## Database Schema

### Users
- id (PK), name, email, password_hash, role (enum: student/instructor/admin), created_at

### Courses
- id (PK), title, description, instructor_id (FK → Users), created_at

### CourseEnrollments
- id (PK), course_id (FK), student_id (FK), enrolled_at

### Assignments
- id (PK), course_id (FK), title, description, due_date, supported_languages (JSON array: ["python", "java", "c"]), time_limit_seconds (default 10), memory_limit_mb (default 256), created_at

### TestCases
- id (PK), assignment_id (FK), input (text), expected_output (text), is_hidden (boolean), weight (float, default 1.0)

### Submissions
- id (PK), assignment_id (FK), student_id (FK), code (text), language (string), status (enum: pending/running/completed/error), final_score (float), plagiarism_score (float), ai_probability (float), flagged (boolean), submitted_at

### TestResults
- id (PK), submission_id (FK), test_case_id (FK), actual_output (text), passed (boolean), execution_time_ms (int), memory_usage_kb (int)

### PlagiarismPairs
- id (PK), assignment_id (FK), submission_a_id (FK), submission_b_id (FK), similarity_score (float), method (string)

## Architecture & Design Pattern

Use **Layered Architecture** with clear separation:
1. **Presentation Layer** — React frontend with role-based dashboards
2. **Business Logic Layer** — Flask API with service classes
3. **Data & Infrastructure Layer** — PostgreSQL, Docker sandbox

Use the **Strategy Pattern** for submission analysis:

```python
from abc import ABC, abstractmethod

class AnalysisStrategy(ABC):
    @abstractmethod
    def analyze(self, submission_code: str, all_submissions: list) -> float:
        pass

class TokenBasedPlagiarismStrategy(AnalysisStrategy):
    """Tokenize code, compare token sequences using Jaccard similarity"""
    pass

class ASTStructuralStrategy(AnalysisStrategy):
    """Parse AST, normalize variable names, compare tree structures"""
    pass

class AIProbabilityStrategy(AnalysisStrategy):
    """Heuristic-based: comment ratio, naming patterns, structural indicators"""
    pass

class SubmissionAnalyzer:
    def __init__(self):
        self.strategies: list[AnalysisStrategy] = []

    def add_strategy(self, strategy: AnalysisStrategy):
        self.strategies.append(strategy)

    def analyze(self, submission_code: str, all_submissions: list) -> dict:
        return {s.__class__.__name__: s.analyze(submission_code, all_submissions) for s in self.strategies}
```

## API Endpoints

### Auth
- POST /api/auth/register — {name, email, password, role}
- POST /api/auth/login — {email, password} → JWT token
- GET /api/auth/me — current user info

### Courses
- POST /api/courses — instructor creates course
- GET /api/courses — list courses (filtered by role)
- POST /api/courses/:id/enroll — student enrolls

### Assignments
- POST /api/assignments — create assignment with test cases
- GET /api/assignments/:id — get assignment details
- GET /api/courses/:id/assignments — list assignments for course

### Submissions
- POST /api/submissions — {assignment_id, code, language} → triggers evaluation pipeline
- GET /api/submissions/:id — get submission with results
- GET /api/assignments/:id/submissions — instructor views all submissions
- GET /api/assignments/:id/submissions/flagged — instructor views flagged only

### Admin
- GET /api/admin/sandbox/config — current sandbox settings
- PUT /api/admin/sandbox/config — update limits
- POST /api/admin/moodle/test — test Moodle connection
- PUT /api/admin/moodle/config — save Moodle settings

## Core Features — Implementation Details

### 1. Secure Code Execution Engine

When a submission arrives:
1. Save code to a temp file
2. Spin up a Docker container from a pre-built image (with Python/Java/C compilers)
3. Run with strict limits: `--network=none --memory={limit}m --cpus=0.5 --read-only`
4. For each test case: pipe input via stdin, capture stdout/stderr, measure time
5. Compare actual output (stripped/trimmed) with expected output
6. Kill container after timeout, clean up

Use `docker-py` (Docker SDK for Python):

```python
import docker
client = docker.from_env()

container = client.containers.run(
    image=f"assessly-sandbox-{language}",
    command=f"timeout {time_limit} python solution.py",
    stdin_open=True,
    mem_limit=f"{memory_limit}m",
    network_disabled=True,
    read_only=True,
    remove=True,
    detach=True
)
```

### 2. Automated Test Case Evaluation

After sandbox execution, for each test case:
- Compare `actual_output.strip() == expected_output.strip()`
- Record pass/fail, execution_time_ms, memory_usage_kb in TestResults table
- Calculate correctness score: `sum(passed * weight) / sum(weight) * 100`

### 3. Plagiarism Detection

Two strategies applied to all submission pairs within an assignment:

**Token-based:** Tokenize code (Python `tokenize` module), remove whitespace/comments, compute Jaccard similarity of token n-grams (n=3 or 4). Flag pairs above 0.8 threshold.

**AST-based:** Parse code into AST (`ast.parse()`), normalize (replace all variable names with generic placeholders), serialize tree structure, compare using tree edit distance or hash comparison.

Store flagged pairs in PlagiarismPairs table. Run as background task after submission deadline or on-demand by instructor.

### 4. AI-Generated Code Detection

Heuristic scoring based on:
- Unusual comment-to-code ratio (AI tends to over-comment)
- Consistent variable naming style (AI is very consistent)
- Presence of specific phrases in comments ("efficient", "optimal", "time complexity")
- Code structure entropy (AI code tends to be more uniform)
- Docstring patterns

Each indicator contributes a sub-score; weighted average produces final ai_probability (0.0–1.0).

### 5. Smart Grading & Feedback

Final score formula:
```
final_score = (correctness * 0.60) + (efficiency_score * 0.15) + ((1 - plagiarism_score) * 0.15) + ((1 - ai_probability) * 0.10)
```

Feedback JSON returned to student:
```json
{
  "final_score": 85.5,
  "correctness": {"passed": 8, "total": 10, "details": [...]},
  "performance": {"avg_time_ms": 45, "avg_memory_kb": 12000},
  "plagiarism": {"score": 0.12, "flagged": false},
  "ai_analysis": {"probability": 0.25, "flagged": false},
  "feedback_text": "8/10 test cases passed. Test case #3 failed: expected '15' but got '14'. Consider edge cases with negative numbers."
}
```

### 6. Moodle LMS Integration

Use Moodle REST API (`/webservice/rest/server.php`) with token auth:
- Sync assignments: `mod_assign_get_assignments`
- Push grades: `mod_assign_save_grade`
- Pull submissions: `mod_assign_get_submissions`

Admin configures API URL + token in admin panel. Backend validates connection before saving.

## Frontend Pages

### Student Dashboard
- My Courses list
- Assignment list with due dates and status
- Code editor (use Monaco Editor or CodeMirror) with language selector
- Submit button → shows loading → displays evaluation results
- Results page: test case pass/fail table, score breakdown, feedback

### Instructor Dashboard
- Course management (create/edit courses)
- Assignment creation form with dynamic test case rows (input/output pairs, hidden toggle, weight)
- Submissions overview table (student, score, plagiarism flag, AI flag, timestamp)
- Flagged submissions view with detailed analysis
- Grade sync button (Moodle)

### Admin Panel
- Sandbox configuration (time limit, memory limit, allowed languages)
- Moodle integration settings (API URL, token, test connection button)
- System monitoring (active containers, recent errors)

## Evaluation Pipeline Flow

```
Student clicks Submit
    → POST /api/submissions
    → Backend saves submission (status: pending)
    → Background worker picks up:
        1. Create Docker container
        2. Run code against each test case
        3. Record TestResults
        4. Run plagiarism strategies (compare with existing submissions for same assignment)
        5. Run AI probability strategy
        6. Calculate final_score
        7. Update submission (status: completed)
        8. If Moodle enabled: push grade
    → Student polls or gets WebSocket update
    → Results displayed
```

## Project Structure

```
assessly/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── courses.py
│   │   │   ├── assignments.py
│   │   │   ├── submissions.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── sandbox.py       # Docker execution
│   │   │   ├── evaluator.py     # Test case evaluation
│   │   │   ├── analyzer.py      # SubmissionAnalyzer (Strategy Pattern)
│   │   │   ├── strategies/
│   │   │   │   ├── plagiarism_token.py
│   │   │   │   ├── plagiarism_ast.py
│   │   │   │   └── ai_probability.py
│   │   │   ├── grader.py        # Final score calculation
│   │   │   └── moodle.py        # Moodle API integration
│   │   └── utils/
│   │       ├── auth.py          # JWT helpers
│   │       └── docker_images/   # Dockerfiles for each language
│   ├── requirements.txt
│   └── config.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── InstructorDashboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── AssignmentView.jsx
│   │   │   ├── SubmissionResults.jsx
│   │   │   └── Login.jsx
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── TestCaseForm.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   └── ScoreBreakdown.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
├── docker/
│   ├── sandbox-python/Dockerfile
│   ├── sandbox-java/Dockerfile
│   └── sandbox-c/Dockerfile
└── docker-compose.yml
```

## Important Notes

- Always validate and sanitize submitted code before execution
- Docker containers must have NO network access, be read-only, run as non-root user
- Use background task queue (Celery with Redis, or simple threading) for evaluation pipeline — don't block the API
- Plagiarism detection is NxN comparison — optimize with hash-based pre-filtering for large classes
- Frontend should poll submission status or use WebSocket for real-time updates
- All API endpoints (except auth) require JWT authentication
- Role-based access control: students can only see their own submissions, instructors see all for their courses