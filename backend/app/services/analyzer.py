# ==========================================
# Strategy Pattern Example
# Assessly Submission Analysis System
# ==========================================
from abc import ABC, abstractmethod

# ==========================================
# 1. Strategy Interface
# All analysis algorithms must implement this
# ==========================================
class AnalysisStrategy(ABC):
    @abstractmethod
    def analyze(self, submission: str) -> float:
        pass

# ==========================================
# 2. Concrete Strategy 1
# Token-based plagiarism detection
# ==========================================
class TokenBasedPlagiarismStrategy(AnalysisStrategy):
    def analyze(self, submission: str) -> float:
        from app.services.external_analysis_service import advanced_plagiarism_analysis
        score = advanced_plagiarism_analysis(submission, method="token")
        print("Token plagiarism analysis score (External AI):", round(score, 2))
        return score

# ==========================================
# 3. Concrete Strategy 2
# Structural analysis (simulated AST idea)
# ==========================================
class StructuralStrategy(AnalysisStrategy):
    def analyze(self, submission: str) -> float:
        from app.services.external_analysis_service import advanced_plagiarism_analysis
        score = advanced_plagiarism_analysis(submission, method="structural")
        print("Structural analysis score (External AI):", round(score, 2))
        return score

# ==========================================
# 4. Concrete Strategy 3
# AI probability estimation
# ==========================================
class AIProbabilityStrategy(AnalysisStrategy):
    def analyze(self, submission: str) -> float:
        from app.services.external_analysis_service import advanced_ai_probability
        score = advanced_ai_probability(submission)
        print("AI probability score (External AI):", round(score, 2))
        return score

# ==========================================
# 5. Context Class
# This class uses a strategy object
# ==========================================
class SubmissionAnalyzer:
    def __init__(self):
        self.strategy = None

    def set_strategy(self, strategy: AnalysisStrategy):
        self.strategy = strategy

    def analyze_submission(self, submission: str):
        if self.strategy is None:
            print("No analysis strategy selected.")
            return
        return self.strategy.analyze(submission)

# ==========================================
# 6. Client Code
# Demonstrates switching strategies
# ==========================================
if __name__ == "__main__":
    student_code = """
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr)//2
    return merge(merge_sort(arr[:mid]), merge_sort(arr[mid:]))
"""
    analyzer = SubmissionAnalyzer()
    
    # Strategy 1
    analyzer.set_strategy(TokenBasedPlagiarismStrategy())
    s1 = analyzer.analyze_submission(student_code)
    
    # Strategy 2
    analyzer.set_strategy(StructuralStrategy())
    s2 = analyzer.analyze_submission(student_code)
    
    # Strategy 3
    analyzer.set_strategy(AIProbabilityStrategy())
    s3 = analyzer.analyze_submission(student_code)
    
    print("\nFinal Scores")
    print("Plagiarism:", s1)
    print("Structural:", s2)
    print("AI Probability:", s3)
