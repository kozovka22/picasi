package types

type StdResponse struct {
	Success bool   `json:"ok"`
	Message string `json:"message,omitempty"`
}
