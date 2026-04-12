"""
Grader Service — Final grade calculation and feedback generation.

Combines correctness score, efficiency metrics, plagiarism score,
and AI probability into a final weighted grade.

Formula:
  final_score = correctness * 0.60 + efficiency * 0.15
                + (1 - plagiarism) * 0.15 + (1 - ai_prob) * 0.10
"""

import logging
from app import db
from app.models import Submission, TestResult, SubmissionStatus

logger = logging.getLogger(__name__)


class GraderService:
    """Calculates final grades and generates feedback."""

    # Weight configuration
    WEIGHT_CORRECTNESS = 0.60
    WEIGHT_EFFICIENCY = 0.15
    WEIGHT_PLAGIARISM = 0.15
    WEIGHT_AI = 0.10

    def grade(self, submission_id: int, correctness_score: float,
              app=None) -> dict:
        """
        Calculate final score and generate feedback for a submission.

        Args:
            submission_id: The submission to grade
            correctness_score: Score from evaluator (0-100)
            app: Flask app instance for background thread context

        Returns:
            dict with keys: final_score, breakdown, feedback, error
        """
        ctx = app.app_context() if app else None
        if ctx:
            ctx.push()

        try:
            submission = Submission.query.get(submission_id)
            if not submission:
                return {'error': f'Submission {submission_id} not found'}

            assignment = submission.assignment
            if not assignment:
                return {'error': 'Assignment not found'}

            # --- Component Scores (all normalized to 0-100) ---

            # 1. Correctness (from evaluator)
            correctness = correctness_score

            # 2. Structural/Efficiency (Lab 6 strategy - Ported as efficiency/structural)
            structural = submission.score_structural or 0.0
            efficiency = structural * 100 # Using structural as efficiency base

            # 3. Plagiarism score (0.0-1.0)
            plagiarism = submission.plagiarism_score or 0.0

            # 4. AI probability (0.0-1.0)
            ai_prob = submission.ai_probability or 0.0

            # --- Final Score Calculation (Using Assignment Weights) ---
            final_score = (
                correctness * assignment.weight_correctness +
                ((1.0 - plagiarism) * 100 * assignment.weight_plagiarism) +
                (efficiency * assignment.weight_structural) +
                ((1.0 - ai_prob) * 100 * assignment.weight_ai)
            )
            final_score = round(min(100, max(0, final_score)), 2)

            # --- Flag if suspicious ---
            flagged = plagiarism >= 0.8 or ai_prob >= 0.7

            # --- Generate feedback ---
            feedback = self._generate_feedback(
                submission, correctness, efficiency, plagiarism, ai_prob, final_score
            )

            # --- Update submission ---
            submission.final_score = final_score
            submission.flagged = flagged
            submission.status = SubmissionStatus.completed
            db.session.commit()

            breakdown = {
                'correctness': {
                    'score': round(correctness, 2),
                    'weight': self.WEIGHT_CORRECTNESS,
                    'weighted': round(correctness * self.WEIGHT_CORRECTNESS, 2)
                },
                'efficiency': {
                    'score': round(efficiency, 2),
                    'weight': self.WEIGHT_EFFICIENCY,
                    'weighted': round(efficiency * self.WEIGHT_EFFICIENCY, 2)
                },
                'plagiarism': {
                    'score': round(plagiarism, 4),
                    'weight': self.WEIGHT_PLAGIARISM,
                    'weighted': round((1.0 - plagiarism) * 100 * self.WEIGHT_PLAGIARISM, 2)
                },
                'ai_probability': {
                    'score': round(ai_prob, 4),
                    'weight': self.WEIGHT_AI,
                    'weighted': round((1.0 - ai_prob) * 100 * self.WEIGHT_AI, 2)
                }
            }

            logger.info(
                f"Grading complete for submission {submission_id}: "
                f"final_score={final_score}, flagged={flagged}"
            )

            return {
                'final_score': final_score,
                'breakdown': breakdown,
                'feedback': feedback,
                'flagged': flagged,
                'error': None
            }

        except Exception as e:
            logger.error(f"Grading error for submission {submission_id}: {e}")
            return {'error': str(e)}
        finally:
            if ctx:
                ctx.pop()

    def _calculate_efficiency(self, submission: Submission) -> float:
        """
        Calculate efficiency score based on average execution time.
        Returns 0-100 score where lower execution time = higher score.
        """
        test_results = TestResult.query.filter_by(
            submission_id=submission.id
        ).all()

        if not test_results:
            return 100.0  # No results = no penalty

        times = [tr.execution_time_ms for tr in test_results if tr.execution_time_ms]
        if not times:
            return 100.0

        avg_time = sum(times) / len(times)

        # Score based on average execution time
        # Under 100ms = 100 score, over 5000ms = 0 score, linear in between
        if avg_time <= 100:
            return 100.0
        elif avg_time >= 5000:
            return 0.0
        else:
            return round(100 - (avg_time - 100) / (5000 - 100) * 100, 2)

    def _generate_feedback(self, submission, correctness, efficiency,
                           plagiarism, ai_prob, final_score) -> dict:
        """Generate detailed feedback for the student."""
        feedback = {
            'summary': '',
            'details': [],
            'suggestions': []
        }

        # Summary
        if final_score >= 90:
            feedback['summary'] = 'Excellent work! Your solution performs very well.'
        elif final_score >= 70:
            feedback['summary'] = 'Good job! There is room for improvement.'
        elif final_score >= 50:
            feedback['summary'] = 'Needs improvement. Review the failed test cases.'
        else:
            feedback['summary'] = 'Significant issues found. Please review the requirements.'

        # Correctness details
        test_results = TestResult.query.filter_by(
            submission_id=submission.id
        ).all()

        passed = sum(1 for tr in test_results if tr.passed)
        total = len(test_results)
        feedback['details'].append(
            f'Test cases: {passed}/{total} passed ({correctness:.1f}% correctness)'
        )

        # Failed test case hints
        for tr in test_results:
            if not tr.passed and tr.test_case and not tr.test_case.is_hidden:
                feedback['details'].append(
                    f'  ✗ Test case {tr.test_case_id}: expected "{tr.test_case.expected_output}", '
                    f'got "{tr.actual_output}"'
                )

        # Efficiency
        if efficiency < 50:
            feedback['suggestions'].append(
                'Your solution is slow. Consider optimizing time complexity.'
            )

        # Plagiarism warning
        if plagiarism >= 0.8:
            feedback['details'].append(
                '⚠️ High similarity detected with another submission.'
            )
        elif plagiarism >= 0.5:
            feedback['details'].append(
                '⚠ Moderate similarity detected with another submission.'
            )

        # AI warning
        if ai_prob >= 0.7:
            feedback['details'].append(
                '⚠️ This submission has been flagged for potential AI-generated code.'
            )

        return feedback


# Module-level singleton
grader_service = GraderService()
