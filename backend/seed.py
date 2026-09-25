from datetime import datetime, timedelta
import uuid
from app import create_app
from models import db, User, Course, Module, Enrollment, ModuleProgress, Quiz, Question, QuizAttempt, QuizAnswer, Certificate

app = create_app()

def seed_database():
    with app.app_context():
        print("Clearing existing database tables...")
        db.drop_all()
        db.create_all()

        print("Seeding users...")
        # 1. Core Demo Users
        trainee = User(
            name="Alex Taylor",
            email="trainee@capacityconnect.com",
            role="trainee",
            is_active=True,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
        )
        trainee.set_password("trainee123")

        trainer = User(
            name="Dr. Sarah Jenkins",
            email="trainer@capacityconnect.com",
            role="trainer",
            is_active=True,
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
        )
        trainer.set_password("trainer123")

        admin = User(
            name="Marcus Vance",
            email="admin@capacityconnect.com",
            role="admin",
            is_active=True,
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
        )
        admin.set_password("admin123")

        # Additional Trainees for rich analytics & "Needs Attention" demonstration
        student_jordan = User(
            name="Jordan Lee",
            email="jordan.lee@example.com",
            role="trainee",
            is_active=True,
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
        )
        student_jordan.set_password("student123")

        student_elena = User(
            name="Elena Rostova",
            email="elena.rostova@example.com",
            role="trainee",
            is_active=True,
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
        )
        student_elena.set_password("student123")

        student_david = User(
            name="David Kim",
            email="david.kim@example.com",
            role="trainee",
            is_active=True,
            avatar_url="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80"
        )
        student_david.set_password("student123")

        db.session.add_all([trainee, trainer, admin, student_jordan, student_elena, student_david])
        db.session.flush()

        print("Seeding Course 1: Python Fundamentals...")
        course_python = Course(
            title="Python Fundamentals",
            description="Master modern Python from the ground up: syntax, data structures, control flow, functions, modular programming, and hands-on algorithmic problem solving.",
            category="Software Engineering",
            difficulty="Beginner",
            duration="6 Modules • 4.5 Hours",
            thumbnail_url="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=80",
            trainer_id=trainer.id,
            is_published=True
        )
        db.session.add(course_python)
        db.session.flush()

        # Modules for Python Fundamentals
        py_modules_data = [
            {
                "title": "Introduction to Python",
                "description": "Understanding Python's history, philosophy, installation, interactive shell, and running your very first script.",
                "content": """# Introduction to Python

Python is a high-level, interpreted, general-purpose programming language renowned for its readability and simplicity. Created by Guido van Rossum and released in 1991, Python's design philosophy emphasizes code clarity.

### Why Learn Python?
1. **Readable Syntax:** English-like structure minimizes cognitive load.
2. **Versatile Ecosystem:** Powers web backends, data science, machine learning, automation, and DevOps.
3. **Batteries Included:** Rich standard library covering math, I/O, networking, and JSON parsing.

```python
# Your first Python program
def greet(name: str) -> str:
    return f"Welcome to Capacity Connect, {name}!"

print(greet("Future Developer"))
```
""",
                "key_points": [
                    "Python is interpreted, dynamically typed, and multi-paradigm.",
                    "The Zen of Python (PEP 20) emphasizes simplicity over complexity.",
                    "Indentation is syntactically significant in Python."
                ],
                "material_url": "https://docs.python.org/3/tutorial/index.html",
                "duration_minutes": 35,
                "order_index": 1
            },
            {
                "title": "Variables and Data Types",
                "description": "Deep dive into numbers, strings, booleans, lists, tuples, dictionaries, and dynamic type inference.",
                "content": """# Variables and Data Types

In Python, variables are labels referencing objects stored in memory. You do not declare types explicitly; the interpreter infers types at runtime.

### Fundamental Scalar Types:
- `int`: Arbitrary-precision integers (`count = 42`)
- `float`: Double-precision IEEE 754 floating-point numbers (`pi = 3.14159`)
- `str`: Unicode character sequences (`name = "Capacity Connect"`)
- `bool`: Truth values (`is_active = True`)

### Core Collection Types:
- `list`: Ordered, mutable sequence (`skills = ["Python", "Flask", "React"]`)
- `tuple`: Ordered, immutable sequence (`coordinates = (12.9716, 77.5946)`)
- `dict`: Key-value hash map (`user = {"name": "Alex", "role": "trainee"}`)

```python
# Type inspection and conversion
age_str = "25"
age_int = int(age_str)
print(type(age_int))  # <class 'int'>
```
""",
                "key_points": [
                    "Everything in Python is an object, including functions and primitive types.",
                    "Lists are mutable arrays; Tuples are immutable records.",
                    "Dictionaries offer O(1) average-time lookups using hash tables."
                ],
                "material_url": "https://realpython.com/python-data-types/",
                "duration_minutes": 45,
                "order_index": 2
            },
            {
                "title": "Conditional Statements",
                "description": "Control execution flow using if, elif, else, and Boolean comparison logic.",
                "content": """# Conditional Statements

Decision-making in Python relies on `if`, `elif`, and `else` blocks evaluated against Boolean expressions.

### Syntax Structure:
```python
score = 85

if score >= 90:
    grade = "A+"
elif score >= 75:
    grade = "A"
elif score >= 60:
    grade = "B"
else:
    grade = "Needs Improvement"

print(f"Final Assessment: {grade}")
```

### Logical Operators:
- `and`: Both conditions must be truthy.
- `or`: At least one condition must be truthy.
- `not`: Inverts truthiness.
- `in`: Membership testing in collections.
""",
                "key_points": [
                    "Truthy and falsy values: 0, None, '', [], and {} evaluate to False.",
                    "Short-circuit evaluation optimizes logical expressions.",
                    "Ternary operator: `result = 'Pass' if score >= 60 else 'Fail'`."
                ],
                "material_url": "https://realpython.com/python-conditional-statements/",
                "duration_minutes": 40,
                "order_index": 3
            },
            {
                "title": "Loops and Iteration",
                "description": "Iterating over collections with for loops, while loops, comprehension expressions, and iteration control statements.",
                "content": """# Loops and Iteration

Python offers `for` loops (iterator-based) and `while` loops (condition-based).

### The For Loop & Comprehensions:
```python
courses = ["Python", "Web Dev", "Cloud", "Data Science"]

for index, course in enumerate(courses, start=1):
    print(f"{index}. {course}")

# Powerful List Comprehension:
squares = [x**2 for x in range(1, 6)]
print(squares)  # [1, 4, 9, 16, 25]
```

### Loop Control:
- `break`: Terminates the enclosing loop immediately.
- `continue`: Skips to the next iteration.
- `else` clause: Executes only if loop completes without encountering a `break`.
""",
                "key_points": [
                    "`for` loops operate directly on Python iterables.",
                    "`enumerate()` provides both index and value cleanly.",
                    "List comprehensions are faster and more idiomatic than explicit accumulator loops."
                ],
                "material_url": "https://realpython.com/python-for-loop/",
                "duration_minutes": 50,
                "order_index": 4
            },
            {
                "title": "Functions and Modular Design",
                "description": "Building reusable, maintainable code using functions, parameters, keyword arguments, return values, and docstrings.",
                "content": """# Functions and Modular Design

Functions are first-class citizens in Python: they can be passed as arguments, returned from other functions, and assigned to variables.

```python
def calculate_progress(completed: int, total: int) -> dict:
    \"\"\"Calculate completion percentage and badge status.\"\"\"
    if total <= 0:
        return {"percentage": 0, "status": "Not Started"}
    
    pct = round((completed / total) * 100, 1)
    status = "Completed" if pct >= 100 else ("In Progress" if pct > 0 else "Not Started")
    return {"percentage": pct, "status": status}

print(calculate_progress(5, 6))
```

### Keyword Arguments and Defaults:
```python
def enroll_trainee(name: str, course: str = "Python Fundamentals"):
    return f"{name} registered for {course}"
```
""",
                "key_points": [
                    "Default arguments must precede non-default parameters.",
                    "`*args` collects positional arguments into a tuple; `**kwargs` into a dictionary.",
                    "Type annotations improve IDE hints and documentation."
                ],
                "material_url": "https://realpython.com/defining-your-own-python-function/",
                "duration_minutes": 50,
                "order_index": 5
            },
            {
                "title": "Final Assessment Preparation & Summary",
                "description": "Comprehensive review of core programming constructs, best practices, and preparation for certification.",
                "content": """# Final Assessment Preparation & Summary

Congratulations on reaching the final module of Python Fundamentals! Let us review the key principles before you attempt the certification quiz.

### Key Milestones Covered:
1. **Syntax & Data Structures:** Lists, dictionaries, tuples, sets, type conversions.
2. **Control Flow:** Robust branching and defensive programming.
3. **Iteration:** Idiomatic comprehensions, loops, and generators.
4. **Modularity:** Well-documented, typed functions and modular separation.

### Tips for the Final Assessment:
- Read each question carefully.
- Pay attention to zero-indexed slice ranges and dictionary lookup mechanics.
- Once you score **60% or higher** and have marked all modules completed, your official **Capacity Connect Verified Certificate** will be immediately unlocked!
""",
                "key_points": [
                    "Review zero-indexing in slices (e.g. `[0:2]`).",
                    "Understand that dictionary keys must be hashable.",
                    "Passing threshold for the final assessment is 60%."
                ],
                "material_url": "https://docs.python.org/3/reference/index.html",
                "duration_minutes": 30,
                "order_index": 6
            }
        ]

        py_modules = []
        for m in py_modules_data:
            mod = Module(
                course_id=course_python.id,
                title=m["title"],
                description=m["description"],
                content=m["content"],
                material_url=m["material_url"],
                duration_minutes=m["duration_minutes"],
                order_index=m["order_index"]
            )
            mod.set_key_points(m["key_points"])
            db.session.add(mod)
            py_modules.append(mod)

        db.session.flush()

        print("Seeding Quiz for Python Fundamentals...")
        quiz_python = Quiz(
            course_id=course_python.id,
            title="Python Fundamentals Certification Assessment",
            description="Demonstrate your comprehension of Python syntax, data types, control flow, loops, and functions.",
            passing_percentage=60
        )
        db.session.add(quiz_python)
        db.session.flush()

        questions_data = [
            {
                "question_text": "What will be the output of `type([])` in Python 3?",
                "option_a": "<class 'array'>",
                "option_b": "<class 'list'>",
                "option_c": "<class 'tuple'>",
                "option_d": "<class 'collection'>",
                "correct_option": "B",
                "marks": 2,
                "order_index": 1
            },
            {
                "question_text": "Which of the following data types is IMMUTABLE in Python?",
                "option_a": "List",
                "option_b": "Dictionary",
                "option_c": "Tuple",
                "option_d": "Set",
                "correct_option": "C",
                "marks": 2,
                "order_index": 2
            },
            {
                "question_text": "What does the expression `[x * 2 for x in range(3)]` evaluate to?",
                "option_a": "[0, 2, 4]",
                "option_b": "[2, 4, 6]",
                "option_c": "[0, 1, 2]",
                "option_d": "[2, 2, 2]",
                "correct_option": "A",
                "marks": 2,
                "order_index": 3
            },
            {
                "question_text": "How do you define a function in Python?",
                "option_a": "function my_func():",
                "option_b": "func my_func():",
                "option_c": "def my_func():",
                "option_d": "define my_func():",
                "correct_option": "C",
                "marks": 2,
                "order_index": 4
            },
            {
                "question_text": "What is the result of `bool(0)` and `bool('False')` in Python?",
                "option_a": "False and False",
                "option_b": "False and True",
                "option_c": "True and False",
                "option_d": "True and True",
                "correct_option": "B",
                "marks": 2,
                "order_index": 5
            }
        ]

        for q in questions_data:
            question = Question(
                quiz_id=quiz_python.id,
                question_text=q["question_text"],
                option_a=q["option_a"],
                option_b=q["option_b"],
                option_c=q["option_c"],
                option_d=q["option_d"],
                correct_option=q["correct_option"],
                marks=q["marks"],
                order_index=q["order_index"]
            )
            db.session.add(question)

        db.session.flush()

        print("Seeding Course 2: React & Modern Web Development...")
        course_react = Course(
            title="Modern Full-Stack Development with React & Tailwind",
            description="Build scalable, responsive web applications utilizing React hooks, component architecture, state management, and modern Tailwind CSS design patterns.",
            category="Web Development",
            difficulty="Intermediate",
            duration="4 Modules • 5 Hours",
            thumbnail_url="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
            trainer_id=trainer.id,
            is_published=True
        )
        db.session.add(course_react)
        db.session.flush()

        react_mods = [
            Module(
                course_id=course_react.id,
                title="Component Architecture & JSX",
                description="Deep dive into functional components, props, conditional rendering, and JSX transpilation.",
                content="# Component Architecture\n\nReact components encapsulate markup, style, and logic...",
                material_url="https://react.dev/learn",
                duration_minutes=45,
                order_index=1
            ),
            Module(
                course_id=course_react.id,
                title="State Management with Hooks",
                description="Master useState, useEffect, useMemo, and custom hooks.",
                content="# State Management with Hooks\n\nHooks let you hook into React state and lifecycle...",
                material_url="https://react.dev/reference/react",
                duration_minutes=60,
                order_index=2
            ),
            Module(
                course_id=course_react.id,
                title="Design Systems with Tailwind CSS",
                description="Utility-first styling, responsive design tokens, and theme customization.",
                content="# Design Systems with Tailwind CSS\n\nTailwind provides atomic CSS classes...",
                material_url="https://tailwindcss.com/docs",
                duration_minutes=45,
                order_index=3
            ),
            Module(
                course_id=course_react.id,
                title="API Integration & Performance",
                description="Connecting REST endpoints, handling asynchronous loading states, and error boundaries.",
                content="# API Integration\n\nHandling async fetch calls cleanly inside React...",
                material_url="https://react.dev",
                duration_minutes=50,
                order_index=4
            )
        ]
        for rm in react_mods:
            rm.set_key_points(["Declarative UI paradigm", "Single source of truth", "Component reusability"])
            db.session.add(rm)

        db.session.flush()

        quiz_react = Quiz(
            course_id=course_react.id,
            title="React & Tailwind Mastery Assessment",
            description="Validate your skills in React hooks, lifecycle, component design, and Tailwind utility styling.",
            passing_percentage=60
        )
        db.session.add(quiz_react)
        db.session.flush()

        react_questions = [
            Question(quiz_id=quiz_react.id, question_text="Which hook is used to perform side effects in functional components?", option_a="useState", option_b="useEffect", option_c="useContext", option_d="useReducer", correct_option="B", marks=2, order_index=1),
            Question(quiz_id=quiz_react.id, question_text="What does Tailwind CSS use as its primary styling philosophy?", option_a="Semantic CSS classes", option_b="Inline CSS styles", option_c="Utility-first CSS classes", option_d="CSS-in-JS templates", correct_option="C", marks=2, order_index=2),
            Question(quiz_id=quiz_react.id, question_text="What rule must be followed when calling React Hooks?", option_a="Call them inside loops", option_b="Call them only at the top level", option_c="Call them only inside conditionals", option_d="Call them inside nested helper functions", correct_option="B", marks=2, order_index=3)
        ]
        db.session.add_all(react_questions)
        db.session.flush()

        print("Seeding Course 3: Data Analytics & Business Intelligence...")
        course_data = Course(
            title="Data Analytics & Business Intelligence",
            description="Transform raw datasets into actionable executive insights with statistical exploration, data storytelling, and dashboard design.",
            category="Data Science",
            difficulty="Beginner",
            duration="3 Modules • 3 Hours",
            thumbnail_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
            trainer_id=trainer.id,
            is_published=True
        )
        db.session.add(course_data)
        db.session.flush()

        data_mods = [
            Module(course_id=course_data.id, title="Exploratory Data Analysis", description="Summary metrics, variance, and distributions.", content="# Exploratory Data Analysis\n\nUnderstanding datasets thoroughly...", duration_minutes=45, order_index=1),
            Module(course_id=course_data.id, title="Visual Storytelling & Charts", description="Choosing effective visual encodings for executive presentations.", content="# Visual Storytelling\n\nLine charts, bar charts, and scatter plots...", duration_minutes=45, order_index=2),
            Module(course_id=course_data.id, title="Metric Design & KPIs", description="Designing balanced scorecards and conversion funnels.", content="# Metric Design\n\nAligning metrics with organizational strategy...", duration_minutes=45, order_index=3)
        ]
        for dm in data_mods:
            dm.set_key_points(["Statistical summary", "Effective charting", "Actionable KPIs"])
            db.session.add(dm)
        db.session.flush()

        print("Seeding Course 4: Cloud Architecture Fundamentals (Advanced)...")
        course_cloud = Course(
            title="Cloud Architecture & Infrastructure Essentials",
            description="Design fault-tolerant, resilient architectures utilizing microservices, load balancing, containerization, and modern CI/CD automation.",
            category="DevOps & Cloud",
            difficulty="Advanced",
            duration="3 Modules • 4 Hours",
            thumbnail_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
            trainer_id=trainer.id,
            is_published=True
        )
        db.session.add(course_cloud)
        db.session.flush()

        # Seed Enrollments & Progress
        print("Seeding Enrollments and Progress for demo...")
        # 1. Main Demo Trainee is enrolled in Python Fundamentals with first 2 modules completed
        # This allows the hackathon demo to seamlessly complete modules 3-6, take the quiz, and earn the certificate live!
        en_trainee_py = Enrollment(
            user_id=trainee.id,
            course_id=course_python.id,
            status="in_progress",
            enrolled_at=datetime.utcnow() - timedelta(days=2)
        )
        db.session.add(en_trainee_py)
        db.session.flush()

        for idx, mod in enumerate(py_modules):
            is_done = idx < 2  # First 2 completed
            mp = ModuleProgress(
                enrollment_id=en_trainee_py.id,
                module_id=mod.id,
                completed=is_done,
                completed_at=datetime.utcnow() - timedelta(days=1) if is_done else None
            )
            db.session.add(mp)

        # 2. Main Demo Trainee ALSO completed Course 3 (Data Analytics) with an existing certificate
        # So their Certificates tab already has a verified certificate to view/download immediately!
        en_trainee_data = Enrollment(
            user_id=trainee.id,
            course_id=course_data.id,
            status="completed",
            enrolled_at=datetime.utcnow() - timedelta(days=10),
            completed_at=datetime.utcnow() - timedelta(days=3)
        )
        db.session.add(en_trainee_data)
        db.session.flush()

        for dm in data_mods:
            db.session.add(ModuleProgress(enrollment_id=en_trainee_data.id, module_id=dm.id, completed=True, completed_at=datetime.utcnow() - timedelta(days=3)))

        cert_demo = Certificate(
            certificate_code="CAP-003-CC98F41A",
            user_id=trainee.id,
            course_id=course_data.id,
            trainee_name=trainee.name,
            course_title=course_data.title,
            trainer_name=trainer.name,
            issue_date=datetime.utcnow() - timedelta(days=3)
        )
        db.session.add(cert_demo)

        # 3. Student Elena Rostova: Low progress (16%) and failed quiz attempt (40%) -> Demonstrates "Needs Attention" badge!
        en_elena = Enrollment(
            user_id=student_elena.id,
            course_id=course_python.id,
            status="in_progress",
            enrolled_at=datetime.utcnow() - timedelta(days=5)
        )
        db.session.add(en_elena)
        db.session.flush()

        for idx, mod in enumerate(py_modules):
            db.session.add(ModuleProgress(
                enrollment_id=en_elena.id,
                module_id=mod.id,
                completed=(idx == 0),
                completed_at=datetime.utcnow() - timedelta(days=4) if idx == 0 else None
            ))

        attempt_elena = QuizAttempt(
            user_id=student_elena.id,
            quiz_id=quiz_python.id,
            score=4,
            max_score=10,
            percentage=40.0,
            passed=False,
            attempted_at=datetime.utcnow() - timedelta(days=1)
        )
        db.session.add(attempt_elena)

        # 4. Student Jordan Lee: High progress (83%) -> Demonstrates "On Track"
        en_jordan = Enrollment(
            user_id=student_jordan.id,
            course_id=course_python.id,
            status="in_progress",
            enrolled_at=datetime.utcnow() - timedelta(days=7)
        )
        db.session.add(en_jordan)
        db.session.flush()

        for idx, mod in enumerate(py_modules):
            db.session.add(ModuleProgress(
                enrollment_id=en_jordan.id,
                module_id=mod.id,
                completed=(idx < 5),
                completed_at=datetime.utcnow() - timedelta(days=2) if idx < 5 else None
            ))

        # 5. Student David Kim: Completed Python Fundamentals with Certificate
        en_david = Enrollment(
            user_id=student_david.id,
            course_id=course_python.id,
            status="completed",
            enrolled_at=datetime.utcnow() - timedelta(days=14),
            completed_at=datetime.utcnow() - timedelta(days=5)
        )
        db.session.add(en_david)
        db.session.flush()

        for mod in py_modules:
            db.session.add(ModuleProgress(
                enrollment_id=en_david.id,
                module_id=mod.id,
                completed=True,
                completed_at=datetime.utcnow() - timedelta(days=5)
            ))

        attempt_david = QuizAttempt(
            user_id=student_david.id,
            quiz_id=quiz_python.id,
            score=10,
            max_score=10,
            percentage=100.0,
            passed=True,
            attempted_at=datetime.utcnow() - timedelta(days=5)
        )
        db.session.add(attempt_david)

        cert_david = Certificate(
            certificate_code="CAP-001-A7D18E29",
            user_id=student_david.id,
            course_id=course_python.id,
            trainee_name=student_david.name,
            course_title=course_python.title,
            trainer_name=trainer.name,
            issue_date=datetime.utcnow() - timedelta(days=5)
        )
        db.session.add(cert_david)

        db.session.commit()
        print("Database seeded successfully with rich demo data!")

if __name__ == "__main__":
    seed_database()
