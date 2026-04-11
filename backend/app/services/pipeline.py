"""
Pipeline Service — Orchestrates the full evaluation pipeline.

Submit → Sandbox → Evaluate → Analyze → Grade → Store

Runs in a background thread so the API returns immediately.
"""

import threading
import logging

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
        logger.info(
            f"Evaluation done: {eval_result['passed_tests']}/{eval_result['total_tests']} "
            f"passed, correctness={correctness_score}"
        )

        # Step 2: Analyze (placeholder — will be implemented in Phase 4)
        # analyzer.analyze(submission_id, app=app)

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
