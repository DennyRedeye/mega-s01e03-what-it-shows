import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import reports from '../data/reports-4471.json' with { type: 'json' };
import { type Report, type Tenant } from './causes.ts';
import { reviewIncident } from './incident-4471.ts';

const directory = new URL('../data/tenants/', import.meta.url);
const tenants: Tenant[] = readdirSync(directory).map((name) =>
  JSON.parse(readFileSync(new URL(name, directory), 'utf8')),
);
const tenantOf = (report: Report) => tenants.find((tenant) => tenant.handle === report.tenant);

test('separates timing evidence before tenant-based date classification and counts unique reports', () => {
  const groups = reviewIncident(reports as Report[], tenantOf);
  assert.deepEqual(
    groups.map((group) => [group.cause, group.reports.length]),
    [['parser', 374], ['hint', 33], ['timing', 5]],
  );
  assert.deepEqual(
    groups.find((group) => group.cause === 'timing')?.reports.map((report) => report.id),
    ['R-41202', 'R-41209', 'R-41236', 'R-41344', 'R-41620'],
  );
  assert.equal(new Set(groups.flatMap((group) => group.reports.map((report) => report.id))).size, 412);
});

test('uses the tenant form and locale rather than the browser intake tag', () => {
  const parser: Report = {
    id: 'test-parser',
    receivedAt: '2026-10-04T10:00:00Z',
    tenant: 'morrow.tax',
    channel: 'form',
    subject: 'Date is wrong',
    body: 'Month and day were swapped.',
    meta: { browserLocale: 'en-US', intakeTag: 'hint' },
    mergedInto: 4471,
    mergedAt: null,
  };
  const hint: Report = { ...parser, id: 'test-hint', tenant: 'alder.physio', meta: { browserLocale: 'en-US', intakeTag: 'parser' } };
  const groups = reviewIncident([parser, hint, parser], tenantOf);
  assert.deepEqual(groups.find((group) => group.cause === 'parser')?.reports, [parser]);
  assert.deepEqual(groups.find((group) => group.cause === 'hint')?.reports, [hint]);
});

test('does not assign an unknown tenant or a report outside the ticket to a known cause', () => {
  const report: Report = {
    id: 'test-unknown',
    receivedAt: '2026-10-04T10:00:00Z',
    tenant: 'unknown',
    channel: 'form',
    subject: 'Date is wrong',
    body: 'Needs investigation.',
    meta: { browserLocale: 'en-GB', intakeTag: 'parser' },
    mergedInto: 4471,
    mergedAt: null,
  };
  const groups = reviewIncident([report, { ...report, id: 'other-ticket', mergedInto: 9999 }], tenantOf);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].cause, 'unplaced');
  assert.equal(groups[0].reports.length, 1);
});
