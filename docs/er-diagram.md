# Entity-Relationship (ER) Diagram
## Government Recruitment Examination Management System (GREMS)

The following Mermaid ER diagram illustrates all **9 core relational tables**, their primary keys, foreign keys, attribute data types, and cardinality multipliers.

```mermaid
erDiagram
    PROFILES ||--o| CANDIDATES : "has demographic dossier"
    CANDIDATES ||--o{ EDUCATIONAL_QUALIFICATIONS : "records"
    CANDIDATES ||--o{ APPLICATIONS : "submits"
    EXAMINATIONS ||--o{ APPLICATIONS : "receives"
    EXAMINATIONS ||--o{ EXAMINATION_CENTERS : "allocates"
    EXAM_CENTERS ||--o{ EXAMINATION_CENTERS : "hosts"
    EXAM_CENTERS ||--o{ APPLICATIONS : "allocated venue"
    APPLICATIONS ||--o| ADMIT_CARDS : "issues"
    APPLICATIONS ||--o| RESULTS : "evaluates into"

    PROFILES {
        uuid id PK "references auth.users"
        varchar email UK
        varchar role "admin or candidate"
        timestamptz created_at
        timestamptz updated_at
    }

    CANDIDATES {
        uuid candidate_id PK
        uuid user_id FK,UK "references profiles"
        varchar candidate_number UK
        varchar full_name
        date date_of_birth
        varchar gender "Male, Female, Other, Prefer not to say"
        varchar phone_number
        text address
        varchar city
        varchar state
        varchar pincode
        varchar category "General, OBC, SC, ST, EWS"
        timestamptz created_at
        timestamptz updated_at
    }

    EDUCATIONAL_QUALIFICATIONS {
        uuid qualification_id PK
        uuid candidate_id FK "references candidates"
        varchar qualification_level "SSLC, PUC, Diploma, UG, PG"
        varchar institution_name
        varchar board_or_university
        int passing_year
        numeric percentage
        timestamptz created_at
    }

    EXAMINATIONS {
        uuid examination_id PK
        varchar examination_code UK
        varchar examination_name
        varchar conducting_authority
        text description
        text eligibility_criteria
        date application_start_date
        date application_end_date
        date examination_date
        numeric application_fee
        int total_vacancies
        varchar examination_status "draft, published, closed, completed"
        uuid created_by FK "references profiles"
        timestamptz created_at
        timestamptz updated_at
    }

    EXAM_CENTERS {
        uuid center_id PK
        varchar center_code UK
        varchar center_name
        text address
        varchar city
        varchar state
        varchar pincode
        varchar contact_number
        int total_capacity
        timestamptz created_at
    }

    EXAMINATION_CENTERS {
        uuid examination_id PK,FK "references examinations"
        uuid center_id PK,FK "references exam_centers"
        int allocated_capacity
        timestamptz created_at
    }

    APPLICATIONS {
        uuid application_id PK
        varchar application_number UK
        uuid candidate_id FK "references candidates"
        uuid examination_id FK "references examinations"
        uuid center_id FK "references exam_centers"
        timestamptz applied_at
        varchar application_status "submitted, under_review, accepted, rejected, withdrawn"
        varchar payment_status "pending, paid, waived"
        text remarks
        timestamptz updated_at
    }

    ADMIT_CARDS {
        uuid admit_card_id PK
        uuid application_id FK,UK "references applications"
        varchar admit_card_number UK
        varchar roll_number UK
        date issue_date
        time reporting_time
        text examination_instructions
        text admit_card_file_url
        timestamptz created_at
    }

    RESULTS {
        uuid result_id PK
        uuid application_id FK,UK "references applications"
        numeric marks_obtained
        numeric maximum_marks
        int rank
        varchar result_status "pass, fail, withheld"
        timestamptz published_at
        text remarks
        timestamptz created_at
    }
```

---

## Academic Cardinality Legend

| Notation | Relationship Type | DBMS Implementation |
| :--- | :--- | :--- |
| `PROFILES ||--o| CANDIDATES` | Exactly One-to-Optional One (1 : 0..1) | `candidates.user_id UNIQUE NOT NULL REFERENCES profiles(id)` |
| `CANDIDATES ||--o{ EDUCATIONAL_QUALIFICATIONS` | One-to-Many (1 : N) | `educational_qualifications.candidate_id REFERENCES candidates(candidate_id)` |
| `CANDIDATES ||--o{ APPLICATIONS` | One-to-Many (1 : N) | `applications.candidate_id REFERENCES candidates(candidate_id)` |
| `EXAMINATIONS ||--o{ APPLICATIONS` | One-to-Many (1 : N) | `applications.examination_id REFERENCES examinations(examination_id)` |
| `EXAMINATIONS ||--o{ EXAMINATION_CENTERS }o--|| EXAM_CENTERS` | Many-to-Many (M : N) | Composite Key `(examination_id, center_id)` on `examination_centers` |
| `APPLICATIONS ||--o| ADMIT_CARDS` | One-to-Optional One (1 : 0..1) | `admit_cards.application_id UNIQUE NOT NULL REFERENCES applications(application_id)` |
| `APPLICATIONS ||--o| RESULTS` | One-to-Optional One (1 : 0..1) | `results.application_id UNIQUE NOT NULL REFERENCES applications(application_id)` |

