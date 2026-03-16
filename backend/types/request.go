package types

type NewCommentRequest struct {
	Author      string      `json:"author"`
	Content     string      `json:"content"`
	WeatherInfo WeatherInfo `json:"weatherInfo"`
}
