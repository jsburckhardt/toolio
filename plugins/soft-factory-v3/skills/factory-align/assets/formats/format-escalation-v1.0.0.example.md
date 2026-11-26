<format id="ESCALATION_V1" name="Owner Escalation" purpose="Ask the owner one decision in plain language.">
- Ask through `ask_user`; at most about eight lines before the options.
- State where the issue comes from before what it blocks.
- Recommended option first, worded so accepting it is one click.

```markdown
**<TOPIC>**
- Origin: <ORIGIN>
- Impact: <IMPACT>
- Recommendation: <RECOMMENDATION> because <REASON>
- Alternative: <ALTERNATIVE> (cost: <ALTERNATIVE_COST>)
```
WHERE:
- <ALTERNATIVE> is String.
- <ALTERNATIVE_COST> is String.
- <IMPACT> is String; what is blocked and what happens if nothing changes.
- <ORIGIN> is String; for example "emitted by Copilot CLI, not our code".
- <REASON> is String.
- <RECOMMENDATION> is String.
- <TOPIC> is String; under eight words.
</format>
