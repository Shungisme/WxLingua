# Version History

This directory tracks all version changes and migrations for WxLingua.

## Version Naming Convention

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Directory Structure

Each version has its own folder:

```
versions/
├── v0.0.1/
│   ├── CHANGES.md           # Detailed changes
│   ├── migration.sql        # Database migrations
│   ├── rollback.sql         # Rollback script
│   └── deployment-notes.md  # Special instructions
├── v1.0.0/
│   └── ...
└── README.md                # This file
```

## Current Version

**Latest Stable**: v0.0.1
**Latest Development**: v0.0.1

## Version Timeline

| Version | Date       | Type    | Description                |
| ------- | ---------- | ------- | -------------------------- |
| v0.0.1  | 2026-02-22 | Initial | Initial production release |

## Creating a New Version

1. **Create version directory**

   ```bash
   mkdir deployment/versions/v1.0.0
   ```

2. **Document changes** in `CHANGES.md`

3. **Create migration scripts**
   - `migration.sql`: Database schema changes
   - `rollback.sql`: How to rollback

4. **Add deployment notes** if special steps needed

5. **Update this README**

## Deployment Process

1. Review changes in version folder
2. Backup database
3. Run migrations
4. Deploy new version
5. Run health checks
6. Monitor for issues

## Rollback Process

1. Stop current version
2. Restore database backup
3. Run rollback script
4. Deploy previous version
5. Verify system health

## Migration Best Practices

- Test migrations on staging first
- Always create rollback scripts
- Document breaking changes
- Include data migrations if needed
- Plan for zero-downtime when possible

## Support

For version-specific issues:

- Check version's CHANGES.md
- Review deployment-notes.md
- Contact DevOps team
