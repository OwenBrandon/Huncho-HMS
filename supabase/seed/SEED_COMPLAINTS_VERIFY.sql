-- Hardcoded seed using the validated active resident ID to guarantee execution
INSERT INTO complaints (student_id, ticket_number, title, description, category, priority, status)
VALUES 
('d38240ed-2c3f-4221-b2d5-da0dfaaa34a1', 'TKT-2026-9482', 'HVAC Unit Malfunction', 'The primary cooling unit in the room is making a severe rattling noise and not circulating air properly.', 'maintenance', 'high', 'open'),
('d38240ed-2c3f-4221-b2d5-da0dfaaa34a1', 'TKT-2026-3104', 'Network Node Latency', 'Frequent disconnects from the main cluster. Telemetry shows massive packet loss during peak hours.', 'other', 'medium', 'open'),
('d38240ed-2c3f-4221-b2d5-da0dfaaa34a1', 'TKT-2026-7721', 'Biometric Lock Jammed', 'The door lock mechanism is sticking and occasionally rejects authorized structural credentials.', 'security', 'critical', 'open')
ON CONFLICT (ticket_number) DO NOTHING;

-- Retrieve complaints to verify insertion
SELECT c.id, c.ticket_number, c.title, c.status, s.student_id 
FROM complaints c
JOIN students s ON c.student_id = s.id
WHERE c.ticket_number IN ('TKT-2026-9482', 'TKT-2026-3104', 'TKT-2026-7721');
