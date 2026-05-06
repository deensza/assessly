"""
Evaluator Service — Test case execution and correctness scoring.

Runs all test cases for a submission through the Docker sandbox,
compares outputs, and calculates the correctness score.
"""

import logging
from app import db
from app.models import (
    Submission, Assignment, TestCase, TestResult,
    SubmissionStatus
)
from app.services.sandbox import sandbox_service

logger = logging.getLogger(__name__)


class EvaluatorService:
    """Evaluates submissions by running test cases through the sandbox."""

    def evaluate(self, submission_id: int, app=None) -> dict:
        """
        Run all test cases for a submission and record results.

        Args:
            submission_id: The submission to evaluate
            app: Flask app instance (needed for background thread context)

        Returns:
            dict with keys: correctness_score, total_tests, passed_tests,
                            results, error
        """
        ctx = app.app_context() if app else None
        if ctx:
            ctx.push()

        try:
            submission = Submission.query.get(submission_id)
            if not submission:
                return {'error': f'Submission {submission_id} not found'}

            # Update status to running
            submission.status = SubmissionStatus.running
            db.session.commit()

            assignment = Assignment.query.get(submission.assignment_id)
            if not assignment:
                submission.status = SubmissionStatus.error
                db.session.commit()
                return {'error': 'Assignment not found'}

            # Initialize sandbox if needed
            if not hasattr(sandbox_service, '_initialized') and app:
                sandbox_service.init_app(app)
                sandbox_service._initialized = True

            # Get all test cases
            test_cases = TestCase.query.filter_by(
                assignment_id=assignment.id
            ).all()

            if not test_cases:
                submission.status = SubmissionStatus.error
                db.session.commit()
                return {'error': 'No test cases found for this assignment'}

            results = []
            total_weight = 0
            passed_weight = 0

            for tc in test_cases:
                # Run code in sandbox with this test case's input
                sandbox_result = sandbox_service.run_code(
                    code=submission.code,
                    language=submission.language,
                    stdin_input=tc.input,
                    time_limit=assignment.time_limit_seconds
                )

                # Compare output (strip whitespace)
                actual = sandbox_result['stdout'].strip()
                expected = tc.expected_output.strip()
                passed = (actual == expected) and sandbox_result['exit_code'] == 0

                # Record result
                test_result = TestResult(
                    submission_id=submission.id,
                    test_case_id=tc.id,
                    actual_output=actual if actual else sandbox_result.get('stderr', ''),
                    passed=passed,
                    execution_time_ms=sandbox_result['execution_time_ms'],
                    memory_usage_kb=None  # Docker stats are harder to get per-run
                )
                db.session.add(test_result)

                total_weight += tc.weight
                if passed:
                    passed_weight += tc.weight

                results.append({
                    'test_case_id': tc.id,
                    'passed': passed,
                    'expected': expected,
                    'actual': actual,
                    'execution_time_ms': sandbox_result['execution_time_ms'],
                    'timed_out': sandbox_result['timed_out'],
                    'stderr': sandbox_result['stderr'],
                })

            # Calculate correctness score (0-100)
            correctness_score = (passed_weight / total_weight * 100) if total_weight > 0 else 0

            db.session.commit()

            logger.info(
                f"Evaluation complete for submission {submission_id}: "
                f"{sum(1 for r in results if r['passed'])}/{len(results)} passed, "
                f"score={correctness_score:.1f}"
            )

            return {
                'correctness_score': round(correctness_score, 2),
                'total_tests': len(test_cases),
                'passed_tests': sum(1 for r in results if r['passed']),
                'results': results,
                'error': None
            }

        except Exception as e:
            logger.error(f"Evaluation error for submission {submission_id}: {e}")
            try:
                submission = Submission.query.get(submission_id)
                if submission:
                    submission.status = SubmissionStatus.error
                    db.session.commit()
            except Exception:
                pass
            return {'error': str(e)}
        finally:
            if ctx:
                ctx.pop()


# Module-level singleton
evaluator_service = EvaluatorService()
