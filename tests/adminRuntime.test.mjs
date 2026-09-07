import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRuntime, normalizeTuneMode } from '../src/lib/api/adminPayload.ts';

test('V3 tuning fields use the actual backend parameters', () => {
    const runtime = normalizeRuntime({ V3MinConfirmScore: 7, V3VolumeMinRatio: .9, V3StrongCloseMin: .7, V3StrongCloseMax: .3 });
    assert.equal(runtime.v3MinConfirmScore, 7);
    assert.equal(runtime.v3VolumeMinRatio, .9);
    assert.equal(runtime.v3StrongCloseMin, .7);
    assert.equal(runtime.v3StrongCloseMax, .3);
    assert.equal(normalizeRuntime({ v3MinConfirmScore: 6 }).v3MinConfirmScore, 6);
});

test('missing runtime values and modes are not invented as zero/off', () => {
    assert.equal(normalizeRuntime({}).breakoutPct, undefined);
    assert.equal(normalizeRuntime({ V3VolumeMinRatio: 'invalid' }).v3VolumeMinRatio, undefined);
    assert.equal(normalizeTuneMode(undefined), 'unknown');
    assert.equal(normalizeTuneMode(2), 'auto');
});
