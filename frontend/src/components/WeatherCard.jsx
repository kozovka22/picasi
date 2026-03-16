export default function WeatherCard({ selectedPlace, currentWeather, weatherLoading, weatherError }) {
  if (!selectedPlace) return null;
  if (weatherLoading) return <p>Načítám...</p>;
  if (weatherError) return <p>Nenačtu!</p>;
  if (!currentWeather) return <p>No weather data</p>;

  const w = currentWeather.current;
  return (
    <div className="weather_card">
      <h1>P*časí</h1>
      <h2>Pro vegetiště {selectedPlace.name}</h2>
      <div>
        <img src={w.condition.icon.startsWith('http') ? w.condition.icon : 'https:' + w.condition.icon} alt={w.condition.text} />
        <h3>{w.temp_c} °C</h3>
      </div>
      <p>Pocitově je <b>{w.feelslike_c} °C</b></p>
      <p>Větřík fučá <b>{w.wind_kph} km/h</b></p>
      <p>Humidita činí <b>{w.humidity} %</b></p>
    </div>
  );
}