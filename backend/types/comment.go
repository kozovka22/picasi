package types

type Comment struct {
	Author      string      `json:"author"`
	Content     string      `json:"content"`
	WeatherInfo WeatherInfo `json:"weatherInfo"`
}

func NewComment(r NewCommentRequest) Comment {
	return Comment{
		Author:      r.Author,
		Content:     r.Content,
		WeatherInfo: r.WeatherInfo,
	}
}
