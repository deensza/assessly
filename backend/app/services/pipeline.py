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
        from app.services.analyzer import (
            SubmissionAnalyzer,
            TokenBasedPlagiarismStrategy,
            StructuralStrategy,
            AIProbabilityStrategy
        )
        
        with app.app_context():
            submission = Submission.query.get(submission_id)
            code = submission.code

            analyzer = SubmissionAnalyzer()

            # Strategy 1
            analyzer.set_strategy(TokenBasedPlagiarismStrategy())
            s1 = analyzer.analyze_submission(code)

            # Strategy 2
            analyzer.set_strategy(StructuralStrategy())
            s2 = analyzer.analyze_submission(code)

            # Strategy 3
            analyzer.set_strategy(AIProbabilityStrategy())
            s3 = analyzer.analyze_submission(code)
            
            # The final score combines structural and token for plagiarism
            submission.plagiarism_score = max(s1 or 0.0, s2 or 0.0)
            submission.ai_probability = s3 or 0.0
            
            # Fulfill the PlagiarismPairs table requirement from the PDF
            # The actual pairs are generated and saved by the advanced_plagiarism_analysis
            # method deep inside the analyzer.set_strategy calls above.


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
