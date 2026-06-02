import logging

from rest_framework_simplejwt.tokens import RefreshToken

from .models import User

logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    def register(validated_data: dict) -> User:
        user = User.objects.create_user(**validated_data)
        logger.info("New user registered: %s (role=%s)", user.email, user.role)
        return user

    @staticmethod
    def get_tokens_for_user(user: User) -> dict:
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    @staticmethod
    def logout(refresh_token: str) -> None:
        token = RefreshToken(refresh_token)
        token.blacklist()
        logger.info("Token blacklisted successfully")

    @staticmethod
    def change_password(user: User, new_password: str) -> None:
        user.set_password(new_password)
        user.save(update_fields=["password"])
        logger.info("Password changed for user: %s", user.email)
