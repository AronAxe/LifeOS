# Update Personal TELOS Workflow

## 1. Resolve authority

Resolve the principal-configured TELOS source and identify the exact target file/section. If no source is configured, ask where it lives; do not create a default. Read the current target before proposing a change.

## 2. Prepare the proposal

State:

- source path and target section/stable ID;
- current relevant text;
- exact proposed addition/replacement/retirement;
- formatting or metadata changes;
- backup/rollback method.

Do not treat a conversational reflection as authorization to write. For sensitive or structural changes, obtain explicit confirmation even when the category seems obvious.

## 3. Protect the source

Before mutation, create a recoverable backup in the source's existing backup convention or use its source-control history. Do not introduce a new backup tree silently. Verify that the backup exists and is readable.

## 4. Apply narrowly

Re-read the latest target, preserve stable IDs and local structure, and use a targeted patch. New typed entries receive the next valid ID. Avoid rewriting unrelated prose or normalizing the entire corpus.

Update changelog or review metadata only when the corpus already defines that convention or the principal approved it.

## 5. Verify

Read back the affected section and confirm:

- the intended change appears once;
- surrounding structure is intact;
- the backup/rollback path is valid;
- no unapproved files changed.

If verification fails, restore the backup before trying another approach.

## 6. Memory boundary

The TELOS file remains the source of truth. Optionally retain a separately accepted durable decision or fact in Hindsight when memory policy calls for it; never retain the full file merely because it was updated.

Report exact verified changes and stop. Do not claim an automatic backup, log, reload, or synchronization that was not actually performed.
