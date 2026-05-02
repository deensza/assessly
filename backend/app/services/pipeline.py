"""
Pipeline Service — Orchestrates the full evaluation pipeline.

Submit → Sandbox → Evaluate → Analyze → Grade → Store

Runs in a background thread so the API returns immediately.
"""

import threading
import logging

from app.models import Submission, db
from app.services.evaluator import evaluator_service
from app.services.grader import grader_service

logger = logging.getLogger(__name__)


def run_evaluation_pipeline(app, submission_id: int):
    """
    Run the full evaluation pipeline for a submission.
    Designed to run in a background thread.

    Steps:
        1. Evaluate — run test cases through sandbox
        2. Analyze — plagiarism & AI detection (Phase 4, placeholder for now)
        3. Grade — calculate final score and generate feedback
    """
    logger.info(f"Pipeline started for submission {submission_id}")

    try:
        # Step 1: Evaluate (sandbox execution + test case comparison)
        eval_result = evaluator_service.evaluate(submission_id, app=app)

        if eval_result.get('error'):
            logger.error(f"Evaluation failed for submission {submission_id}: {eval_result['error']}")
            return

        correctness_score = eval_result['correctness_score']
        
        # Update submission with correctness score
        with app.app_context():
            submission = Submission.query.get(submission_id)
            submission.score_correctness = correctness_score

        # Step 2: Analyze
        from app.services.strategies import (
            TokenBasedPlagiarismStrategy,
            ASTPlagiarismStrategy,
            AIProbabilityStrategy,
        )
        from app.models import PlagiarismPair
        
        with app.app_context():
            submission = Submission.query.get(submission_id)
            code = submission.code
            language = submission.language

            other_submissions = Submission.query.filter(
                Submission.assignment_id == submission.assignment_id,
                Submission.id != submission.id,
                Submission.status == 'completed'
            ).all()
            
            all_submissions_code = [s.code for s in other_submissions]

            token_strategy = TokenBasedPlagiarismStrategy()
            ast_strategy = ASTPlagiarismStrategy()
            ai_strategy = AIProbabilityStrategy()

            # Calculate overall scores
            plagiarism_token_score = token_strategy.analyze(code, all_submissions_code, language)
            plagiarism_ast_score = ast_strategy.analyze(code, all_submissions_code, language)
            
            submission.plagiarism_score = max(plagiarism_token_score, plagiarism_ast_score)
            submission.ai_probability = ai_strategy.analyze(code, all_submissions_code, language)
            
            # Create PlagiarismPair records
            for other_sub in other_submissions:
                pair_token_score = token_strategy.analyze(code, [other_sub.code], language)
                pair_ast_score = ast_strategy.analyze(code, [other_sub.code], language)
                
                if pair_token_score >= 0.8 or pair_ast_score == 1.0:
                    pair = PlagiarismPair(
                        assignment_id=submission.assignment_id,
                        submission_a_id=submission.id,
                        submission_b_id=other_sub.id,
                        similarity_score=max(pair_token_score, pair_ast_score),
                        method="AST" if pair_ast_score == 1.0 else "Token"
                    )
                    db.session.add(pair)
            
            db.session.commit()

        # Step 3: Grade
        grade_result = grader_service.grade(
            submission_id, correctness_score, app=app
        )

        if grade_result.get('error'):
            logger.error(f"Grading failed for submission {submission_id}: {grade_result['error']}")
            return

        logger.info(
            f"Pipeline complete for submission {submission_id}: "
            f"final_score={grade_result['final_score']}, "
            f"flagged={grade_result['flagged']}"
        )

    except Exception as e:
        logger.error(f"Pipeline error for submission {submission_id}: {e}")


def trigger_pipeline(app, submission_id: int):
    """
    Start the evaluation pipeline in a background thread.
    Called from the submission route after code is submitted.
    """
    thread = threading.Thread(
        target=run_evaluation_pipeline,
        args=(app, submission_id),
        name=f'pipeline-{submission_id}',
        daemon=True
    )
    thread.start()
    logger.info(f"Pipeline thread started for submission {submission_id}")
    return thread
