doctor:
    @node -e 'if (Number(process.versions.node.split(".")[0]) < 20) process.exit(1); console.log(process.version)'
    @git --version
    @git config --local --get user.name
    @git config --local --get user.email
    @test "$(git config --get commit.gpgsign)" = true
    @git config --get user.signingkey >/dev/null

verify-focused:
    node plugins/soft-factory-v2/tests/validate.mjs
    node --check plugins/soft-factory-v2/skills/factory-deliver/scripts/worktrees.mjs
    node --test plugins/soft-factory-v2/tests/worktrees.test.mjs

verify: verify-focused
    git diff --check

risk:
    @echo 'High: this repository ships agent instructions and execution tooling; owner review is required before merge.'
