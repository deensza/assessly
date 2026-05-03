from app import create_app, db
from app.models import User, Assignment, Course, CourseEnrollment, TestCase, UserRole
from datetime import datetime, timedelta, timezone
from app.utils.auth import hash_password

app = create_app()

with app.app_context():
    print("Creating database tables...")
    db.create_all()
    
    # Check if we already have data
    if not User.query.filter_by(email='instructor@yasar.edu.tr').first():
        print("Inserting sample data...")
        
        # Create Instructor
        instructor = User(
            name='Dr. Suphi Ucar',
            email='instructor@yasar.edu.tr',
            password_hash=hash_password('password123'),
            role=UserRole.instructor
        )
        db.session.add(instructor)
        db.session.flush()
        
        # Create Student
        student = User(
            name='Deniz Akkaya',
            email='deniz@stu.yasar.edu.tr',
            password_hash=hash_password('password123'),
            role=UserRole.student
        )
        db.session.add(student)
        db.session.flush()
        
        # Create Admin
        admin = User(
            name='Ali Sezgin',
            email='admin@yasar.edu.tr',
            password_hash=hash_password('password123'),
            role=UserRole.admin
        )
        db.session.add(admin)
        
        # Create Course
        course = Course(
            title='COMP 3304 Software Engineering Fundamentals',
            description='Core principles of software development and design patterns.',
            instructor_id=instructor.id
        )
        db.session.add(course)
        db.session.flush()
        
        # Enroll student in course
        enrollment = CourseEnrollment(
            course_id=course.id,
            student_id=student.id
        )
        db.session.add(enrollment)
        
        # Create Assignment
        assignment = Assignment(
            course_id=course.id,
            title='Merge Sort Optimization',
            description='Implement and optimize the Merge Sort algorithm in Python.\n\nWrite a function `merge_sort(arr)` that takes a list of integers and returns a sorted list.\n\n**Constraints:**\n- 1 <= len(arr) <= 10000\n- -10^6 <= arr[i] <= 10^6\n\n**Example:**\n```python\nmerge_sort([3, 1, 2]) => [1, 2, 3]\n```',
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            supported_languages=['python', 'java', 'c'],
            weight_correctness=0.4,
            weight_plagiarism=0.2,
            weight_structural=0.2,
            weight_ai=0.2
        )
        db.session.add(assignment)
        db.session.flush()
        
        # Add test cases
        test_cases = [
            TestCase(
                assignment_id=assignment.id,
                input='3 1 2',
                expected_output='1 2 3',
                is_hidden=False,
                weight=1.0
            ),
            TestCase(
                assignment_id=assignment.id,
                input='5 4 3 2 1',
                expected_output='1 2 3 4 5',
                is_hidden=False,
                weight=1.0
            ),
            TestCase(
                assignment_id=assignment.id,
                input='1',
                expected_output='1',
                is_hidden=True,
                weight=1.0
            ),
        ]
        for tc in test_cases:
            db.session.add(tc)
        
        db.session.commit()
        print("Database initialized successfully!")
        print("  - Instructor: instructor@yasar.edu.tr / password123")
        print("  - Student:    deniz@stu.yasar.edu.tr / password123")
        print("  - Admin:      admin@yasar.edu.tr / password123")
    else:
        print("Database already contains data.")
