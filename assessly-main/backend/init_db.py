from app import create_app, db
from app.models import User, Assignment, Course, UserRole
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash

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
            password_hash=generate_password_hash('password123'),
            role=UserRole.instructor
        )
        db.session.add(instructor)
        db.session.flush() # Get instructor ID
        
        # Create Student
        student = User(
            name='Deniz Akkaya',
            email='deniz@stu.yasar.edu.tr',
            password_hash=generate_password_hash('password123'),
            role=UserRole.student
        )
        db.session.add(student)
        
        # Create Course
        course = Course(
            title='COMP 3304 Software Engineering Fundamentals',
            description='Core principles of software development and design patterns.',
            instructor_id=instructor.id
        )
        db.session.add(course)
        db.session.flush() # Get course ID
        
        # Create Assignment
        assignment = Assignment(
            course_id=course.id,
            title='Merge Sort Optimization',
            description='Implement and optimize the Merge Sort algorithm in Python.',
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            weight_correctness=0.4,
            weight_plagiarism=0.2,
            weight_structural=0.2,
            weight_ai=0.2
        )
        db.session.add(assignment)
        
        db.session.commit()
        print("Database initialized successfully!")
    else:
        print("Database already contains data.")
