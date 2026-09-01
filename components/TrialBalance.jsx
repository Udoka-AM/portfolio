"use client";

import { DEBITS, CREDITS, DR_TOTAL, CR_TOTAL, LEDGER_CAPTION } from "@/content/ledger";
import { useCountUp, useInView, fmt } from "@/lib/useCountUp";
import s from "./TrialBalance.module.css";

const STAGGER = 90;

function Figure({ value, active, delay, tone }) {
  const n = useCountUp(value, active, delay);
  return <span className={`${s.fig} ${s[tone]}`}>{fmt(n)}</span>;
}

function Entry({ entry, side, active, delay }) {
  return (
    <tr className={s.row}>
      <th scope="row" className={s.acct}>
        <span className={s.acctName}>{entry.account}</span>
        <span className={s.acctNote}>{entry.note}</span>
      </th>
      <td className={s.col}>
        {side === "dr" ? (
          <Figure value={entry.value} active={active} delay={delay} tone="debit" />
        ) : null}
      </td>
      <td className={s.col}>
        {side === "cr" ? (
          <Figure value={entry.value} active={active} delay={delay} tone="credit" />
        ) : null}
      </td>
    </tr>
  );
}

export default function TrialBalance() {
  const [ref, live] = useInView();
  const totalDelay = (DEBITS.length + CREDITS.length) * STAGGER;

  return (
    <section className={s.ledger} ref={ref} aria-labelledby="tb-caption">
      <table className={s.table}>
        <caption className="sr-only" id="tb-caption">
          Trial balance. Debits are what has been built; credits are what it was built on.
        </caption>
        <thead>
          <tr className={s.head}>
            <th scope="col" className={s.headAcct}>
              Account
            </th>
            <th scope="col" className={`${s.col} ${s.debit}`}>
              Debit
            </th>
            <th scope="col" className={`${s.col} ${s.credit}`}>
              Credit
            </th>
          </tr>
        </thead>

        <tbody>
          {DEBITS.map((e, i) => (
            <Entry key={e.account} entry={e} side="dr" active={live} delay={i * STAGGER} />
          ))}
          {CREDITS.map((e, i) => (
            <Entry
              key={e.account}
              entry={e}
              side="cr"
              active={live}
              delay={(DEBITS.length + i) * STAGGER}
            />
          ))}
        </tbody>

        <tfoot>
          <tr className={s.totals}>
            <th scope="row" className={s.totalLabel}>
              Total
            </th>
            <td className={s.col}>
              <Figure value={DR_TOTAL} active={live} delay={totalDelay} tone="debit" />
            </td>
            <td className={s.col}>
              <Figure value={CR_TOTAL} active={live} delay={totalDelay} tone="credit" />
            </td>
          </tr>
          <tr className={s.diff}>
            <th scope="row" className={s.diffLabel}>
              Difference
            </th>
            {/* The zero is the assertion the whole section exists to make, so it
                is stated flatly and never animated. */}
            <td className={s.col} colSpan={2}>
              <span className={s.fig}>{fmt(DR_TOTAL - CR_TOTAL)}</span>
            </td>
          </tr>
        </tfoot>
      </table>

      <p className={s.caption}>{LEDGER_CAPTION}</p>
    </section>
  );
}
