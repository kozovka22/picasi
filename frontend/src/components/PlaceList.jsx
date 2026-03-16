export default function PlaceList({ places, selectedPlace, onSelect, query }) {
  if (places.length === 0 && query.length) return <p>Neexistuješ</p>;

  return (
    <ul>
      {places.map((p, i) => (
        <li key={i} onClick={() => { onSelect(p); }} role="button" aria-pressed={selectedPlace?.name === p.name}>
          {p.name}{p.region ? ` - ${p.region}` : ''}{selectedPlace?.name === p.name ? ' (Vybráno)' : ''}
        </li>
      ))}
    </ul>
  );
}