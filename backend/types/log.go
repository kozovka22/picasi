package types

import "time"

type Log struct {
	ID        string    `json:"id"`
	Action    string    `json:"action"`
	Message   string    `json:"message"`
	User      string    `json:"user"`
	Timestamp time.Time `json:"timestamp"`
	Comment   *Comment  `json:"comment,omitempty"`
}

func NewLog(user, action, message string, comment *Comment) Log {
	return Log{
		Action:    action,
		Message:   message,
		User:      user,
		Timestamp: time.Now(),
		Comment:   comment,
	}
}
