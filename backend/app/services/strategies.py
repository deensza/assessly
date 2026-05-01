import re
import ast
import math
from abc import ABC, abstractmethod
from collections import Counter


# ==========================================
# 1. Strategy Interface
# ==========================================
class AnalysisStrategy(ABC):
    @abstractmethod
    def analyze(self, submission: str) -> float:
        pass


# ==========================================
# 2. Token-Based Plagiarism Strategy
# Measures code genericness as a proxy for
# copy-paste likelihood (single-submission).
# Score: 0.0 = highly original, 1.0 = very generic/boilerplate
# ==========================================
class TokenBasedPlagiarismStrategy(AnalysisStrategy):

    # One-letter vars and common "filler" names that appear heavily in copied templates
    GENERIC_NAMES = frozenset({
        'a', 'b', 'c', 'd', 'i', 'j', 'k', 'l', 'm', 'n', 'p', 'q',
        'x', 'y', 'z', 's', 'r', 'v', 'w',
        'temp', 'result', 'ans', 'val', 'arr', 'lst',
        'num', 'res', 'ret', 'cur', 'prev', 'node', 'item',
        'data', 'count', 'total', 'output', 'flag', 'idx',
    })

    def analyze(self, submission: str) -> float:
        if not submission or not submission.strip():
            return 0.0

        identifiers = re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b', submission)
        if not identifiers:
            return 0.0

        ids_lower = [t.lower() for t in identifiers]
        total = len(ids_lower)
        unique = len(set(ids_lower))

        # Low unique/total ratio → lots of repetition → suspicious
        diversity_score = 1.0 - (unique / total)

        # High fraction of generic single-letter or filler names → suspicious
        generic_count = sum(1 for t in ids_lower if t in self.GENERIC_NAMES)
        generic_ratio = generic_count / total

        # Repeated adjacent identifier pairs indicate copy-paste blocks
        bigrams = list(zip(ids_lower, ids_lower[1:]))
        bigram_counts = Counter(bigrams)
        repeated = sum(c - 1 for c in bigram_counts.values() if c > 1)
        repetition_score = min(repeated / max(len(bigrams), 1), 1.0)

        score = (diversity_score * 0.45) + (generic_ratio * 0.40) + (repetition_score * 0.15)
        return round(min(1.0, max(0.0, score)), 4)


# ==========================================
# 3. Structural Analysis Strategy
# Real AST analysis for Python;
# heuristic keyword fallback for Java/C.
# Score: 0.0 = flat/trivial, 1.0 = rich structure
# Used as code-quality/efficiency proxy in grader.
# ==========================================
class StructuralStrategy(AnalysisStrategy):

    def analyze(self, submission: str) -> float:
        if not submission or not submission.strip():
            return 0.0
        try:
            return self._ast_analysis(submission)
        except SyntaxError:
            return self._heuristic_analysis(submission)

    def _ast_analysis(self, code: str) -> float:
        tree = ast.parse(code)

        node_types = set()
        max_depth = [0]
        function_count = [0]
        loop_count = [0]
        condition_count = [0]
        total_nodes = [0]

        class Visitor(ast.NodeVisitor):
            def __init__(self):
                self.depth = 0

            def generic_visit(self, node):
                total_nodes[0] += 1
                node_types.add(type(node).__name__)
                self.depth += 1
                if self.depth > max_depth[0]:
                    max_depth[0] = self.depth
                super().generic_visit(node)
                self.depth -= 1

            def visit_FunctionDef(self, node):
                function_count[0] += 1
                self.generic_visit(node)

            def visit_AsyncFunctionDef(self, node):
                function_count[0] += 1
                self.generic_visit(node)

            def visit_For(self, node):
                loop_count[0] += 1
                self.generic_visit(node)

            def visit_While(self, node):
                loop_count[0] += 1
                self.generic_visit(node)

            def visit_If(self, node):
                condition_count[0] += 1
                self.generic_visit(node)

        Visitor().visit(tree)

        if total_nodes[0] == 0:
            return 0.0

        # Normalize each dimension to 0-1 then combine
        type_diversity = min(len(node_types) / 20, 1.0)       # 20+ AST node types = full
        depth_score = min(max_depth[0] / 10, 1.0)             # nesting depth 10+ = full
        function_score = min(function_count[0] / 3, 1.0)      # 3+ functions = full
        complexity_score = min((loop_count[0] + condition_count[0]) / 5, 1.0)

        score = (type_diversity * 0.35 + depth_score * 0.25
                 + function_score * 0.25 + complexity_score * 0.15)
        return round(min(1.0, max(0.0, score)), 4)

    def _heuristic_analysis(self, code: str) -> float:
        """Fallback for non-Python (Java/C): keyword and indentation heuristics."""
        lines = [l for l in code.split('\n') if l.strip()]
        if not lines:
            return 0.0

        structural_keywords = [
            'for', 'while', 'if', 'else', 'switch', 'case',
            'def ', 'class ', 'void ', 'int ', 'return',
            'function', 'public', 'private',
        ]
        kw_count = sum(
            sum(1 for kw in structural_keywords if kw in line)
            for line in lines
        )
        max_indent = max((len(l) - len(l.lstrip())) for l in lines)
        depth = max_indent / 4

        kw_score = min(kw_count / 10, 1.0)
        depth_score = min(depth / 5, 1.0)
        size_score = min(len(lines) / 30, 1.0)

        return round(kw_score * 0.4 + depth_score * 0.3 + size_score * 0.3, 4)


