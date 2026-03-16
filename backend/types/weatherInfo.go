package types

type WeatherInfo struct {
	Location      string  `json:"location"`
	Temperature   float64 `json:"temperature"`
	FeelsLike     float64 `json:"temperature_feels_like"`
	Humidity      float64 `json:"humidity"`
	WindSpeed     float64 `json:"wind_speed"`
	ConditionIcon string  `json:"condition_icon"`
}

type Location struct {
	Name string `json:"name"`
}

type CurrentWeather struct {
	Temperature          float64 `json:"temp_c"`
	TemperatureFeelsLike float64 `json:"feelslike_c"`
	Humidity             float64 `json:"humidity"`
	WindSpeed            float64 `json:"wind_kph"`
	Condition            Condition
}

type Condition struct {
	ConditionIcon string `json:"icon"`
}

type WeatherOutfo struct {
	Location             string  `json:"location"`
	Temperature          float64 `json:"temperature"`
	TemperatureFeelsLike float64 `json:"temperature_feels_like"`
	Humidity             float64 `json:"humidity"`
	WindSpeed            float64 `json:"wind_speed"`
	ConditionIcon        string  `json:"condition_icon"`
}
