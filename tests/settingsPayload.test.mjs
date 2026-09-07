import { test } from 'node:test';
import assert from 'node:assert/strict';
import { durationToNs, settingsPayload } from '../src/lib/api/settingsPayload.ts';

test('durations match Go nanoseconds and reject invalid input', () => {
    assert.equal(durationToNs('1h30m'), 5400e9);
    assert.equal(durationToNs('500ms'), 500e6);
    assert.equal(durationToNs(''), 0);
    assert.throws(() => durationToNs('abc'));
    assert.throws(() => durationToNs('-1m'));
});

test('settings round trip preserves trailing guard fields and server field names', () => {
    const user = { settings: {
        TradingSettings: { leverage: 3, confirm_timeout: '1m', cooldown_per_symbol: '10m' },
        TrailingConfig: { BETriggerR: .6, be_trigger_r: .8, partial_enabled: false, stale_after_bars: 16 },
        FeatureFlags: { pro_mode: true }, PositionGuard: { test: {} }
    } };
    const before = structuredClone(user);
    const body = settingsPayload(user);
    assert.equal(body.user.settings.TradingSettings.confirm_timeout, 60e9);
    assert.equal(body.user.settings.TrailingConfig.BETriggerR, .8);
    assert.equal(body.user.settings.TrailingConfig.PartialEnabled, false);
    assert.equal(body.user.settings.TrailingConfig.stale_after_bars, 16);
    assert.deepEqual(body.user.settings.position_guard, user.settings.PositionGuard);
    assert.equal('be_trigger_r' in body.user.settings.TrailingConfig, false);
    assert.deepEqual(user, before);
});
