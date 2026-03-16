package types

type Comment struct {
	ID          string      `json:"id"`
	Author      string      `json:"author"`
	Content     string      `json:"content"`
	WeatherInfo WeatherInfo `json:"weatherInfo"`
	Hidden      bool        `json:"hidden"`
}

func NewComment(r NewCommentRequest) Comment {
	return Comment{
		Author:      r.Author,
		Content:     r.Content,
		WeatherInfo: r.WeatherInfo,
		Hidden:      false,
	}
}
