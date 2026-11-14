"""
Deterministic fallback quiz questions organized by skill and difficulty.
Ensures assessments and grading work 100% reliably even when LLM provider is offline.
"""

FALLBACK_QUIZ_BANK = {
    "JavaScript": {
        "Beginner": [
            {
                "question": "What will `typeof NaN` evaluate to in JavaScript?",
                "options": ["'undefined'", "'number'", "'nan'", "'object'"],
                "correct_answer": 1,
                "explanation": "In JavaScript, NaN (Not-a-Number) is technically a numeric data type representing an unrepresentable value.",
                "concept": "Data Types"
            },
            {
                "question": "What is the key difference between `let` and `var` in modern JavaScript?",
                "options": [
                    "`let` is function-scoped, `var` is block-scoped",
                    "`let` is block-scoped, `var` is function-scoped",
                    "`let` cannot be reassigned",
                    "`var` is not hoisted"
                ],
                "correct_answer": 1,
                "explanation": "`let` provides block scoping (within curly braces `{}`), whereas `var` is scoped to the enclosing function.",
                "concept": "Scoping & Variables"
            },
            {
                "question": "Which array method creates a NEW array populated with the results of calling a function on every element?",
                "options": ["forEach()", "filter()", "map()", "reduce()"],
                "correct_answer": 2,
                "explanation": "`Array.prototype.map()` returns a new array with the transformed elements without mutating the original array.",
                "concept": "Array Methods"
            },
            {
                "question": "What will `console.log(2 + '2')` output in JavaScript?",
                "options": ["4", "'22'", "NaN", "TypeError"],
                "correct_answer": 1,
                "explanation": "The `+` operator coerces the number 2 to a string and performs string concatenation, yielding `'22'`.",
                "concept": "Type Coercion"
            },
            {
                "question": "What keyword is used to handle asynchronous promises with clean synchronous-like syntax?",
                "options": ["defer", "yield", "async/await", "then/catch"],
                "correct_answer": 2,
                "explanation": "`async` functions and the `await` operator simplify asynchronous promise consumption.",
                "concept": "Asynchronous JavaScript"
            }
        ],
        "Intermediate": [
            {
                "question": "What is a closure in JavaScript?",
                "options": [
                    "A function bundled together with references to its lexical environment",
                    "A method to close browser tabs programmatically",
                    "A way to terminate a loop early",
                    "A private JSON object structure"
                ],
                "correct_answer": 0,
                "explanation": "A closure gives an inner function access to an outer function's scope even after the outer function has executed.",
                "concept": "Closures"
            },
            {
                "question": "What is the purpose of `Promise.all()`?",
                "options": [
                    "Executes promises strictly sequentially",
                    "Resolves when all promises resolve, or rejects immediately when any promise rejects",
                    "Ignores rejected promises and returns only fulfilled values",
                    "Converts synchronous callbacks into promises"
                ],
                "correct_answer": 1,
                "explanation": "`Promise.all` runs promises concurrently and fails fast if any promise rejects.",
                "concept": "Asynchronous JavaScript"
            },
            {
                "question": "What is the difference between `==` and `===` in JavaScript?",
                "options": [
                    "`==` compares memory references; `===` compares values",
                    "`==` performs type coercion; `===` checks both value and type strictly",
                    "`===` is deprecated in ES6",
                    "They are completely interchangeable"
                ],
                "correct_answer": 1,
                "explanation": "Strict equality `===` checks both value and data type without implicit coercion.",
                "concept": "Equality Operators"
            }
        ]
    },
    "React": {
        "Beginner": [
            {
                "question": "What is JSX in React?",
                "options": [
                    "A template engine compiled at runtime",
                    "A syntax extension to JavaScript that describes UI appearance",
                    "A separate programming language replacing HTML",
                    "A database query language"
                ],
                "correct_answer": 1,
                "explanation": "JSX lets developers write HTML-like markup inside JavaScript files, which compilers transform into React createElement calls.",
                "concept": "JSX"
            },
            {
                "question": "Which hook is used to declare state variables in a functional React component?",
                "options": ["useEffect", "useMemo", "useState", "useRef"],
                "correct_answer": 2,
                "explanation": "`useState` declares state variables that trigger component re-renders when updated.",
                "concept": "State Management"
            },
            {
                "question": "Why should each item in a rendered list have a unique `key` prop?",
                "options": [
                    "To enable CSS styling on the item",
                    "To help React identify which items have changed, been added, or removed during reconciliation",
                    "To make the element accessible to screen readers",
                    "Keys are strictly optional and have no performance effect"
                ],
                "correct_answer": 1,
                "explanation": "Unique keys provide a stable identity across renders so React can reorder or update DOM elements efficiently.",
                "concept": "Reconciliation & Keys"
            },
            {
                "question": "When does a `useEffect` hook with an empty dependency array `[]` run?",
                "options": [
                    "On every single component render",
                    "Only once when the component mounts",
                    "Only when the component unmounts",
                    "Never"
                ],
                "correct_answer": 1,
                "explanation": "An empty dependency array indicates the effect doesn't depend on any props or state, running only once upon mounting.",
                "concept": "Lifecycle & useEffect"
            },
            {
                "question": "How are properties (props) passed to child components in React?",
                "options": [
                    "Via two-way data binding",
                    "Via one-way top-to-bottom data flow from parent to child",
                    "Through global window variables",
                    "By mutating the child's local state directly"
                ],
                "correct_answer": 1,
                "explanation": "React enforces unidirectional data flow: parents pass data down via read-only props.",
                "concept": "Props & Component Architecture"
            }
        ]
    },
    "Python": {
        "Beginner": [
            {
                "question": "What is the difference between a Python `list` and a `tuple`?",
                "options": [
                    "Lists are immutable; tuples are mutable",
                    "Lists are mutable; tuples are immutable",
                    "Tuples can only store numbers",
                    "Lists cannot be sliced"
                ],
                "correct_answer": 1,
                "explanation": "Lists can be modified (appended, popped, reassigned), while tuples cannot be changed after creation.",
                "concept": "Data Structures"
            },
            {
                "question": "Which Python keyword defines a generator function that produces a sequence lazily?",
                "options": ["return", "emit", "yield", "produce"],
                "correct_answer": 2,
                "explanation": "`yield` pauses the function and returns a value to the caller, resuming state on the next iteration.",
                "concept": "Generators"
            },
            {
                "question": "What does the dictionary method `.get(key, default)` do if the key is NOT present?",
                "options": [
                    "Raises a KeyError exception",
                    "Returns the specified default value without raising an error",
                    "Inserts the key with None into the dictionary",
                    "Returns False"
                ],
                "correct_answer": 1,
                "explanation": "`.get()` safely retrieves values with an optional fallback default if the key is missing.",
                "concept": "Dictionaries"
            },
            {
                "question": "What is a Python decorator?",
                "options": [
                    "A CSS class applied to console logs",
                    "A design pattern using `@` that takes a function and extends its behavior without modifying it",
                    "A comment syntax for Sphinx documentation",
                    "A special module for graphics"
                ],
                "correct_answer": 1,
                "explanation": "Decorators are callable objects that take another function as an argument and return a wrapped version.",
                "concept": "Decorators & Functions"
            },
            {
                "question": "What will `[x**2 for x in range(4)]` return?",
                "options": ["[1, 4, 9, 16]", "[0, 1, 4, 9]", "[0, 2, 4, 6]", "[0, 1, 2, 3]"],
                "correct_answer": 1,
                "explanation": "`range(4)` generates 0, 1, 2, 3. Squaring each yields `[0, 1, 4, 9]`.",
                "concept": "List Comprehensions"
            }
        ]
    },
    "SQL & Relational Databases": {
        "Beginner": [
            {
                "question": "Which SQL clause is used to filter records AFTER an aggregation with `GROUP BY`?",
                "options": ["WHERE", "HAVING", "LIMIT", "FILTER"],
                "correct_answer": 1,
                "explanation": "`WHERE` filters individual rows before aggregation; `HAVING` filters aggregated groups.",
                "concept": "Aggregation & Filtering"
            },
            {
                "question": "What does a `LEFT JOIN` return?",
                "options": [
                    "Only rows that have matches in both tables",
                    "All rows from the left table and matched rows from the right table, with NULLs for unmatched right rows",
                    "All rows from both tables unconditionally",
                    "Only rows from the right table"
                ],
                "correct_answer": 1,
                "explanation": "`LEFT JOIN` preserves all records from the left table regardless of whether a matching record exists on the right.",
                "concept": "JOIN Operations"
            },
            {
                "question": "What does ACID stand for in relational database management systems?",
                "options": [
                    "Atomic, Consistent, Isolated, Durable",
                    "Automated, Connected, Indexed, Distributed",
                    "Actionable, Cached, Integrated, Dependable",
                    "Accessible, Clustered, Inherited, Dynamic"
                ],
                "correct_answer": 0,
                "explanation": "ACID properties ensure reliable processing of database transactions.",
                "concept": "Transactions & ACID"
            },
            {
                "question": "Which index type is the default and most widely used in PostgreSQL and MySQL?",
                "options": ["B-tree index", "Hash index", "GIN index", "BRIN index"],
                "correct_answer": 0,
                "explanation": "B-tree (Balanced Tree) indexes handle equality, range queries, and sort ordering with logarithmic time complexity.",
                "concept": "Indexing & Performance"
            },
            {
                "question": "What is the primary key constraint used for in a relational table?",
                "options": [
                    "To allow duplicate values for quick search",
                    "To uniquely identify each record in the table, enforcing non-null uniqueness",
                    "To link tables without foreign keys",
                    "To encrypt stored columns"
                ],
                "correct_answer": 1,
                "explanation": "A primary key column uniquely distinguishes each row and cannot contain NULL values.",
                "concept": "Schema Design"
            }
        ]
    },
    "HTML & CSS": {
        "Beginner": [
            {
                "question": "What is the purpose of semantic HTML elements such as `<header>`, `<main>`, `<nav>`, and `<article>`?",
                "options": [
                    "They are required for CSS flexbox to work",
                    "They provide meaningful structure to browsers, search engines, and screen readers",
                    "They prevent the page from reloading",
                    "They make JavaScript execute faster"
                ],
                "correct_answer": 1,
                "explanation": "Semantic tags convey the role and meaning of web page content clearly to assistive technology and user agents.",
                "concept": "Semantic HTML"
            },
            {
                "question": "In the CSS box model, what is the order from innermost to outermost?",
                "options": [
                    "Content, Padding, Border, Margin",
                    "Content, Margin, Border, Padding",
                    "Margin, Border, Padding, Content",
                    "Border, Content, Padding, Margin"
                ],
                "correct_answer": 0,
                "explanation": "From inside out: Content area -> Padding -> Border -> Margin.",
                "concept": "CSS Box Model"
            },
            {
                "question": "Which CSS property defines the primary axis alignment of items inside a Flex container?",
                "options": ["align-items", "justify-content", "flex-direction", "align-content"],
                "correct_answer": 1,
                "explanation": "`justify-content` controls alignment along the main axis; `align-items` controls alignment along the cross axis.",
                "concept": "Flexbox"
            }
        ]
    }
}


def get_fallback_quiz(skill_name: str, difficulty: str = "Beginner") -> list:
    """Returns a list of quiz questions for the given skill and difficulty."""
    skill_bank = FALLBACK_QUIZ_BANK.get(skill_name)
    if not skill_bank:
        # Fallback to JavaScript if skill not explicitly present
        skill_bank = FALLBACK_QUIZ_BANK.get("JavaScript", {})

    questions = skill_bank.get(difficulty) or skill_bank.get("Beginner") or []
    return questions

