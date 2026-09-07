<script lang="ts">
    import AdminStrategyPage from '$lib/components/admin/AdminStrategyPage.svelte';
    import { adminAccess } from '$lib/auth/admin';
</script>

{#if $adminAccess}
    <AdminStrategyPage />
{:else}
    <p>Этот раздел доступен только администратору.</p>
{/if}
