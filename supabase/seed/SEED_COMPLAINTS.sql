DO $$
DECLARE
    v_student_id UUID;
    v_room_id UUID;
BEGIN
    -- Get an active student
    SELECT id INTO v_student_id FROM students LIMIT 1;
    
    -- Get their room if they have one
    SELECT room_id INTO v_room_id FROM room_allocations WHERE student_id = v_student_id AND status = 'active' LIMIT 1;

    IF v_student_id IS NOT NULL THEN
        INSERT INTO complaints (student_id, room_id, ticket_number, title, description, category, priority, status)
        VALUES 
        (v_student_id, v_room_id, 'TKT-2026-9482', 'HVAC Unit Malfunction', 'The primary cooling unit in the room is making a severe rattling noise and not circulating air properly.', 'maintenance', 'high', 'open'),
        (v_student_id, v_room_id, 'TKT-2026-3104', 'Network Node Latency', 'Frequent disconnects from the main cluster. Telemetry shows massive packet loss during peak hours.', 'other', 'medium', 'open'),
        (v_student_id, v_room_id, 'TKT-2026-7721', 'Biometric Lock Jammed', 'The door lock mechanism is sticking and occasionally rejects authorized structural credentials.', 'security', 'critical', 'open');
    END IF;
END $$;
