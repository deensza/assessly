from abc import ABC, abstractmethod

class AnalysisStrategy(ABC):
    """Tüm analiz stratejilerinin uygulaması gereken soyut arayüz."""
    
    @abstractmethod
    def analyze(self, submission_code: str, all_submissions: list, language: str = "python") -> float:
        """
        Analiz yap ve 0.0-1.0 arası skor döndür.
        
        Args:
            submission_code: Analiz edilecek kod
            all_submissions: Aynı assignment'taki diğer submission'ların kodları
            language: Programlama dili ("python", "java", "c")
        
        Returns:
            float: 0.0 (temiz) - 1.0 (şüpheli) arası skor
        """
        pass


from .plagiarism_token import TokenBasedPlagiarismStrategy
from .plagiarism_ast import ASTPlagiarismStrategy
from .ai_probability import AIProbabilityStrategy

__all__ = [
    'AnalysisStrategy',
    'TokenBasedPlagiarismStrategy',
    'ASTPlagiarismStrategy',
    'AIProbabilityStrategy',
]
