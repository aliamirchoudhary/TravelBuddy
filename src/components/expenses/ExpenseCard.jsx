import useExpenseStore from '../../store/expenseStore';

export default function ExpenseCard({ expense, onSettle }) {
  const { currency, rates } = useExpenseStore();
  const rateKey = `${expense.Currency}:${currency}`;
  const rate    = rates[rateKey] || 1;

  const converted = (amount) => (parseFloat(amount) * rate).toFixed(2);
  const allSettled = expense.Splits?.every(s => s.IsSettled);

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px',
      background: 'rgba(255,255,255,0.02)',
      opacity: allSettled ? 0.5 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--paper)' }}>{expense.Description}</p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--paper-dim)' }}>
            Paid by <strong style={{color: 'var(--paper-muted)'}}>{expense.PaidByName}</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: 'var(--accent)' }}>
            {currency} {converted(expense.TotalAmount)}
          </p>
          {currency !== expense.Currency && (
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--paper-dim)' }}>
              ({expense.Currency} {expense.TotalAmount})
            </p>
          )}
        </div>
      </div>

      {/* Split breakdown */}
      <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
        {expense.Splits?.map(split => (
          <div key={split.UserID} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '12px', fontWeight: 600,
            color: split.IsSettled ? 'var(--paper-dim)' : 'var(--paper-muted)',
            textDecoration: split.IsSettled ? 'line-through' : 'none',
            marginBottom: 4
          }}>
            <span>{split.DisplayName}</span>
            <span>{currency} {converted(split.AmountOwed)}</span>
          </div>
        ))}
      </div>

      {/* Date + Settle button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <span style={{ fontSize: '11px', color: 'var(--paper-dim)', fontWeight: 600 }}>
          {new Date(expense.CreatedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
        </span>
        {!allSettled && (
          <button
            onClick={() => onSettle(expense.ExpenseID)}
            style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', border: '1px solid var(--accent3)', borderRadius: '100px', color: 'var(--accent3)', background: 'transparent', cursor: 'pointer' }}
          >
            Mark Settled
          </button>
        )}
        {allSettled && <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--paper-dim)' }}>✓ Settled</span>}
      </div>
    </div>
  );
}
