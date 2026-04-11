from abc import ABC, abstractmethod

# ==========================================
# 1. Strategy Interface
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
        tokens = submission.lower().split()
        score = min(len(tokens) / 50, 1.0)
        print("Token plagiarism analysis score:", round(score, 2))
        return score

# ==========================================
# 3. Concrete Strategy 2
# Structural analysis (simulated AST idea)
# ==========================================
class StructuralStrategy(AnalysisStrategy):
    def analyze(self, submission: str) -> float:
        keywords = ["for", "while", "def", "if", "return"]
        count = sum(submission.count(k) for k in keywords)
        score = min(count / 10, 1.0)
        print("Structural analysis score:", round(score, 2))
        return score

# ==========================================
# 4. Concrete Strategy 3
# AI probability estimation
# ==========================================
class AIProbabilityStrategy(AnalysisStrategy):
    def analyze(self, submission: str) -> float:
        indicators = ["efficient", "complexity", "algorithm", "solution"]
        hits = sum(1 for w in indicators if w in submission.lower())
        score = min(hits / len(indicators), 1.0)
        print("AI probability score:", round(score, 2))
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
            return None
        return self.strategy.analyze(submission)
