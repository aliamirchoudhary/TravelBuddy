import useExpenseStore from '../../store/expenseStore';

export default function CurrencyToggle() {
  const { currency, setCurrency, fetchRate } = useExpenseStore();
  const currencies = ['PKR', 'USD', 'EUR'];

  const handleToggle = (c) => {
    setCurrency(c);
    // Pre-fetch commonly needed rates immediately when user toggles
    // So the conversion delay is minimal for cards.
    currencies.forEach(target => {
      if (c !== target) {
        fetchRate(target, c); 
      }
    });
  };

  return (
    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '100px', border: '1px solid var(--border)' }}>
      {currencies.map(c => (
        <button
          key={c}
          onClick={() => handleToggle(c)}
          style={{
            flex: 1, padding: '6px 0', border: 'none', borderRadius: '100px', cursor: 'pointer',
            fontSize: '12px', fontWeight: 800, transition: 'all 0.2s ease',
            background: currency === c ? 'var(--accent)' : 'transparent',
            color: currency === c ? 'var(--dark)' : 'var(--paper-dim)'
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
