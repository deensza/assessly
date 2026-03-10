# assessly
Assessly is an automated programming assignment evaluation platform that detects plagiarism, estimates AI-generated code probability, and provides transparent grading through automated test cases. The system integrates with Moodle and executes student submissions securely using Docker sandbox environments.
## Project Architecture

Assessly follows a modular architecture to ensure scalable and secure code evaluation. 
The platform integrates with Moodle to receive student submissions and processes them 
through automated pipelines.

Key components include:

- **Submission Handler** – receives and stores student code submissions.
- **Docker Sandbox** – securely runs submitted code in isolated containers.
- **Test Case Engine** – evaluates code against predefined test cases.
- **AI-based Code Analysis** – estimates the probability of AI-generated code.
- **Plagiarism Detection Module** – identifies similarities between submissions.

This architecture ensures transparency, security, and fairness in automated grading systems.
