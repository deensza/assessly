import enum
from datetime import datetime, timezone

from app import db


class UserRole(enum.Enum):
    student = 'student'
    instructor = 'instructor'
    admin = 'admin'


class SubmissionStatus(enum.Enum):
    pending = 'pending'
    running = 'running'
    completed = 'completed'
    error = 'error'


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.student)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    taught_courses = db.relationship('Course', backref='instructor', lazy='dynamic')
    enrollments = db.relationship('CourseEnrollment', backref='student', lazy='dynamic')
    submissions = db.relationship('Submission', backref='student', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role.value,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    enrollments = db.relationship('CourseEnrollment', backref='course', lazy='dynamic', cascade='all, delete-orphan')
    assignments = db.relationship('Assignment', backref='course', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_instructor=False):
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'instructor_id': self.instructor_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_instructor:
            data['instructor'] = self.instructor.to_dict()
        return data


class CourseEnrollment(db.Model):
    __tablename__ = 'course_enrollments'

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('course_id', 'student_id', name='uq_course_student'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'course_id': self.course_id,
            'student_id': self.student_id,
            'enrolled_at': self.enrolled_at.isoformat() if self.enrolled_at else None
        }


class Assignment(db.Model):
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    supported_languages = db.Column(db.JSON, default=lambda: ['python', 'java', 'c'])
    time_limit_seconds = db.Column(db.Integer, default=10)
    memory_limit_mb = db.Column(db.Integer, default=256)
    weight_correctness = db.Column(db.Float, default=0.4)
    weight_plagiarism = db.Column(db.Float, default=0.2)
    weight_structural = db.Column(db.Float, default=0.2)
    weight_ai = db.Column(db.Float, default=0.2)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    test_cases = db.relationship('TestCase', backref='assignment', lazy='dynamic', cascade='all, delete-orphan')
    submissions = db.relationship('Submission', backref='assignment', lazy='dynamic', cascade='all, delete-orphan')
    plagiarism_pairs = db.relationship('PlagiarismPair', backref='assignment', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_test_cases=False, hide_hidden=True):
        data = {
            'id': self.id,
            'course_id': self.course_id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'supported_languages': self.supported_languages,
            'time_limit_seconds': self.time_limit_seconds,
            'memory_limit_mb': self.memory_limit_mb,
            'weight_correctness': self.weight_correctness,
            'weight_plagiarism': self.weight_plagiarism,
            'weight_structural': self.weight_structural,
            'weight_ai': self.weight_ai,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_test_cases:
            cases = self.test_cases.all()
            if hide_hidden:
                cases = [tc for tc in cases if not tc.is_hidden]
            data['test_cases'] = [tc.to_dict() for tc in cases]
        return data


class TestCase(db.Model):
    __tablename__ = 'test_cases'

    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=False)
    input = db.Column(db.Text, nullable=False)
    expected_output = db.Column(db.Text, nullable=False)
    is_hidden = db.Column(db.Boolean, default=False)
    weight = db.Column(db.Float, default=1.0)

    def to_dict(self):
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'input': self.input,
            'expected_output': self.expected_output,
            'is_hidden': self.is_hidden,
            'weight': self.weight
        }


class Submission(db.Model):
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    code = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(20), nullable=False)
    status = db.Column(db.Enum(SubmissionStatus), default=SubmissionStatus.pending)
    score_correctness = db.Column(db.Float, nullable=True)
    score_structural = db.Column(db.Float, nullable=True)
    final_score = db.Column(db.Float, nullable=True)
    plagiarism_score = db.Column(db.Float, nullable=True, default=0.0)
    ai_probability = db.Column(db.Float, nullable=True, default=0.0)
    flagged = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    test_results = db.relationship('TestResult', backref='submission', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_results=False):
        data = {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'student_id': self.student_id,
            'code': self.code,
            'language': self.language,
            'status': self.status.value,
            'score_correctness': self.score_correctness,
            'score_structural': self.score_structural,
            'final_score': self.final_score,
            'plagiarism_score': self.plagiarism_score,
            'ai_probability': self.ai_probability,
            'flagged': self.flagged,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None
        }
        if include_results:
            data['test_results'] = [tr.to_dict() for tr in self.test_results.all()]
        return data


class TestResult(db.Model):
    __tablename__ = 'test_results'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id'), nullable=False)
    test_case_id = db.Column(db.Integer, db.ForeignKey('test_cases.id'), nullable=False)
    actual_output = db.Column(db.Text, nullable=True)
    passed = db.Column(db.Boolean, default=False)
    execution_time_ms = db.Column(db.Integer, nullable=True)
    memory_usage_kb = db.Column(db.Integer, nullable=True)

    # Relationship to test case
    test_case = db.relationship('TestCase', backref='results')

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'test_case_id': self.test_case_id,
            'actual_output': self.actual_output,
            'passed': self.passed,
            'execution_time_ms': self.execution_time_ms,
            'memory_usage_kb': self.memory_usage_kb
        }


class PlagiarismPair(db.Model):
    __tablename__ = 'plagiarism_pairs'

    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=False)
    submission_a_id = db.Column(db.Integer, db.ForeignKey('submissions.id'), nullable=False)
    submission_b_id = db.Column(db.Integer, db.ForeignKey('submissions.id'), nullable=False)
    similarity_score = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(50), nullable=False)

    # Relationships
    submission_a = db.relationship('Submission', foreign_keys=[submission_a_id], backref='plagiarism_as_a')
    submission_b = db.relationship('Submission', foreign_keys=[submission_b_id], backref='plagiarism_as_b')

    def to_dict(self):
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'submission_a_id': self.submission_a_id,
            'submission_b_id': self.submission_b_id,
            'similarity_score': self.similarity_score,
            'method': self.method
        }
