
-- the question is: should i make this more generi or specific to what i want?
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,

    task_type TEXT,

    -- Schedule Definition
    frequency_type VARCHAR(20) NOT NULL CHECK (frequency_type IN ('once', 'recurring')),
    cron_expression TEXT, -- e.g. '0 15 * * 5' (Every Friday at 3pm)
    run_at TIMESTAMP WITH TIME ZONE, -- For one-off tasks
    
    -- Execution State
    payload JSONB NOT NULL, -- Details of requests to make
    enabled BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE, -- Calculated field for next execution
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_executions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES scheduled_tasks(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    log TEXT, -- Error messages or summary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
