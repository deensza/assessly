# Assessly

## Project Overview
Assessly is an automated programming assignment evaluation platform designed to assist instructors in grading programming assignments efficiently and fairly. The system evaluates student submissions automatically by executing code in a secure environment, running predefined test cases, and generating transparent grading reports.

Assessly also integrates advanced analysis features such as plagiarism detection and AI-generated code probability estimation. By combining automated evaluation with intelligent analysis, the system helps maintain academic integrity while significantly reducing the manual grading workload for instructors.

The platform integrates with Moodle and executes student submissions securely using Docker-based sandbox environments.

---

## Team Members
- Özgür Can Güngör
- İrem Şura Erkan
- Bermal Deniz Akkaya
- Berkan Mursal

---

## Problem Statement
In large programming courses, instructors must manually evaluate hundreds of submissions. This process is time-consuming and often lacks transparency for students.

Students usually receive only a numeric score without understanding which test cases failed or where their mistakes occurred. Additionally, with the increasing use of AI tools, detecting AI-generated solutions and plagiarism has become a major challenge in programming education.

Assessly addresses these issues by automating evaluation, improving feedback transparency, and supporting academic integrity.

---

## Target Users

### Students
Students can submit programming assignments and receive detailed feedback including:
- Passed and failed test cases
- Performance metrics
- Transparent grading breakdown

### Instructors
Instructors can:
- Create assignments
- Define grading criteria and test cases
- Detect plagiarism
- Identify potential AI-generated code

### IT Administrators
Administrators ensure the system integrates safely with university infrastructure while maintaining system security and scalability.

---

## Key Features

### Assignment & Course Management
Instructors can create programming assignments, upload problem descriptions, define constraints, and configure grading rules.

### Secure Code Execution Engine
Student code is executed inside isolated Docker sandbox environments to ensure system security and stability.

### Automated Test Case Evaluation
Submitted code is automatically evaluated using predefined test cases to determine correctness.

### AI-Based Code Analysis
The system estimates the probability that a submission was generated using AI tools based on structural and semantic patterns.

### Plagiarism Detection System
Structural similarity analysis and token-based comparison help detect copied solutions.

### Smart Grading & Feedback System
A weighted scoring system combines correctness, efficiency, plagiarism analysis, and AI analysis to produce transparent grading results.

---

## System Architecture
Assessly follows a **Layered Architecture** design to ensure simplicity, modularity, scalability, and security.

### Presentation Layer
- Student Dashboard
- Instructor Dashboard
- Admin Monitoring Panel
- Moodle Integration

### Business Logic Layer
- Assignment Manager
- Automated Test Engine
- AI-Based Code Analysis
- Plagiarism Detection Engine
- Smart Grading Module

### Data & Infrastructure Layer
- PostgreSQL Database
- Docker Sandbox Execution
- Authentication & Authorization
- Logging & Monitoring

---

## System Goals
- Automate programming assignment evaluation
- Provide transparent and detailed grading feedback
- Detect plagiarism and AI-generated code
- Ensure secure execution of student submissions
- Reduce instructor workload in large programming courses

---

## Repository Purpose
This repository demonstrates collaborative Git and GitHub workflows including:

- Branch creation
- Commit and push operations
- Pull Requests
- Peer code review
- Merge conflict resolution

Each team member contributes to this shared README file through their own branch, simulating a real-world collaborative software development workflow.

## Collaboration Update
This section was updated after merging the first pull request to simulate a merge conflict scenario.
