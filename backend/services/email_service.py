from fastapi_mail import (
    FastMail,
    MessageSchema,
    ConnectionConfig
)

conf = ConnectionConfig(
    MAIL_USERNAME="placeholder@gmail.com",
    MAIL_PASSWORD="YOUR_APP_PASSWORD",
    MAIL_FROM="placeholder@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
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