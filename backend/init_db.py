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
        
        # Create Students
        student_deniz = User(
            name='Deniz Akkaya',
            email='deniz@stu.yasar.edu.tr',
            password_hash=hash_password('password123'),
            role=UserRole.student
        )
        db.session.add(student_deniz)
        db.session.flush()

        student_ozgur = User(
            name='Ozgur Can Gungor',
            email='ozgur@stu.yasar.edu.tr',
            password_hash=hash_password('password123'),
            role=UserRole.student
        )
        db.session.add(student_ozgur)
        db.session.flush()

        student_sura = User(
            name='Irem Sura Erkan',
            email='sura@stu.yasar.edu.tr',
            password_hash=hash_password('password123'),
            role=UserRole.student
        )
        db.session.add(student_sura)
        db.session.flush()

        student_berkan = User(
            name='Berkan Mursal',
            email='berkan@stu.yasar.edu.tr',
            password_hash=hash_password('password123'),
            role=UserRole.student
        )
        db.session.add(student_berkan)
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
        
        # Enroll all students in course
        for student in [student_deniz, student_ozgur, student_sura, student_berkan]:
            db.session.add(CourseEnrollment(
                course_id=course.id,
                student_id=student.id
            ))
        
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
        print("  - Student:    ozgur@stu.yasar.edu.tr / password123")
        print("  - Student:    sura@stu.yasar.edu.tr / password123")
        print("  - Student:    berkan@stu.yasar.edu.tr / password123")
        print("  - Admin:      admin@yasar.edu.tr / password123")
    else:
        print("Database already contains data.")

    # Always ensure all students, enrollments and admin exist (repair if missing)
    course = Course.query.first()

    student_list = [
        ('Deniz Akkaya', 'deniz@stu.yasar.edu.tr'),
        ('Ozgur Can Gungor', 'ozgur@stu.yasar.edu.tr'),
        ('Irem Sura Erkan', 'sura@stu.yasar.edu.tr'),
        ('Berkan Mursal', 'berkan@stu.yasar.edu.tr'),
    ]

    for name, email in student_list:
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                name=name,
                email=email,
                password_hash=hash_password('password123'),
                role=UserRole.student
            )
            db.session.add(user)
            db.session.flush()
            print(f"  [REPAIR] Student {name} created.")
        if course:
            existing_enrollment = CourseEnrollment.query.filter_by(
                course_id=course.id, student_id=user.id
            ).first()
            if not existing_enrollment:
                db.session.add(CourseEnrollment(course_id=course.id, student_id=user.id))
                print(f"  [REPAIR] Enrollment for {name} created.")

    if not User.query.filter_by(email='admin@yasar.edu.tr').first():
        admin = User(
            name='Ali Sezgin',
            email='admin@yasar.edu.tr',
            password_hash=hash_password('password123'),
            role=UserRole.admin
        )
        db.session.add(admin)
        print("  [REPAIR] Admin user created.")

    db.session.commit()