# ==========================================
# 4. AI Probability Strategy
# Estimates likelihood that code was AI-generated
# via five independent heuristic signals.
# Score: 0.0 = likely human-written, 1.0 = likely AI-generated
# ==========================================
class AIProbabilityStrategy(AnalysisStrategy):

    AI_COMMENT_PHRASES = frozenset({
        'this function', 'this method', 'this code', 'the following',
        'initialize', 'iterate', 'implementation', 'returns the',
        'calculates', 'performs', 'efficiently', 'approach',
        'step 1', 'step 2', 'step 3', 'first,', 'then,', 'finally,',
        'note that', 'we can', 'we use', 'in order to',
    })

    def analyze(self, submission: str) -> float:
        if not submission or not submission.strip():
            return 0.0

        lines = submission.split('\n')
        non_empty = [l for l in lines if l.strip()]
        if not non_empty:
            return 0.0

        signals = []

        # Signal 1: Comment density — AI over-comments relative to student code
        comment_lines = sum(
            1 for l in non_empty
            if l.strip().startswith('#')
            or l.strip().startswith('//')
            or '"""' in l or "'''" in l
        )
        comment_ratio = comment_lines / len(non_empty)
        # >30 % comment lines is unusual for a student; cap contribution at 1.0
        comment_signal = min(max(comment_ratio - 0.15, 0.0) / 0.35, 1.0)
        signals.append((comment_signal, 0.25))

        # Signal 2: AI-sounding explanatory phrases inside comments
        code_lower = submission.lower()
        phrase_hits = sum(1 for phrase in self.AI_COMMENT_PHRASES if phrase in code_lower)
        signals.append((min(phrase_hits / 5, 1.0), 0.25))

        # Signal 3: Naming consistency — AI never mixes snake_case and camelCase
        identifiers = re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]{2,})\b', submission)
        identifiers = [id_ for id_ in identifiers if not id_.isupper()]
        if identifiers:
            snake = sum(1 for id_ in identifiers if '_' in id_ and id_.islower())
            camel = sum(1 for id_ in identifiers if re.match(r'^[a-z][a-zA-Z0-9]+$', id_))
            consistency = max(snake, camel) / len(identifiers)
            naming_signal = max(0.0, (consistency - 0.6) / 0.4) if consistency > 0.6 else 0.0
        else:
            naming_signal = 0.0
        signals.append((naming_signal, 0.20))

        # Signal 4: Docstring presence — AI almost always generates them
        has_docstring = '"""' in submission or "'''" in submission
        signals.append((0.65 if has_docstring else 0.0, 0.18))

        # Signal 5: Line-length uniformity — AI wraps lines very consistently
        code_lines = [
            l for l in non_empty
            if not l.strip().startswith('#') and not l.strip().startswith('//')
        ]
        if len(code_lines) > 4:
            lengths = [len(l) for l in code_lines]
            mean = sum(lengths) / len(lengths)
            if mean > 0:
                std = math.sqrt(sum((x - mean) ** 2 for x in lengths) / len(lengths))
                cv = std / mean
                # CV < 0.35 → suspiciously uniform line lengths
                uniformity_signal = max(0.0, 1.0 - cv / 0.35) if cv < 0.35 else 0.0
            else:
                uniformity_signal = 0.0
        else:
            uniformity_signal = 0.0
        signals.append((uniformity_signal, 0.12))

        ai_prob = sum(s * w for s, w in signals)
        return round(min(1.0, max(0.0, ai_prob)), 4)


# ==========================================
# 5. Context Class (Strategy Pattern)
# ==========================================
class SubmissionAnalyzer:
    def __init__(self):
        self.strategy = None

    def set_strategy(self, strategy: AnalysisStrategy):
        self.strategy = strategy

    def analyze_submission(self, submission: str) -> float:
        if self.strategy is None:
            return 0.0
        return self.strategy.analyze(submission)
