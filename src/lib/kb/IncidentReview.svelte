<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { reviewIncident } from '#lib/kb/incident-4471';
  import { tenantOf } from '#lib/kb/locales';

  const groups = reviewIncident(reports as Report[], tenantOf);
  const merged = uniqueById(reports as Report[]).filter((report) => report.mergedInto === 4471);
  const timing = groups.find((group) => group.cause === 'timing')?.reports ?? [];
  const labels = {
    parser: 'Shared parser reads day-first dates month first',
    hint: 'booking-v3 date hint disagrees with tenant parsing',
    timing: 'One-day and timing symptoms: root cause unconfirmed',
    unplaced: 'Unplaced: investigate missing tenant or locale evidence',
  };
  const repo = 'https://github.com/DennyRedeye/mega-s01e03-what-it-shows';
  const issues = { parser: 3, hint: 1, timing: 2 };
  const status = {
    parser: 'Completed: parser fixed',
    hint: 'Not planned: booking-v3 retired',
    timing: 'Open: needs investigation',
    unplaced: 'Open: needs classification',
  };
</script>

<p>
  The export contains <strong>{reports.length}</strong> rows and
  <strong>{merged.length}</strong> unique reports merged into #4471.
  <strong>{reports.length - uniqueById(reports as Report[]).length}</strong> overlapping rows do not represent additional reports.
  The exported parser and hint groups count each report ID once. The timing row is an
  overlapping investigation subset within parser, not additional reports; do not add it
  to the exported total.
</p>

<table>
  <thead>
    <tr><th>Problem</th><th>Reports</th><th>Tenants</th><th>First to last report</th><th>Engineering status</th><th>Ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as group (group.cause)}
      <tr>
        <td>{labels[group.cause]}</td>
        <td>{group.reports.length}</td>
        <td>{group.tenants}</td>
        <td>{group.firstSeen} to {group.lastSeen}</td>
        <td>{status[group.cause]}</td>
        <td>
          {#if group.cause === 'unplaced'}
            Needs a separate investigation ticket
          {:else}
            <a href="{repo}/issues/{issues[group.cause]}">#{issues[group.cause]}</a>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<h3>Intake labels are not cause evidence</h3>

<table>
  <thead><tr><th>Reviewed problem</th><th>Tagged parser</th><th>Tagged hint</th></tr></thead>
  <tbody>
    {#each groups as group (group.cause)}
      <tr>
        <td><code>{group.cause}</code></td>
        <td>{group.taggedAs.parser ?? 0}</td>
        <td>{group.taggedAs.hint ?? 0}</td>
      </tr>
    {/each}
  </tbody>
</table>

<h3>Timing reports kept separate</h3>

<p>
  The desk's <code>oneDayMove</code> notes flag these report IDs. Their bodies do not describe
  the month/day swaps used to support the parser and hint groups. This is an investigation
  ticket, not proof that all these reports share one timezone or delivery bug. The exported
  desk view counts them under parser and footnotes them there; this review preserves that
  count while making the uncertainty visible.
</p>

{#each timing as report (report.id)}
  <p><strong>{report.id}</strong> · {report.tenant} · {report.channel}</p>
  <blockquote>{report.body}</blockquote>
{/each}

<h3>Exported groups and overlapping investigation audit</h3>

<details>
  <summary>Show every report ID in its reviewed group</summary>
  {#each groups as group (group.cause)}
    <h4>{labels[group.cause]}</h4>
    <p>{group.reports.map((report) => report.id).join(', ')}</p>
  {/each}
</details>
