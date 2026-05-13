import useExpenseStore from '../../store/expenseStore';

export default function SettlementSummary({ tripId }) {
  const { settlement, currency, rates } = useExpenseStore();

  if (!settlement || !settlement.length) return <p style={{ color: 'var(--paper-dim)', fontSize: '13px', margin: 0 }}>No expenses yet.</p>;

  // Build "A owes B" statements from net balances
  // Positive NetBalance = this user is owed money; Negative = this user owes money
  const debtors  = settlement.filter(u => u.NetBalance < 0);
  const creditors = settlement.filter(u => u.NetBalance > 0);

  const statements = debtors.map(d => {
    const creditor = creditors[0]; // simplified for 2-person trips; extend for groups
    const rateKey  = `PKR:${currency}`;
    const rate     = rates[rateKey] || 1;
    const amount   = Math.abs(d.NetBalance) * rate;
    return `${d.DisplayName} owes ${creditor?.DisplayName || 'Someone'}: ${currency} ${amount.toFixed(2)}`;
  });

  if (!statements.length) {
    return <p style={{ color: 'var(--accent)', fontSize: '13px', margin: 0, fontWeight: 600 }}>All settled up!</p>;
  }

  return (
    <div>
      <p style={{ fontWeight: 700, fontSize: '12px', marginBottom: '8px', color: 'var(--paper)', textTransform: 'uppercase', letterSpacing: 1 }}>📊 Settlement</p>
      {statements.map((s, i) => (
        <div key={i} style={{
          background: 'rgba(232,84,26,0.1)', border: '1px solid rgba(232,84,26,0.2)', borderRadius: 'var(--r-sm)', padding: '10px 12px',
          fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--accent)'
        }}>
          {s}
        </div>
      ))}
    </div>
  );
}
