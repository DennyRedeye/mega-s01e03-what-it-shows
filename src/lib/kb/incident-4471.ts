import notes from '../data/desk-notes.json' with { type: 'json' };
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from './causes.ts';

export type IncidentGroup = Omit<CauseGroup, 'cause'> & {
  cause: CauseGroup['cause'] | 'timing';
};

const timingIds = new Set(notes.oneDayMove);

export function reviewIncident(
  reports: Report[],
  tenantOf: (report: Report) => Tenant | undefined,
  ticket = 4471,
): IncidentGroup[] {
  const merged = uniqueById(reports).filter((report) => report.mergedInto === ticket);
  const timing = merged.filter((report) => timingIds.has(report.id));
  const groups: IncidentGroup[] = groupByCause(
    merged.filter((report) => !timingIds.has(report.id)),
    tenantOf,
  );

  if (timing.length) {
    const days = timing.map((report) => report.receivedAt.slice(0, 10)).sort();
    groups.push({
      cause: 'timing',
      reports: timing,
      taggedAs: timing.reduce<Record<string, number>>((tags, report) => {
        tags[report.meta.intakeTag] = (tags[report.meta.intakeTag] ?? 0) + 1;
        return tags;
      }, {}),
      tenants: new Set(timing.map((report) => report.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      mergedInto: [ticket],
    });
  }

  return groups.sort((a, b) => b.reports.length - a.reports.length);
}
