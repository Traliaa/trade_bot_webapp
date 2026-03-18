import type {AccountSnapshot} from "$lib/api/tradeApi";
import type {UiAccountSnapshot} from "$lib/types/ui";

export function mapAccountSnapshot(account: AccountSnapshot | null | undefined): UiAccountSnapshot | null {
    if (!account) return null;

    return {
        totalEquity: account.TotalEquity ?? 0,
        availableBalance: account.AvailableBalance ?? 0,
        frozenBalance: account.FrozenBalance ?? 0,
        unrealizedPnL: account.UnrealizedPnL ?? 0,
        realizedPnL: account.RealizedPnL ?? 0,
        updatedAt: account.UpdatedAt ?? ''
    };
}