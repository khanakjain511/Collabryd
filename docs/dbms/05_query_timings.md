# Query Execution Timings & Plan Analysis

PostgreSQL database benchmark results for the Collabryd application workload. Every query was executed with `EXPLAIN (ANALYZE, BUFFERS)` 3 consecutive times. Write queries were executed inside `BEGIN; ... ROLLBACK;` blocks to preserve state. Individual plan files for each query are saved in `dbms/plans/`.

| Query | Type | What it does | Run 1 (ms) | Run 2 (ms) | Run 3 (ms) | Average (ms) | Scan type |
|---|---|---|---:|---:|---:|---:|---|
| R01 | READ | Student login by email verification | 1.611 | 0.158 | 0.154 | 0.641 | Index Scan |
| R02 | READ | Fetch student profile with academic details | 0.040 | 0.038 | 0.038 | 0.039 | Index Scan |
| R03 | READ | Fetch student skill portfolio with proficiency | 0.080 | 0.074 | 0.085 | 0.080 | Index Scan |
| R04 | READ | Fetch student interests and preferred contribution roles | 0.127 | 0.110 | 0.110 | 0.116 | Index Only Scan |
| R05 | READ | Fetch student achievements and social links | 0.089 | 0.075 | 0.080 | 0.081 | Index Only Scan |
| R06 | READ | Public student profile view with visibility check | 0.031 | 0.034 | 0.033 | 0.033 | Index Scan |
| R07 | READ | Search skills catalogue with student frequency | 0.155 | 0.124 | 0.122 | 0.134 | Index Scan |
| R08 | READ | Search interest domains by category | 0.093 | 0.088 | 0.108 | 0.096 | Index Scan |
| R09 | READ | List canonical roles with active project openings | 0.135 | 0.129 | 0.132 | 0.132 | Seq Scan |
| R10 | READ | Project discovery directory filtered by category and type | 0.117 | 0.083 | 0.092 | 0.097 | Index Only Scan |
| R11 | READ | Project discovery filtered by required skill | 0.069 | 0.135 | 0.129 | 0.111 | Index Scan |
| R12 | READ | Project detail page with owner and skill requirements | 0.093 | 0.106 | 0.255 | 0.151 | Index Only Scan |
| R13 | READ | List active project team members and project roles | 0.078 | 0.070 | 0.072 | 0.073 | Index Only Scan |
| R14 | READ | List project open role vacancies and requirements | 0.062 | 0.083 | 0.058 | 0.068 | Index Scan |
| R15 | READ | Candidate recommendation matching for project requirements | 0.798 | 0.459 | 0.424 | 0.560 | Index Scan |
| R16 | READ | Project recommendation matching for student skills | 0.269 | 0.615 | 0.249 | 0.378 | Index Only Scan |
| R17 | READ | Project owner pending applications dashboard | 0.062 | 0.065 | 0.076 | 0.068 | Index Only Scan |
| R18 | READ | Student submitted applications tracker | 0.057 | 0.062 | 0.069 | 0.063 | Index Only Scan |
| R19 | READ | Project team capacity check vs maximum limit | 0.053 | 0.054 | 0.054 | 0.054 | Index Scan |
| R20 | READ | Student conversation inbox with unread counts | 0.113 | 0.102 | 0.110 | 0.108 | Index Only Scan |
| R21 | READ | Direct conversation lookup between two users | 0.060 | 0.063 | 0.062 | 0.062 | Index Only Scan |
| R22 | READ | Cursor-paginated conversation message history | 0.077 | 0.072 | 0.076 | 0.075 | Index Only Scan |
| R23 | READ | Fetch unread in-app notifications for student | 0.027 | 0.020 | 0.021 | 0.023 | Index Scan |
| R24 | READ | Admin platform summary operational metrics | 0.260 | 0.225 | 0.221 | 0.235 | Seq Scan |
| R25 | READ | Admin audit log report with administrator details | 0.073 | 0.074 | 0.077 | 0.075 | Index Only Scan |
| W01 | WRITE | Register new student account | 0.186 | 0.245 | 0.161 | 0.197 | — |
| W02 | WRITE | Create email verification token | 0.412 | 0.399 | 0.448 | 0.420 | — |
| W03 | WRITE | Verify email and activate account | 0.365 | 0.180 | 0.175 | 0.240 | — |
| W04 | WRITE | Create or update student profile (upsert) | 0.247 | 0.195 | 0.175 | 0.206 | — |
| W05 | WRITE | Attach or update student skill (upsert) | 0.255 | 0.257 | 0.186 | 0.233 | — |
| W06 | WRITE | Create new project draft with owner | 1.079 | 0.497 | 0.462 | 0.679 | — |
| W07 | WRITE | Submit project application | 4.168 | 0.860 | 0.756 | 1.928 | — |
| W08 | WRITE | Accept application and update status | 0.056 | 0.055 | 0.062 | 0.058 | — |
| W09 | WRITE | Send chat message with sequence increment | 0.578 | 0.578 | 0.542 | 0.566 | — |
| W10 | WRITE | Mark in-app notifications as read | 0.138 | 0.130 | 0.128 | 0.132 | — |
