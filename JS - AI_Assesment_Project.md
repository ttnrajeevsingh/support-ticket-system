



## **Objective**

Demonstrate practical AI-assisted delivery through a realistic full-stack assignment. Each project is split into a mandatory Core and an optional Stretch tier. Core is a small, buildable application that serves as a vehicle for showing your AI workflow. Stretch is optional and shows more advanced practice.

**A clean, well-documented Core alone is a strong result.** Both options are looked at the same way; the difference is the depth of evidence you show.

## **Common Technical Requirements**

Whichever option you choose, every submission must include:

1. Frontend application

2. Backend API

3. Database persistence

4. Database setup or migration scripts

5. Seed or sample data

6. Input validation

7. Error handling

8. One working search or filter capability (Core); more in Stretch

9. At least one meaningful test tier (Core); more in Stretch

10. README setup instructions

11. Full prompt history

12. All planning, design, testing, debugging, review, reflection, and PR artifacts in the repository structure

*The full set of lifecycle artifacts is required regardless of option. Only the application surface area is small — the artifacts are the point.*

### **Database Requirement**

A database is mandatory. Acceptable options include PostgreSQL, MySQL, MongoDB, SQLite, H2, or any framework-supported local database. Provide your database choice, setup instructions, a schema/migration/initialization script, seed data, an environment variable example (if applicable), and steps to run locally.

### **Authentication**

Authentication is optional — the focus is AI-assisted engineering across the lifecycle, not auth. If implemented well it counts as Stretch evidence (login/logout, JWT or session auth, role-based access, protected routes, API authorization).

## **Project: Support Ticket Management System**

### **Business Context**

A small application for managing support tickets. Internal users create, update, comment on, search, and progress tickets through a defined lifecycle.

### **Core (Mandatory)**

**Entities**

User        (seeded only — no user-management UI required)  
\- id, name, email, role  
   
Ticket  
\- id, title, description, priority, status,  
  assignedTo, createdBy, createdAt, updatedAt  
   
Comment  
\- id, ticketId, message, createdBy, createdAt

**Features**

1. Create a ticket.

2. List tickets.

3. View ticket details.

4. Update ticket fields (title, description, priority, assignee).

5. Change ticket status through the enforced state machine.

6. Add comments to a ticket.

7. Keyword search and filter by status.

8. Persist all data; data survives restart.

9. Validate required fields; reject invalid input at the backend.

10. Show meaningful error states in the UI.

**Status state machine** *(the signature judgment piece — kept in Core)*

Open         \-\> In Progress  
In Progress  \-\> Resolved  
Resolved     \-\> Closed  
Open         \-\> Cancelled  
In Progress  \-\> Cancelled

Invalid transitions must be rejected by the backend and handled clearly in the frontend. This is deliberately the hardest part of Core because it is where engineering judgment shows.

**Mandatory test tier:** integration tests that prove the state-machine rules — valid transitions succeed, invalid transitions are rejected.

**Stretch (Optional — evidence toward C1.1)**

* Third entity or richer data model

* Full user CRUD and role management

* Authentication, protected routes, API authorization checks

* Filter by priority and assignee; sorting; pagination

* Additional test tiers: unit tests and edge-case/failure tests

* API documentation (Swagger / OpenAPI)

* Docker setup, CI workflow

* Reusable prompt templates, rules, or specs (persistent project context)

**Core Acceptance Criteria**

1. A user can create a ticket via the UI.

2. A user can view all tickets from the database.

3. A user can open a ticket detail view.

4. A user can update ticket fields and reassign.

5. A user can add comments.

6. Status changes only through valid transitions; invalid ones are rejected.

7. Keyword search and status filter work.

8. Data remains available after restart.

9. Backend validation prevents invalid records.

10. No secrets committed to the repo.

11. State-machine integration tests pass.

# **Tool-Specific Expectations**

### **Kiro**

Submit tool-specific/kiro-specs/ with requirements.md, design.md, tasks.md. Show that you reviewed and improved the generated spec, that your implementation followed it, that you updated it when needed, and that you used Kiro as a spec-driven tool rather than only a code generator.


## **About the questions**

The questions ask you to explain your work in your own words — your requirement understanding, how you used AI across the lifecycle, key code and design decisions, your testing and debugging approach, and what you'd improve. A few ask you to point to specific places in your repository (for example, the commit where you fixed an AI mistake), so keep your commit history and prompt history organized as you go.

**Be specific and honest.** This is for your own development, so there's no value in generic or inflated answers — they just produce less useful feedback. The clearer the picture you give of how you actually worked, the more useful your growth pointers will be.

## **Follow-up and coaching**

Your work is reviewed and a feedback report is shared with you. Sometimes a mentor or your competency owner may follow up to talk through your project and coach you on next steps — a short, supportive conversation, not a re-examination. This is part of how the competency helps you grow, not a hurdle.

# **What Good Looks Like**

The feedback weighs how you used AI across the lifecycle and how well you understand and own your solution — not just whether the app runs. At a high level:

### **Strong work usually shows**

* Clear understanding of the problem before coding, with good requirement breakdown and acceptance criteria

* Well-documented AI prompts with iteration — context-setting, refinement, and correction of wrong suggestions

* Clean, maintainable code and a working database setup that runs from the README

* Meaningful tests and clear evidence of debugging and review

* An honest reflection, the ability to explain trade-offs, and reusable workflow artifacts

### **Weaker work usually shows**

* Direct copy-paste from AI with little understanding; missing requirement analysis

* Missing or shallow prompt history; no clear design

* Broken setup instructions or no database persistence

* Superficial tests; no debugging or review evidence

* Generic documentation; inability to explain the generated code; no ownership of the result

*In short: the journey and your understanding matter as much as the final code. Make your thinking visible.*



# **Summary**

Your project should include a frontend, a backend API, database persistence, setup/migration files, seed data, validation, error handling, search/filter, tests, README instructions, AI prompt/workflow history, a reflection, and a PR description. Authentication is optional. You may use React, Node.js, Java, Python, or a full-stack combination.


