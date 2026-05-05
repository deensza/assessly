# Assessly — Automated Programming Assignment Evaluation System

**Live Demo:** [https://deensza.github.io/assessly/](https://deensza.github.io/assessly/)

## Project Overview

Assessly is an automated programming assignment evaluation platform designed to assist instructors in grading programming assignments efficiently and fairly. The system evaluates student submissions automatically by executing code in a secure environment, running predefined test cases, and generating transparent grading reports. Assessly also integrates advanced analysis features such as plagiarism detection and AI-generated code probability estimation. By combining automated evaluation with intelligent analysis, the system helps maintain academic integrity while significantly reducing the manual grading workload for instructors. The platform integrates with Moodle and executes student submissions securely using Docker-based sandbox environments.

## Team Members
- Özgür Can Güngör
- İrem Şura Erkan
- Bermal Deniz Akkaya
- Berkan Mursal

## Problem Statement
In large programming courses, instructors must manually evaluate hundreds of submissions. This process is time-consuming and often lacks transparency for students. Students usually receive only a numeric score without understanding which test cases failed or where their mistakes occurred. Additionally, with the increasing use of AI tools, detecting AI-generated solutions and plagiarism has become a major challenge in programming education. Assessly addresses these issues by automating evaluation, improving feedback transparency, and supporting academic integrity.

## Tech Stack

- **Frontend:** Next.js (React) + Tailwind CSS
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
1. **Presentation Layer** — Next.js frontend with role-based dashboards
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
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   ├── instructor/
│   │   │   ├── student/
│   │   │   ├── submissions/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── TestCasesTable.tsx
│   │   │   ├── ui/
│   │   │   └── AuthProvider.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── styles/
│   └── package.json
├── docker/
│   ├── sandbox-python/Dockerfile
│   ├── sandbox-java/Dockerfile
│   └── sandbox-c/Dockerfile
└── docker-compose.yml
```

## Local Setup

### Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose (v2+)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/deensza/assessly.git
cd assessly
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set the required values:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
POSTGRES_PASSWORD=your-db-password
```

### 3. Build and start all services

```bash
docker-compose up --build
```

This command starts:
- **PostgreSQL** database on port `5432`
- **Flask backend** on port `5000`
- **Next.js frontend** on port `3000`
- **Sandbox images** (Python, Java, C) for code execution

### 4. Initialize the database

```bash
docker-compose exec backend python init_db.py
```

### 5. Access the application

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Docs (Swagger) | http://localhost:5000/docs |

### Default roles

Register a new user and select a role:
- `student` — submit code, view results
- `instructor` — create assignments, view submissions
- `admin` — configure sandbox limits, Moodle integration

### Stopping the application

```bash
docker-compose down          # stop containers
docker-compose down -v       # stop and remove database volume
```

---

## Important Notes

- Always validate and sanitize submitted code before execution
- Docker containers must have NO network access, be read-only, run as non-root user
- Use background task queue (Celery with Redis, or simple threading) for evaluation pipeline — don't block the API
- Plagiarism detection is NxN comparison — optimize with hash-based pre-filtering for large classes
- Frontend should poll submission status or use WebSocket for real-time updates
- All API endpoints (except auth) require JWT authentication
- Role-based access control: students can only see their own submissions, instructors see all for their courses

## Branching Strategy

The team follows a **feature-branch workflow**:

- `main` — stable, production-ready code. Direct pushes only for hotfixes.
- `<name>-branch` — each team member works on their own branch and opens a Pull Request to merge into `main`.

| Branch | Owner | Purpose |
|---|---|---|
| `main` | All | Stable release branch |
| `deniz-branch` | Bermal Deniz Akkaya | Frontend & merge management |
| `ozgur` | Özgür Can Güngör | Backend API & Docker pipeline |
| `berkan-branch` | Berkan Mursal | Frontend dashboards |
| `IremXErkan-patch-1` | İrem Şura Erkan | Project architecture & analysis strategies |
| `fixs-updates` | Shared | Hotfixes & minor updates |

All changes go through Pull Requests before merging into `main`.

---

## Repository Purpose
This repository demonstrates collaborative Git and GitHub workflows including:
- Branch creation
- Commit and push operations
- Pull Requests
- Peer code review
- Merge conflict resolution

Each team member contributes to this shared README file through their own branch, simulating a real-world collaborative software development workflow.

### Collaboration Update
This section was updated after merging the first pull request to simulate a merge conflict scenario

### Commit History
```
* 298892c Merge branch 'main' into berkan-branch
|\
* | e42b04f Add contribution section for Berkan
17ae9e6 Merge branch 'main' into IremXErkan-patch-1
| | *
| | |\
| | |/
| |/|
| | * f3988af Add project architecture section to README
| |/
|/|
| | * 8a1cbb7 Merge branch 'main' into ozgur
| | |\
| | |/
| |/|
| * | 68c3f29 Update README to trigger merge conflict
| * | 89e3f20 Merge pull request #1 from deensza/deniz-branch
|/| |
| * | 8ff6fa6 Add project summary to README
|/ /
| * f69e973 ozgur: README katkısı eklendi
|/
* 9436690 Initial commit
```

## Jira Project Management
The Jira project for Assessly was created using a Scrum-based approach to effectively manage the product backlog and sprint planning process. The product backlog was derived from the defined user stories based on the system’s main actors: students, instructors, and administrators.

The backlog was prioritised according to the system’s core functionalities. High-priority items include assignment management, secure code execution, and automated test case evaluation. These features are essential for building the minimum viable product (MVP) of the system.

Sprint 1, titled "Core Evaluation Workflow", was created to implement the fundamental workflow of the platform. The selected user stories for this sprint include assignment creation, submission upload, secure code execution, test case definition, automated evaluation, and displaying results to the user.

Due to the use of a team-managed Jira project, labels were used instead of Epics to logically group related user stories. Labels such as "assignment-management", "secure-execution", "automated-evaluation", and "feedback" were assigned to represent different functional modules of the system.

This sprint establishes the core structure of Assessly and ensures that the system can operate end-to-end before introducing advanced features such as plagiarism detection, AI-based analysis, and Moodle integration in future iterations.