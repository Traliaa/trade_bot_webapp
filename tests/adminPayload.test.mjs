import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTuneMode, normalizeRuntime, normalizeRejects } from '../src/lib/api/adminPayload.ts';

test('Go modes and PascalCase response fields map to UI', () => {
    assert.deepEqual([0,1,2,3].map(normalizeTuneMode), ['off','safe','auto','manual']);
    assert.equal(normalizeRuntime({ BreakoutPct:.01, V3MinConfirmScore:5 }).breakoutPct, .01);
    assert.deepEqual(normalizeRejects({ Total:12, Counts:{htf_conflict:12} }).reasons, {htf_conflict:12});
});
