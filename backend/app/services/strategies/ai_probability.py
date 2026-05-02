import re
import statistics
from . import AnalysisStrategy


class AIProbabilityStrategy(AnalysisStrategy):
    """
    Heuristic-based AI-generated code detection.
    
    5 gösterge ile ağırlıklı puanlama:
    1. Comment-to-code ratio (0.15) — AI aşırı comment yapar
    2. Değişken isimlendirme tutarlılığı (0.25) — AI çok tutarlıdır
    3. AI-tipik kelimeler (0.25) — "efficient", "optimal" vb.
    4. Docstring pattern (0.15) — Google/NumPy tarzı formal docstring
    5. Yapısal entropy (0.20) — AI kodu daha uniform satır uzunluğuna sahip
    """

    # AI'ın sıkça kullandığı kelimeler
    AI_KEYWORDS = [
        "efficient", "optimal", "complexity", "implementation",
        "approach", "straightforward", "initialize", "iterate",
        "traverse", "comprehensive", "robust", "handle edge",
        "time complexity", "space complexity", "elegantly",
    ]

    def _comment_ratio_score(self, code: str) -> float:
        """Comment-to-code oranı. AI genellikle %15-30 arası comment koyar."""
        lines = code.strip().split('\n')
        if not lines:
            return 0.0

        comment_lines = sum(1 for line in lines if line.strip().startswith('#'))
        ratio = comment_lines / len(lines)

        # %15-30 arası yüksek AI olasılığı
        if 0.15 <= ratio <= 0.35:
            return min(ratio / 0.25, 1.0)
        elif ratio > 0.35:
            return 0.8  # Aşırı comment de şüpheli
        return ratio / 0.15  # Düşük comment oranı → düşük skor

    def _naming_consistency_score(self, code: str) -> float:
        """Değişken isimlendirme tutarlılığı. AI çok tutarlı isim verir."""
        # Basit regex ile değişken isimlerini bul
        var_pattern = r'\b([a-z_][a-z0-9_]*)\s*='
        variables = re.findall(var_pattern, code)

        if len(variables) < 3:
            return 0.0

        # İsim uzunluklarının standart sapması
        lengths = [len(v) for v in variables]
        try:
            std_dev = statistics.stdev(lengths)
        except statistics.StatisticsError:
            return 0.0

        # Düşük std dev → çok tutarlı → yüksek AI olasılığı
        if std_dev < 1.5:
            return 0.9
        elif std_dev < 3.0:
            return 0.5
        elif std_dev < 5.0:
            return 0.2
        return 0.0

    def _ai_keywords_score(self, code: str) -> float:
        """AI-tipik kelimelerin comment ve docstring'lerde varlığı."""
        code_lower = code.lower()
        hits = sum(1 for kw in self.AI_KEYWORDS if kw in code_lower)
        # Normalize: 4+ hit → 1.0
        return min(hits / 4.0, 1.0)

    def _docstring_pattern_score(self, code: str) -> float:
        """Google/NumPy tarzı formal docstring varlığı."""
        # Args:, Returns:, Raises:, Parameters:, Examples: pattern'leri
        formal_patterns = [
            r'Args:', r'Returns:', r'Raises:', r'Parameters:',
            r'Examples:', r'Attributes:', r'Note:', r'Yields:',
        ]
        hits = sum(1 for p in formal_patterns if re.search(p, code))

        if hits >= 3:
            return 1.0
        elif hits >= 2:
            return 0.7
        elif hits >= 1:
            return 0.4
        return 0.0

    def _structural_entropy_score(self, code: str) -> float:
        """Satır uzunluklarının entropy'si. AI daha uniform kod yazar."""
        lines = [line for line in code.split('\n') if line.strip()]
        if len(lines) < 5:
            return 0.0

        lengths = [len(line) for line in lines]
        try:
            std_dev = statistics.stdev(lengths)
        except statistics.StatisticsError:
            return 0.0

        # Düşük std dev → uniform → yüksek AI olasılığı
        if std_dev < 8:
            return 0.9
        elif std_dev < 15:
            return 0.5
        elif std_dev < 25:
            return 0.2
        return 0.0

    def analyze(self, submission_code: str, all_submissions: list, language: str = "python") -> float:
        """
        5 heuristic göstergenin ağırlıklı ortalamasını hesapla.
        Dil bağımsız çalışır (tüm dillerde uygulanabilir).
        """
        scores = {
            'comment_ratio': (self._comment_ratio_score(submission_code), 0.15),
            'naming_consistency': (self._naming_consistency_score(submission_code), 0.25),
            'ai_keywords': (self._ai_keywords_score(submission_code), 0.25),
            'docstring_pattern': (self._docstring_pattern_score(submission_code), 0.15),
            'structural_entropy': (self._structural_entropy_score(submission_code), 0.20),
        }

        weighted_sum = sum(score * weight for score, weight in scores.values())
        total_weight = sum(weight for _, weight in scores.values())

        return round(weighted_sum / total_weight, 4) if total_weight > 0 else 0.0
