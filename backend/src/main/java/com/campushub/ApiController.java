package com.campushub;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final JdbcTemplate db;
    public ApiController(JdbcTemplate db) { this.db = db; }

    private static final RowMapper<Map<String, Object>> STUDENT = (rs, i) -> {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("rollNo", rs.getString("roll_no"));
        m.put("name", rs.getString("name"));
        m.put("dept", rs.getString("dept"));
        m.put("section", rs.getString("section"));
        m.put("year", rs.getInt("year"));
        m.put("attendance", rs.getInt("attendance"));
        m.put("math", rs.getInt("math"));
        m.put("programming", rs.getInt("programming"));
        m.put("dbms", rs.getInt("dbms"));
        m.put("feeTotal", rs.getInt("fee_total"));
        m.put("feePaid", rs.getInt("fee_paid"));
        return m;
    };

    // body: { "type": "staff" | "student", "username": "...", "password": "..." }
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> b) {
        List<Map<String, Object>> rows = db.queryForList(
            "SELECT username, role FROM users WHERE username = ? AND password = ?",
            b.get("username"), b.get("password"));
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        String role = (String) rows.get(0).get("ROLE");
        boolean staff = !role.equals("STUDENT");
        if (staff != "staff".equals(b.get("type")))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong login type");
        return Map.of("username", rows.get(0).get("USERNAME"), "role", role);
    }

    @GetMapping("/students")
    public List<Map<String, Object>> students() {
        return db.query("SELECT * FROM students ORDER BY roll_no", STUDENT);
    }

    // Send only the fields you want to change.
    @PutMapping("/students/{roll}")
    public Map<String, Object> update(@PathVariable String roll, @RequestBody Map<String, Object> b) {
        int n = db.update("""
            UPDATE students SET name = COALESCE(?, name), attendance = COALESCE(?, attendance),
              math = COALESCE(?, math), programming = COALESCE(?, programming),
              dbms = COALESCE(?, dbms), fee_paid = COALESCE(?, fee_paid) WHERE roll_no = ?""",
            b.get("name"), b.get("attendance"), b.get("math"), b.get("programming"),
            b.get("dbms"), b.get("feePaid"), roll);
        if (n == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return db.queryForObject("SELECT * FROM students WHERE roll_no = ?", STUDENT, roll);
    }

    @GetMapping("/timetable")
    public List<Map<String, Object>> timetable(@RequestParam String day) {
        return db.queryForList("SELECT slot, subject, faculty, room FROM timetable WHERE day = ? ORDER BY id", day);
    }
}
