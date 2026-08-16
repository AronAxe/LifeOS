"""Schemas for the LifeOS Hermes runtime plugin."""

LIFEOS_ISA = {
    "name": "lifeos_isa",
    "description": "Create, inspect, and update an Ideal State Artifact (ISA) with evidence-bound completion criteria. Use for substantial LifeOS work that needs explicit state and verification.",
    "parameters": {
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["create", "get", "list", "update"], "description": "ISA operation."},
            "id": {"type": "string", "description": "ISA id for get or update."},
            "title": {"type": "string", "description": "Short task title for create."},
            "goal": {"type": "string", "description": "Observable target state for create."},
            "criteria": {"type": "array", "items": {"type": "string"}, "description": "Testable ISC statements for create."},
            "phase": {"type": "string", "enum": ["observe", "think", "plan", "build", "execute", "verify", "learn", "complete"], "description": "Next ISA phase for update."},
            "complete_criteria": {"type": "array", "items": {"type": "string"}, "description": "Criterion IDs proven complete, for example ISC-1."},
            "evidence": {"type": "object", "additionalProperties": {"type": "string"}, "description": "Evidence keyed by criterion ID."},
        },
        "required": ["action"],
    },
}

LIFEOS_EVENTS = {
    "name": "lifeos_events",
    "description": "Record deterministic LifeOS operational evidence or return a daily rollup. Use for session, app-focus, git-commit, and LifeOS action evidence; do not use it for private source documents or durable semantic memory.",
    "parameters": {
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["record", "rollup"], "description": "Event operation."},
            "type": {"type": "string", "enum": ["app-focus", "git-commit", "hermes-session", "lifeos-action"], "description": "Event type for record."},
            "detail": {"type": "object", "description": "Structured event data. app-focus uses app and interval_seconds; git-commit uses repo and sha."},
            "occurred_at": {"type": "string", "description": "Optional ISO-8601 event timestamp."},
            "date": {"type": "string", "description": "YYYY-MM-DD for rollup."},
        },
        "required": ["action"],
    },
}

LIFEOS_PUBLIC_PROFILE = {
    "name": "lifeos_public_profile",
    "description": "Produce a deterministic redacted preview of a proposed public LifeOS profile. This tool never publishes; the human must approve any deployment separately.",
    "parameters": {
        "type": "object",
        "properties": {
            "profile": {"type": "object", "description": "Proposed public fields to sanitize and preview."},
        },
        "required": ["profile"],
    },
}

LIFEOS_STATUS = {
    "name": "lifeos_status",
    "description": "Return LifeOS runtime status: active ISA progress and the latest deterministic evidence rollup. Use before assuming a LifeOS subsystem is configured or operational.",
    "parameters": {"type": "object", "properties": {}},
}
