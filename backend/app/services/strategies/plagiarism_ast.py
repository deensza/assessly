import ast
import hashlib
from . import AnalysisStrategy


class ASTPlagiarismStrategy(AnalysisStrategy):
    """
    AST-based structural plagiarism detection.
    
    1. ast.parse() ile kodu AST'ye çevir
    2. Tüm Name node'larındaki değişken/fonksiyon isimlerini normalize et
       (VAR_0, VAR_1, VAR_2... olarak değiştir)
    3. Normalize AST'yi ast.dump() ile string'e çevir
    4. SHA256 hash'le
    5. Diğer submission'ların hash'leriyle karşılaştır
    
    NOT: ast.parse() sadece Python destekler. Diğer dillerde 0.0 döner.
    """

    def _normalize_ast(self, code: str) -> str | None:
        """AST'yi parse et, değişken isimlerini normalize et, dump et."""
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return None

        # Değişken isimlerini toplama ve normalize etme
        name_map = {}
        counter = 0

        for node in ast.walk(tree):
            if isinstance(node, ast.Name):
                if node.id not in name_map:
                    name_map[node.id] = f"VAR_{counter}"
                    counter += 1
                node.id = name_map[node.id]
            elif isinstance(node, ast.FunctionDef):
                if node.name not in name_map:
                    name_map[node.name] = f"FUNC_{counter}"
                    counter += 1
                node.name = name_map[node.name]
            elif isinstance(node, ast.arg):
                if node.arg not in name_map:
                    name_map[node.arg] = f"ARG_{counter}"
                    counter += 1
                node.arg = name_map[node.arg]

        return ast.dump(tree)

    def _hash_ast(self, ast_dump: str) -> str:
        """AST dump'ını SHA256 hash'le."""
        return hashlib.sha256(ast_dump.encode()).hexdigest()

    def analyze(self, submission_code: str, all_submissions: list, language: str = "python") -> float:
        """
        Python kodlarının AST yapısını karşılaştır.
        
        Python dışı dillerde 0.0 döner (AST parse desteği yok).
        Tam hash eşleşmesi → 1.0, kısmi benzerlik için token-based'e güven.
        """
        if language != "python":
            return 0.0  # ast.parse() sadece Python destekler

        current_ast = self._normalize_ast(submission_code)
        if current_ast is None:
            return 0.0  # Parse edilemeyen kod

        current_hash = self._hash_ast(current_ast)
        match_count = 0
        total_compared = 0

        for other_code in all_submissions:
            if other_code == submission_code:
                continue

            other_ast = self._normalize_ast(other_code)
            if other_ast is None:
                continue

            total_compared += 1
            other_hash = self._hash_ast(other_ast)

            if current_hash == other_hash:
                match_count += 1

        if total_compared == 0:
            return 0.0

        # En az bir tam eşleşme varsa 1.0, yoksa 0.0
        # (Kısmi benzerlik token-based stratejiye bırakılır)
        return 1.0 if match_count > 0 else 0.0
