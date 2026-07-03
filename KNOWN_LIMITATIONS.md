# Known Limitations

Architect-Prime is intentionally broad: it preserves a multi-architecture and multi-language vision while stabilizing one production-quality baseline at a time.

## Current Beta Scope

Version `v0.2.0-beta` focuses on the Node.js TypeScript API using Prisma and SQLite. Other modules remain available as learning/reference scaffolds and are not yet advertised as production-ready.

## Limitations

| Area | Current Status | Notes |
|---|---|---|
| Node.js TypeScript | Beta baseline | Uses real Prisma persistence with SQLite, tests, coverage, and CI. Business-specific production hardening is still required. |
| PostgreSQL | Supported via PostgreSQL Prisma schema | Prisma requires the datasource provider to be selected at schema-generation time. Use `prisma/schema.postgresql.prisma` for PostgreSQL deployments. |
| Go High Performance | Baseline preview | Minimal HTTP service baseline exists; full repository/service/database implementation is still planned. |
| PHP Modern | Laravel-style scaffold | Core classes were added, but this is not yet a complete standalone Laravel application distribution. |
| Python Data Science | Preview | Syntax-valid utilities and requirements exist; full dataset examples and ML training walkthroughs are still pending. |
| Microservices Clean | Advanced scaffold | End-to-end Dockerized microservices runtime is not yet complete. |
| Serverless AWS | Scaffold | Missing handlers were added, but production IAM, observability, and deployment validation remain pending. |
| Firebase Functions | Scaffold | Build structure and service placeholders exist; full Firebase emulator validation remains pending. |
| Performance Benchmark | Not completed | No load testing or benchmark report has been produced yet. |
| Production Deployment | Not completed | Kubernetes manifest is a baseline; no production ingress, autoscaling, secrets manager, or cloud deployment has been verified. |

## Commercial Use Guidance

Architect-Prime can be used as a professional starter and portfolio foundation. For commercial production use, teams should:

1. Review all environment variables and secrets.
2. Run their own security scan.
3. Select the target database schema explicitly.
4. Add domain-specific authorization and persistence policies.
5. Complete module-specific production hardening before deployment.

## Pusaka Student Hub MVP Limitations

- Data disimpan di browser pengguna melalui `localStorage`, bukan cloud sync.
- Jika browser/cache dihapus, data lokal dapat hilang kecuali pengguna melakukan export JSON.
- Belum ada akun, login pengguna akhir, atau sinkronisasi antar perangkat.
- Kalkulator nilai bersifat bantuan sederhana dan tidak menggantikan aturan resmi kampus/sekolah.
- Website static MVP tidak menyimpan data pengguna di server.
