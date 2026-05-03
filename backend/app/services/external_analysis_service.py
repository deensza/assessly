import logging
import ast
import re
import statistics
import time
from app.models import Submission, PlagiarismPair
from app import db

logger = logging.getLogger(__name__)

# =======================================================================
# INTERNAL "EXTERNAL AI SERVICE"
# This module acts as the "External AI Service" depicted in the Use Case
# diagram. It is decoupled from the main evaluator to simulate an 
# advanced, external Turnitin-style analysis engine for plagiarism and AI.
# =======================================================================

# --- Advanced Plagiarism Logic (Turnitin-style Cross-Submission Check) ---

def advanced_plagiarism_analysis(submission_code: str, method: str) -> float:
    """
    Simulates sending the code to an external service to check against a global 
    database of submissions. We find the matching assignment and run complex 
    comparisons (AST, Token Jaccard).
    """
    # 1. Simulate external processing delay
    time.sleep(0.5)

    # 2. Find the submission in the DB to know the assignment context
    # We do this because the strategy pattern from PDF strictly only passes the code string
    submission = Submission.query.filter_by(code=submission_code).order_by(Submission.submitted_at.desc()).first()
    if not submission:
        logger.warning("Could not locate submission in DB for advanced plagiarism analysis.")
        return 0.0

    assignment_id = submission.assignment_id

    # 3. Fetch other completed submissions for the same assignment
    other_submissions = Submission.query.filter(
        Submission.assignment_id == assignment_id,
        Submission.id != submission.id,
        Submission.status == 'completed'
    ).all()

    if not other_submissions:
        return 0.0

    max_score = 0.0

    # 4. Compare against all others
    for other in other_submissions:
        if method == "token":
            score = _calculate_jaccard_similarity(submission_code, other.code)
        elif method == "structural":
            score = _calculate_ast_similarity(submission_code, other.code, submission.language)
        else:
            score = 0.0
            
        max_score = max(max_score, score)

        # 5. Create a PlagiarismPair if similarity is high (Turnitin style report building)
        if score >= 0.75:
            # Check if pair already exists to avoid duplicates
            existing_pair = PlagiarismPair.query.filter(
                PlagiarismPair.assignment_id == assignment_id,
                ((PlagiarismPair.submission_a_id == submission.id) & (PlagiarismPair.submission_b_id == other.id)) |
                ((PlagiarismPair.submission_a_id == other.id) & (PlagiarismPair.submission_b_id == submission.id)),
                PlagiarismPair.method == method.capitalize()
            ).first()
            
            if not existing_pair:
                pair = PlagiarismPair(
                    assignment_id=assignment_id,
                    submission_a_id=submission.id,
                    submission_b_id=other.id,
                    similarity_score=round(score, 4),
                    method=method.capitalize()
                )
                db.session.add(pair)

    # Commit the new pairs
    db.session.commit()
    return max_score

def _calculate_jaccard_similarity(code1: str, code2: str) -> float:
    # Basic token-based n-gram similarity (Jaccard)
    tokens1 = set(code1.lower().split())
    tokens2 = set(code2.lower().split())
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union)

def _calculate_ast_similarity(code1: str, code2: str, language: str) -> float:
    if language != "python":
        return _calculate_jaccard_similarity(code1, code2)
    
    def _normalize_ast(code: str):
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return None
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
        return ast.dump(tree)

    ast1 = _normalize_ast(code1)
    ast2 = _normalize_ast(code2)
    
    if not ast1 or not ast2:
        return 0.0
    
    return 1.0 if ast1 == ast2 else 0.0


# --- Advanced AI Probability Logic ---

def advanced_ai_probability(submission_code: str) -> float:
    """
    Analyzes multiple structural and heuristic factors to determine if an AI generated this code.
    Much more accurate than simple keyword matching.
    """
    time.sleep(0.5) # Simulate API request
    
    scores = {
        'comment_ratio': (_comment_ratio_score(submission_code), 0.20),
        'naming_consistency': (_naming_consistency_score(submission_code), 0.30),
        'docstring_pattern': (_docstring_pattern_score(submission_code), 0.20),
        'structural_entropy': (_structural_entropy_score(submission_code), 0.30),
    }

    weighted_sum = sum(score * weight for score, weight in scores.values())
    total_weight = sum(weight for _, weight in scores.values())

    return round(weighted_sum / total_weight, 4) if total_weight > 0 else 0.0

def _comment_ratio_score(code: str) -> float:
    lines = code.strip().split('\n')
    if not lines: return 0.0
    comment_lines = sum(1 for line in lines if line.strip().startswith('#') or line.strip().startswith('//'))
    ratio = comment_lines / len(lines)
    if 0.15 <= ratio <= 0.35: return min(ratio / 0.25, 1.0)
    elif ratio > 0.35: return 0.8
    return ratio / 0.15

def _naming_consistency_score(code: str) -> float:
    var_pattern = r'\b([a-z_][a-z0-9_]*)\s*='
    variables = re.findall(var_pattern, code)
    if len(variables) < 3: return 0.0
    lengths = [len(v) for v in variables]
    try:
        std_dev = statistics.stdev(lengths)
    except statistics.StatisticsError:
        return 0.0
    if std_dev < 1.5: return 0.9
    elif std_dev < 3.0: return 0.5
    elif std_dev < 5.0: return 0.2
    return 0.0

def _docstring_pattern_score(code: str) -> float:
    formal_patterns = [r'Args:', r'Returns:', r'Raises:', r'Parameters:', r'Examples:']
    hits = sum(1 for p in formal_patterns if re.search(p, code))
    if hits >= 3: return 1.0
    elif hits >= 2: return 0.7
    elif hits >= 1: return 0.4
    return 0.0

def _structural_entropy_score(code: str) -> float:
    lines = [line for line in code.split('\n') if line.strip()]
    if len(lines) < 5: return 0.0
    lengths = [len(line) for line in lines]
    try:
        std_dev = statistics.stdev(lengths)
    except statistics.StatisticsError:
        return 0.0
    if std_dev < 8: return 0.9
    elif std_dev < 15: return 0.5
    elif std_dev < 25: return 0.2
    return 0.0
