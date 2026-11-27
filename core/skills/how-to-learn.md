# How Agents Learn New Skills

When an agent learns a new skill — from a project, from a user, from external docs —
it is registered in the skill system so all of Legion benefits.

## Registering a new skill

1. Add an entry to `core/skills/registry.json`
2. Create a skill doc in `core/skills/[skill-name].md`
3. Log the learning as a LEARN event (see LIAP protocol)
4. MEMORY agent indexes it for recall

## Skill doc template

```markdown
# Skill: [Skill Name]
**Category:** [frontend | backend | cloud | data | security | process | domain]
**Agents:** [which agents have this skill]
**Confidence:** [0.0 - 1.0]
**Source:** [project-learnt | user-taught | external-doc | skills.sh]
**Learned:** YYYY-MM-DD

## What this skill covers
[Description of what the skill enables]

## Key patterns and approaches
[The important things to know]

## When to apply it
[Situations where this skill is relevant]

## Resources
[Links, docs, references]
```

## Skill propagation

When one agent learns a skill that is relevant to others, MEMORY notifies those agents.
For example: if FORGE learns a new database pattern, NEXUS is notified.
If PRISM learns a new animation technique, LENS is notified for code review awareness.
