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
            db.session.commit()

        # Step 2: Analyze — real local strategy implementations
        from app.models import PlagiarismPair
        from app.services.strategies.plagiarism_token import TokenBasedPlagiarismStrategy
        from app.services.strategies.plagiarism_ast import ASTPlagiarismStrategy
        from app.services.strategies.ai_probability import AIProbabilityStrategy

        with app.app_context():
            submission = Submission.query.get(submission_id)
            code = submission.code
            language = submission.language

            other_submissions = Submission.query.filter(
                Submission.assignment_id == submission.assignment_id,
                Submission.id != submission.id
            ).all()
            other_codes = [s.code for s in other_submissions]

            token_strategy = TokenBasedPlagiarismStrategy()
            ast_strategy = ASTPlagiarismStrategy()
            ai_strategy = AIProbabilityStrategy()

            token_score = token_strategy.analyze(code, other_codes, language=language)
            ast_score = ast_strategy.analyze(code, other_codes, language=language)
            ai_score = ai_strategy.analyze(code, other_codes, language=language)

            plagiarism_score = max(token_score or 0.0, ast_score or 0.0)

            submission.plagiarism_score = plagiarism_score
            submission.score_structural = ast_score or 0.0
            submission.ai_probability = ai_score or 0.0

            # Store pair records for high-similarity cases.
            # Token strategy currently returns max score only, so pair-level details are approximated
            # by recording pairs against all existing submissions when the max score crosses threshold.
            if plagiarism_score >= 0.8:
                for other in other_submissions:
                    exists = PlagiarismPair.query.filter_by(
                        assignment_id=submission.assignment_id,
                        submission_a_id=other.id,
                        submission_b_id=submission.id,
                        method='combined'
                    ).first()
                    if not exists:
                        db.session.add(PlagiarismPair(
                            assignment_id=submission.assignment_id,
                            submission_a_id=other.id,
                            submission_b_id=submission.id,
                            similarity_score=plagiarism_score,
                            method='combined'
                        ))

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
