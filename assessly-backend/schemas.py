from pydantic import BaseModel
from typing import List, Optional

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

# --- TestCase Schemas ---
class TestCaseBase(BaseModel):
    input_data: str
    expected_output: str
    is_hidden: bool

class TestCaseCreate(TestCaseBase):
    pass

class TestCase(TestCaseBase):
    id: int
    assignment_id: int
    class Config:
        from_attributes = True

# --- Assignment Schemas ---
class AssignmentBase(BaseModel):
    title: str
    description: str
    weight_correctness: float = 0.4
    weight_plagiarism: float = 0.2
    weight_structural: float = 0.2
    weight_ai: float = 0.2

class AssignmentCreate(AssignmentBase):
    test_cases: List[TestCaseCreate] = []

class Assignment(AssignmentBase):
    id: int
    instructor_id: int
    test_cases: List[TestCase] = []
    class Config:
        from_attributes = True

# --- Submission Schemas ---
class SubmissionBase(BaseModel):
    code: str
    assignment_id: int

class SubmissionCreate(SubmissionBase):
    pass

class Submission(SubmissionBase):
    id: int
    student_id: int
    final_score: Optional[float] = None
    feedback: Optional[str] = None
    class Config:
        orm_mode = True
