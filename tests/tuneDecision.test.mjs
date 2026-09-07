import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tuneDecisionMessage } from '../src/lib/api/adminPayload.ts';

test('tune explains cooldown, disabled mode and insufficient V3 data', () => {
    for (const reason of ['cooldown', 'off', 'too_few_rejects']) {
        const message = tuneDecisionMessage({ changed: false, decision: { Why: reason } });
        assert.ok(message.length > 25);
        assert.ok(!message.includes('Изменения применены'));
        assert.ok(!message.includes(reason));
    }
    assert.equal(tuneDecisionMessage({ changed: true, decision: { Why: 'adjusted' } }), 'Изменения применены');
});
