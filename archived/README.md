# Archived Files

This directory contains historical documentation and old migration scripts that are no longer actively used but preserved for reference.

## Purpose

These files document the development journey and evolution of the Emoji Maker SaaS platform. While they're not needed for current development, they provide valuable context about past implementations, fixes, and architectural decisions.

## Directory Structure

```
archived/
├── assets/        # Historical media and image assets
│   └── landing-page-emojis/   # Original landing page images
├── docs/          # Historical implementation documentation
├── requirements/  # Original AI/developer instruction documents
└── sql/           # Old or superseded SQL migration scripts
```

## Archived Documentation (`docs/`)

### FOLDERS_SETUP.md
**Date Archived**: October 2025  
**Reason**: Superseded by comprehensive documentation in README.md and ARCHITECTURE.md  
**Context**: Original setup guide for the folders organization feature. All setup instructions are now consolidated in the main README and technical details are in ARCHITECTURE.md

### COMMIT_SUMMARY.md
**Date Archived**: October 2025  
**Reason**: Git commit summary from SaaS implementation phase  
**Context**: Documents the initial SaaS monetization commit and webhook 404 issue tracking

### IMPLEMENTATION_COMPLETE.md
**Date Archived**: October 2025  
**Reason**: Historical implementation notes from SaaS feature completion  
**Context**: Detailed summary of Phase 1-7 SaaS implementation including Stripe integration, credit system, and PNG metadata

### IMPLEMENTATION_SUMMARY.md
**Date Archived**: October 2025  
**Reason**: Historical implementation notes from folders feature completion  
**Context**: Documents the folder organization feature implementation including database schema, API routes, and frontend updates

### MIDDLEWARE_PROFILE_SYNC.md
**Date Archived**: October 2025  
**Reason**: Historical notes about profile sync implementation  
**Context**: Documents the transition from webhook-based profile creation to middleware-based automatic profile sync

### PROFILE_SYNC_FIX.md
**Date Archived**: October 2025  
**Reason**: Historical notes about profile sync bug fix  
**Context**: Documents the Clerk webhook URL issue and the profile sync API endpoint solution

### SETUP.md
**Date Archived**: October 2025  
**Reason**: Outdated basic setup guide, superseded by comprehensive README  
**Context**: Original quick setup guide before SaaS features were added. README.md now contains complete setup instructions

## Archived SQL Scripts (`sql/`)

### supabase_daily_credits.sql
**Date Archived**: October 2025  
**Reason**: Replaced by one-time credit system  
**Context**: Old daily credit refresh system. Superseded by `supabase_saas_migration.sql` which implements non-expiring credits

### supabase_fix_emoji_likes.sql
**Date Archived**: October 2025  
**Reason**: Fix likely already applied or superseded  
**Context**: Early fix for emoji likes functionality. Current schema handles likes correctly

### supabase_likes_rpc.sql
**Date Archived**: October 2025  
**Reason**: RPC likely already applied or superseded  
**Context**: Remote procedure call for likes system. Current implementation uses standard API routes

### supabase_SIMPLE_FIX.sql
**Date Archived**: October 2025  
**Reason**: Fix likely already applied  
**Context**: Early database fix during development

### supabase_SIMPLE_RPC.sql
**Date Archived**: October 2025  
**Reason**: RPC likely already applied  
**Context**: Early remote procedure call during development

### supabase_complete_schema.sql
**Date Archived**: October 2025  
**Reason**: Potentially superseded by modular migration files  
**Context**: Comprehensive schema definition. Current setup uses `supabase_saas_migration.sql` and `supabase_folders_schema.sql` for modular migrations

## Archived Requirements (`requirements/`)

### backend_instructions.md
**Date Archived**: October 2025  
**Reason**: AI/developer instruction document from initial development phase  
**Context**: Original instructions for building the backend API routes, database integration, and Supabase setup. Kept for historical reference of initial development requirements.

### frontend_instructions.md
**Date Archived**: October 2025  
**Reason**: AI/developer instruction document from initial development phase  
**Context**: Original instructions for building the frontend UI components, Replicate integration, and emoji generation flow. Kept for historical reference of initial design requirements.

### emoji_saas_requirements.md
**Date Archived**: October 2025  
**Reason**: AI/developer instruction document from SaaS implementation phase  
**Context**: Detailed SaaS monetization requirements including tier structure, credit system, Stripe integration specs, and database schema requirements. Comprehensive specification document that guided the SaaS implementation.

### Mockup.png
**Date Archived**: October 2025  
**Reason**: Copy archived for reference, original still referenced in README  
**Context**: UI mockup used during initial design phase. Still referenced in the main README.md for project showcase.

## Archived Assets (`assets/`)

### landing-page-emojis/
**Date Archived**: October 2025  
**Reason**: Duplicate images with inconsistent naming  
**Context**: Original landing page emoji images. These contained duplicates of images already in `public/gallery/` but with "(1)" suffixes and inconsistent naming. The `public/gallery/` versions are cleaner and actively used by the landing page components.

## Active Migration Scripts (Kept at Root)

For current database setup, use these files at the project root:

1. **supabase_saas_migration.sql** - Main SaaS feature migration (profiles, user_credits, stripe_transactions, updated emojis table)
2. **supabase_folders_schema.sql** - Folders feature migration (folders, emoji_folders tables)

## When to Reference Archived Files

Reference these files when you need to:
- Understand the evolution of a feature
- Debug issues related to past implementations
- Review architectural decisions and their rationale
- Understand why certain approaches were replaced
- Learn from the development history

## Restoration

If you need to restore any archived file:

```bash
# From project root
cp archived/docs/FILENAME.md ./
cp archived/sql/FILENAME.sql ./
```

## Note

These files are preserved for historical context. Do not delete this archive without team consensus, as it contains valuable development history and context that may be needed for troubleshooting or understanding architectural decisions.

---

**Last Updated**: October 2025  
**Archive Created By**: Automated housekeeping process

