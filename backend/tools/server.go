package tools

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"picasi/types"
	"strconv"
	"time"

	obm "github.com/tardigrade-sw/OBM" //by kryštof fabel :3
)

type Server struct {
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) Serve(addr string) error {
	http.HandleFunc("/api/comment/new", s.NewComment)
	http.HandleFunc("/api/comment/list", s.ListComments)

	fmt.Printf("Listening on %s", addr)
	return http.ListenAndServe(addr, nil)
}

func (s *Server) NewComment(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("[%s] %s %s\n", time.Now().Format(time.RFC3339), r.Method, r.URL.Path)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	payload, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Printf("Error reading body: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	request := types.NewCommentRequest{}
	err = json.NewDecoder(bytes.NewReader(payload)).Decode(&request)
	if err != nil {
		fmt.Printf("Error decoding json: %v\n JSON: %s", err, string(payload))
		w.WriteHeader(http.StatusBadRequest) // 400 is better for decode errors
		resp := types.StdResponse{Success: false, Message: fmt.Sprintf("Error decoding json: %v", err)}
		json.NewEncoder(w).Encode(resp)
		return
	}

	fmt.Printf("DEBUG: Parsed payload: %+v\n", request)

	// Now we can use the original []byte payload for obm.Save
	err = obm.Save(obm.DBS["picasi.db"], "comments", strconv.FormatInt(time.Now().Unix(), 16), payload)
	if err != nil {
		fmt.Printf("Error saving to db: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		resp := types.StdResponse{Success: false, Message: fmt.Sprintf("Error saving to db: %v", err)}
		json.NewEncoder(w).Encode(resp)
		return
	}

	w.WriteHeader(http.StatusCreated)
	resp := types.StdResponse{Success: true, Message: "Comment created successfully"}
	err = json.NewEncoder(w).Encode(resp)
}

func (s *Server) ListComments(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("[%s] %s %s\n", time.Now().Format(time.RFC3339), r.Method, r.URL.Path)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	page, err := strconv.ParseInt((r.URL.Query().Get("page")), 10, 64)
	if err != nil {
		fmt.Printf("Error parsing page: %v\n", err)
		w.WriteHeader(http.StatusBadRequest)
		resp := types.StdResponse{Success: false, Message: "Invalid page parameter"}
		json.NewEncoder(w).Encode(resp)
		return
	}
	pagesize := 4

	var comments []string
	err = obm.List(obm.DBS["picasi.db"], "comments", &comments)
	if err != nil {
		fmt.Printf("Error listing from db: %v\n", err)
		w.WriteHeader(http.StatusOK) // Return 200 even if bucket not found so frontend doesn't crash
		w.Write([]byte("[]"))
		return
	}

	total := len(comments)
	start := int(page) * pagesize
	end := start + pagesize

	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	paged := comments[start:end]

	var parsed []types.Comment
	for _, raw := range paged {
		var c types.Comment
		if err := json.Unmarshal([]byte(raw), &c); err == nil {
			parsed = append(parsed, c)
		}
	}

	json.NewEncoder(w).Encode(parsed)
}
