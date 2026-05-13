import PlaceCard from './PlaceCard';
import { motion } from 'framer-motion';

export default function PlaceCardGrid({ items, type }) {
  if (!items?.length)
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
          No {type}s found for this city yet. Our scouts are working on it!
        </p>
      </div>
    );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '24px',
      paddingBottom: '40px'
    }}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <PlaceCard item={item} type={type} />
        </motion.div>
      ))}
    </div>
  );
}
