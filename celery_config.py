broker_url = "redis://localhost:6379/0"
result_backend = "redis://localhost:6379/1"
timezone = "Asia/Kolkata"

beat_schedule = {
    "send-email-report-every-2-minutes": {
        "task": "monthly_report",
        "schedule": 120.0,
    },
}



