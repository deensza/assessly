"""
Moodle LMS Integration Service.

Handles communication with Moodle's Web Services API:
- Sync assignments from Moodle
- Push grades back to Moodle
- Pull student submissions info

Requires admin to configure API URL + token in admin panel.
"""

import logging
import requests

logger = logging.getLogger(__name__)


class MoodleService:
    """Client for Moodle REST Web Services API."""

    def __init__(self, api_url: str = '', token: str = ''):
        self.api_url = api_url.rstrip('/')
        self.token = token

    def _call(self, function: str, **params) -> dict:
        """
        Make a call to the Moodle Web Services API.
        
        Args:
            function: Moodle web service function name (e.g. 'mod_assign_get_assignments')
            **params: Additional parameters for the function
            
        Returns:
            dict: JSON response from Moodle
            
        Raises:
            ConnectionError: If Moodle is unreachable
            ValueError: If Moodle returns an error/exception
        """
        if not self.api_url or not self.token:
            raise ValueError("Moodle not configured. Set API URL and token in admin panel.")

        endpoint = f"{self.api_url}/webservice/rest/server.php"
        payload = {
            'wstoken': self.token,
            'wsfunction': function,
            'moodlewsrestformat': 'json',
            **params
        }

        try:
            response = requests.post(endpoint, data=payload, timeout=15)
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.ConnectionError:
            raise ConnectionError(f"Cannot reach Moodle at {self.api_url}")
        except requests.exceptions.Timeout:
            raise ConnectionError("Moodle request timed out")
        except Exception as e:
            raise ConnectionError(f"Moodle request failed: {str(e)}")

        # Moodle returns errors as JSON with 'exception' key
        if isinstance(data, dict) and 'exception' in data:
            raise ValueError(f"Moodle error: {data.get('message', 'Unknown error')}")

        return data

    # ─── Connection ─────────────────────────────────────────
    def test_connection(self) -> dict:
        """Test the Moodle connection and return site info."""
        data = self._call('core_webservice_get_site_info')
        return {
            'status': 'connected',
            'site_name': data.get('sitename', ''),
            'username': data.get('username', ''),
            'version': data.get('release', ''),
        }

    # ─── Assignments ────────────────────────────────────────
    def get_assignments(self, course_ids: list[int] = None) -> list[dict]:
        """
        Fetch assignments from Moodle courses.
        
        Args:
            course_ids: List of Moodle course IDs to fetch from.
                        If None, fetches from all enrolled courses.
        
        Returns:
            List of assignment dicts with keys: id, name, duedate, intro
        """
        params = {}
        if course_ids:
            for i, cid in enumerate(course_ids):
                params[f'courseids[{i}]'] = cid

        data = self._call('mod_assign_get_assignments', **params)
        
        assignments = []
        for course in data.get('courses', []):
            for assign in course.get('assignments', []):
                assignments.append({
                    'moodle_id': assign['id'],
                    'name': assign.get('name', ''),
                    'course_id': course['id'],
                    'course_name': course.get('fullname', ''),
                    'due_date': assign.get('duedate', 0),
                    'intro': assign.get('intro', ''),
                })
        
        return assignments

    # ─── Grades ─────────────────────────────────────────────
    def push_grade(self, assignment_id: int, user_id: int, grade: float,
                   feedback: str = '') -> dict:
        """
        Push a grade to Moodle for a specific assignment and user.
        
        Args:
            assignment_id: Moodle assignment ID
            user_id: Moodle user ID
            grade: Grade value (0-100)
            feedback: Text feedback for the student
            
        Returns:
            dict with status
        """
        data = self._call(
            'mod_assign_save_grade',
            assignmentid=assignment_id,
            userid=user_id,
            grade=grade,
            attemptnumber=-1,
            addattempt=1,
            workflowstate='graded',
            **{
                'plugindata[assignfeedbackcomments_editor][text]': feedback,
                'plugindata[assignfeedbackcomments_editor][format]': 1,
            }
        )
        
        logger.info(f"Grade pushed to Moodle: assignment={assignment_id}, "
                     f"user={user_id}, grade={grade}")
        return {'status': 'success', 'data': data}

    # ─── Submissions ────────────────────────────────────────
    def get_submissions(self, assignment_id: int) -> list[dict]:
        """
        Fetch submission status from Moodle for an assignment.
        
        Args:
            assignment_id: Moodle assignment ID
            
        Returns:
            List of submission dicts
        """
        data = self._call(
            'mod_assign_get_submissions',
            **{
                'assignmentids[0]': assignment_id
            }
        )
        
        submissions = []
        for assign in data.get('assignments', []):
            for sub in assign.get('submissions', []):
                submissions.append({
                    'moodle_submission_id': sub['id'],
                    'user_id': sub.get('userid'),
                    'status': sub.get('status', ''),
                    'time_modified': sub.get('timemodified', 0),
                })
        
        return submissions

    # ─── Users ──────────────────────────────────────────────
    def get_enrolled_users(self, course_id: int) -> list[dict]:
        """
        Get the list of enrolled users in a Moodle course.
        
        Args:
            course_id: Moodle course ID
            
        Returns:
            List of user dicts with keys: id, fullname, email
        """
        data = self._call(
            'core_enrol_get_enrolled_users',
            courseid=course_id
        )
        
        return [
            {
                'moodle_user_id': user['id'],
                'fullname': user.get('fullname', ''),
                'email': user.get('email', ''),
            }
            for user in data
            if isinstance(user, dict)
        ]


# Module-level factory
def create_moodle_service(api_url: str = '', token: str = '') -> MoodleService:
    """Create a MoodleService instance with the given credentials."""
    return MoodleService(api_url=api_url, token=token)
