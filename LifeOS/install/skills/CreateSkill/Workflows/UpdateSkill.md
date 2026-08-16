# Update Skill Workflow

1. Load the complete current skill with `skill_view`, including the linked file being changed.
2. Identify the smallest correction that satisfies the request and preserves working behavior.
3. Check consumers: related skills, cron jobs, plugins, scripts, and repository documentation.
4. Use `skill_manage(action="patch")` for a unique narrow replacement. Use `edit` only for a deliberate full rewrite after reading everything.
5. Use `write_file` or `remove_file` only for supported linked-resource paths.
6. Re-view the skill, run applicable tests/scripts, and verify the corrected behavior.
7. Check version and compatibility impact. Bump a declared version only when the repository/skill convention requires it; document renamed or removed interfaces and update consumers in the same governed change.
8. Reload skills if the active session needs the new body.

Never overwrite a complete skill from a partial read. Never edit another profile without explicit direction. If a skill was used and proved stale or wrong, fix it before finishing the task that exposed the defect.
