package tools

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"picasi/types"
	"strconv"
	"strings"
	"sync"
	"time"

	obm "github.com/tardigrade-sw/OBM" //by kryštof fabel :3
)

type Server struct {
	sessions map[string]time.Time
	mu       sync.RWMutex
}

func NewServer() *Server {
	return &Server{
		sessions: make(map[string]time.Time),
	}
}

// Validace tokenu
func (s *Server) IsAdmin(r *http.Request) bool {
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return false
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")

	s.mu.RLock()
	expiry, exists := s.sessions[token]
	s.mu.RUnlock()

	if !exists || time.Now().After(expiry) {
		return false
	}
	return true
}

// Inicializace API routes
func (s *Server) Serve(addr string) error {
	http.HandleFunc("/api/comment/new", s.NewComment)
	http.HandleFunc("/api/comment/list", s.ListComments)
	http.HandleFunc("/api/comment/toggle-hide", s.ToggleHideComment)
	http.HandleFunc("/api/login", s.Login)
	http.HandleFunc("/api/logs", s.ListLogs)

	fmt.Printf("Listening on %s", addr)
	return http.ListenAndServe(addr, nil)
}

// Schovávání komentářů
func (s *Server) ToggleHideComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if !s.IsAdmin(r) {
		fmt.Printf("DEBUG: Auth failed for %s. Header: %s\n", r.URL.Path, r.Header.Get("Authorization"))

		// Neautorizované
		logEntry := types.NewLog("unauthorized", "UNAUTHORIZED_TOGGLE", fmt.Sprintf("Unauthorized attempt to hide/show comment at %s (IP: %s)", r.URL.Path, r.RemoteAddr), nil)
		logID := strconv.FormatInt(time.Now().UnixNano(), 16)
		logPayload, _ := json.Marshal(logEntry)
		obm.Save(obm.DBS["picasi.db"], "logs", logID, logPayload)

		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		fmt.Printf("DEBUG: Missing ID in query params\n")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	fmt.Printf("DEBUG: Toggling comment ID: %s\n", id)

	// Fetch z databáze
	var raw string
	err := obm.Find(obm.DBS["picasi.db"], "comments", id, &raw)
	if err != nil {
		fmt.Printf("DEBUG: OBM Find failed for ID %s: %v\n", id, err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var comment types.Comment
	if err := json.Unmarshal([]byte(raw), &comment); err != nil {
		fmt.Printf("DEBUG: JSON Unmarshal failed: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	comment.Hidden = !comment.Hidden
	updatedPayload, _ := json.Marshal(comment)

	// Uložení do databáze
	err = obm.Save(obm.DBS["picasi.db"], "comments", id, updatedPayload)
	if err != nil {
		fmt.Printf("DEBUG: OBM Save failed: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Logování
	action := "HIDE"
	if !comment.Hidden {
		action = "UNHIDE"
	}
	logEntry := types.NewLog("root", action, fmt.Sprintf("%s comment %s", action, id), &comment)
	logID := strconv.FormatInt(time.Now().UnixNano(), 16)
	logPayload, _ := json.Marshal(logEntry)
	obm.Save(obm.DBS["picasi.db"], "logs", logID, logPayload)

	fmt.Printf("DEBUG: Successfully toggled comment ID %s to hidden=%v\n", id, comment.Hidden)
	json.NewEncoder(w).Encode(types.StdResponse{Success: true, Message: "Toggled status"})
}

// Login z usernamu root (později dodělat admin management)
func (s *Server) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Jednoduché ověření hesla z .env
	if credentials.Username == "root" && credentials.Password == os.Getenv("ROOT_PW") {
		token := strconv.FormatInt(time.Now().UnixNano(), 36)
		s.mu.Lock()
		s.sessions[token] = time.Now().Add(24 * time.Hour) // Validní na 24 hodin
		s.mu.Unlock()

		// Logování LOGIN
		logEntry := types.NewLog("root", "LOGIN", "Admin login successful", nil)
		logID := strconv.FormatInt(time.Now().UnixNano(), 16)
		logPayload, _ := json.Marshal(logEntry)
		obm.Save(obm.DBS["picasi.db"], "logs", logID, logPayload)

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"token":   token,
		})
	} else {
		// Vemeno zapomnělo heslo lol
		logEntry := types.NewLog(credentials.Username, "FAILED_LOGIN", fmt.Sprintf("Failed login attempt from %s", r.RemoteAddr), nil)
		logID := strconv.FormatInt(time.Now().UnixNano(), 16)
		logPayload, _ := json.Marshal(logEntry)
		obm.Save(obm.DBS["picasi.db"], "logs", logID, logPayload)

		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(types.StdResponse{Success: false, Message: "Invalid credentials"})
	}
}

// Nové komentáře se rodí zde!!!
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
		w.WriteHeader(http.StatusBadRequest)
		resp := types.StdResponse{Success: false, Message: fmt.Sprintf("Error decoding json: %v", err)}
		json.NewEncoder(w).Encode(resp)
		return
	}

	fmt.Printf("DEBUG: Parsed payload: %+v\n", request)

	comment := types.NewComment(request)

	// Unique ID z timestampu
	comment.ID = strconv.FormatInt(time.Now().UnixNano(), 16)

	commentPayload, err := json.Marshal(comment)
	if err != nil {
		fmt.Printf("Error marshaling comment: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Využití Fabelovo OBM pro various things s pomocí Fabela
	err = obm.Save(obm.DBS["picasi.db"], "comments", comment.ID, commentPayload)
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

// Seznam komentářů, ukazuje jen neschované komentáře pokud user není adminem
func (s *Server) ListComments(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("[%s] %s %s\n", time.Now().Format(time.RFC3339), r.Method, r.URL.Path)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	page, err := strconv.ParseInt((r.URL.Query().Get("page")), 10, 64)
	if err != nil {
		page = 1
	}
	idxPage := page - 1
	if idxPage < 0 {
		idxPage = 0
	}

	pagesize := 10

	var comments []string
	err = obm.List(obm.DBS["picasi.db"], "comments", &comments)
	if err != nil {
		fmt.Printf("Error listing from db: %v\n", err)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"data":        []types.Comment{},
			"page":        page,
			"total":       0,
			"total_pages": 0,
		})
		return
	}

	isAdmin := r.URL.Query().Get("admin") == "true"
	if isAdmin && !s.IsAdmin(r) {
		isAdmin = false
	}

	var allParsed []types.Comment
	for _, raw := range comments {
		var c types.Comment
		if err := json.Unmarshal([]byte(raw), &c); err == nil {
			allParsed = append(allParsed, c)
		}
	}

	var filtered []types.Comment
	for i := len(allParsed) - 1; i >= 0; i-- {
		c := allParsed[i]
		if isAdmin || !c.Hidden {
			filtered = append(filtered, c)
		}
	}

	// Stránkování
	total := len(filtered)
	totalPages := (total + pagesize - 1) / pagesize
	start := int(idxPage) * pagesize
	end := start + pagesize

	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	paged := filtered[start:end]
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data":        paged,
		"page":        page,
		"total":       total,
		"total_pages": totalPages,
	})
}

