import os
from fastapi_mail import (
    FastMail,
    MessageSchema,
    ConnectionConfig
)

def get_env_bool(name: str, default: bool) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in ("true", "1", "yes")

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "placeholder@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "YOUR_APP_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM", "placeholder@gmail.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=get_env_bool("MAIL_STARTTLS", True),
    MAIL_SSL_TLS=get_env_bool("MAIL_SSL_TLS", False),
    USE_CREDENTIALS=get_env_bool("USE_CREDENTIALS", True)
)


async def send_email(
    recipient,
    subject,
    body
):

    message = MessageSchema(
        subject=subject,
        recipients=[recipient],
        body=body,
        subtype="html"
    )

    fm = FastMail(conf)

    await fm.send_message(message)