import tokenize
import io
from . import AnalysisStrategy


class TokenBasedPlagiarismStrategy(AnalysisStrategy):
    """
    Token-based plagiarism detection.
    
    1. Python tokenize modülü ile kodu tokenize et
    2. Whitespace, comment, encoding, newline, endmarker token'larını filtrele
    3. Token type'larından n-gram (n=3) oluştur
    4. Tüm submission çiftleri arasında Jaccard similarity hesapla
    5. En yüksek similarity score'u döndür
    """

    NGRAM_SIZE = 3
    THRESHOLD = 0.8
    # Filtrelenecek token türleri
    IGNORE_TYPES = {
        tokenize.COMMENT, tokenize.NL, tokenize.NEWLINE,
        tokenize.INDENT, tokenize.DEDENT, tokenize.ENCODING,
        tokenize.ENDMARKER,
    }

    def _tokenize_code(self, code: str) -> list[tuple]:
        """Kodu tokenize et, gereksiz token'ları filtrele."""
        tokens = []
        try:
            reader = io.StringIO(code)
            for tok in tokenize.generate_tokens(reader.readline):
                if tok.type not in self.IGNORE_TYPES:
                    # (token_type, token_string) tuple'ı sakla
                    tokens.append((tok.type, tok.string))
        except tokenize.TokenError:
            # Syntax hatası olan kod — mümkün olduğunca tokenize et
            pass
        return tokens

    def _generate_ngrams(self, tokens: list[tuple], n: int = 3) -> set[tuple]:
        """Token listesinden n-gram set'i oluştur."""
        if len(tokens) < n:
            return set()
        return {tuple(tokens[i:i + n]) for i in range(len(tokens) - n + 1)}

    def _jaccard_similarity(self, set_a: set, set_b: set) -> float:
        """İki set arasında Jaccard similarity hesapla: |A ∩ B| / |A ∪ B|"""
        if not set_a and not set_b:
            return 0.0
        intersection = set_a & set_b
        union = set_a | set_b
        return len(intersection) / len(union) if union else 0.0

    def analyze(self, submission_code: str, all_submissions: list, language: str = "python") -> float:
        """
        Submission'ı diğer tüm submission'larla karşılaştır.
        En yüksek Jaccard similarity score'unu döndür.
        
        NOT: tokenize modülü sadece Python destekler.
        Diğer diller için basit whitespace-based tokenization yapılır.
        """
        if language == "python":
            current_tokens = self._tokenize_code(submission_code)
        else:
            # Java/C için basit fallback: whitespace + punctuation split
            current_tokens = [(0, word) for word in submission_code.split() if word.strip()]

        current_ngrams = self._generate_ngrams(current_tokens, self.NGRAM_SIZE)

        if not current_ngrams:
            return 0.0

        max_similarity = 0.0

        for other_code in all_submissions:
            if other_code == submission_code:
                continue  # Kendisiyle karşılaştırma

            if language == "python":
                other_tokens = self._tokenize_code(other_code)
            else:
                other_tokens = [(0, word) for word in other_code.split() if word.strip()]

            other_ngrams = self._generate_ngrams(other_tokens, self.NGRAM_SIZE)

            if not other_ngrams:
                continue

            similarity = self._jaccard_similarity(current_ngrams, other_ngrams)
            max_similarity = max(max_similarity, similarity)

        return round(max_similarity, 4)