// ListLogs vrací seznam logů pro administrátora
func (s *Server) ListLogs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Pouze pro adminy
	if !s.IsAdmin(r) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	page, _ := strconv.ParseInt(r.URL.Query().Get("page"), 10, 64)
	if page < 1 {
		page = 1
	}
	pageSize := 20

	var logsRaw []string
	err := obm.List(obm.DBS["picasi.db"], "logs", &logsRaw)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"data":        []types.Log{},
			"page":        page,
			"total":       0,
			"total_pages": 0,
		})
		return
	}

	var allLogs []types.Log
	for _, raw := range logsRaw {
		var l types.Log
		if err := json.Unmarshal([]byte(raw), &l); err == nil {
			allLogs = append(allLogs, l)
		}
	}

	// Nejdůležitější logy nahoře (reverse order)
	for i, j := 0, len(allLogs)-1; i < j; i, j = i+1, j-1 {
		allLogs[i], allLogs[j] = allLogs[j], allLogs[i]
	}

	total := len(allLogs)
	totalPages := (total + pageSize - 1) / pageSize
	start := int(page-1) * pageSize
	end := start + pageSize

	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	paged := allLogs[start:end]
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data":        paged,
		"page":        page,
		"total":       total,
		"total_pages": totalPages,
	})
}
